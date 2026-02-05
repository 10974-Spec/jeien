import api from './api';
import { retryWithBackoff, executeSequentially } from '../utils/retryWithBackoff';

class ProductService {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // FIXED: Enhanced permission check with role validation
  checkProductPermissions() {
    const auth = api.isAuthenticated();
    
    console.log('🔍 Checking product permissions:', {
      hasToken: auth.hasToken,
      userRole: auth.role,
      canManageProducts: auth.canManageProducts,
      userId: auth.user._id
    });
    
    if (!auth.hasToken) {
      throw new Error('Please log in to manage products');
    }
    
    if (!auth.canManageProducts) {
      // Get user-friendly role name
      let roleName = auth.role || 'unknown';
      if (roleName === 'buyer') roleName = 'customer';
      
      throw new Error(`Your account (${roleName} account) cannot manage products. 
        You need a vendor or admin account. 
        Please contact support if you need vendor privileges.`);
    }
    
    return auth;
  }

  async getAllProducts(params = {}, useCache = true) {
    const cacheKey = `products:${JSON.stringify(params)}`;
    
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await retryWithBackoff(
        () => api.get('/products', { params }),
        2,
        1000
      );

      if (useCache) {
        this.setCache(cacheKey, response);
      }

      return response;
    } catch (error) {
      console.error('Failed to fetch products:', error.message);
      
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
      
      throw error;
    }
  }

  async getProductById(id) {
    const cacheKey = `product:${id}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await retryWithBackoff(
        () => api.get(`/products/${id}`),
        2,
        1000
      );

      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error.message);
      throw error;
    }
  }

  // FIXED: Create product with better permission handling
  async createProduct(formData) {
    try {
      // Check permissions BEFORE making request
      const auth = this.checkProductPermissions();
      console.log('✅ Permission check passed for product creation:', {
        userId: auth.user._id,
        role: auth.role
      });
      
      // Prepare headers
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${api.getToken()}`
      };
      
      // Log for debugging
      console.log('📤 Creating product with data:');
      for (let [key, value] of formData.entries()) {
        if (key === 'images') {
          console.log(`  ${key}: File - ${value.name || 'unknown'}`);
        } else if (key === 'category') {
          console.log(`  ${key}: ${value} (type: ${typeof value})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      // Validate category (common issue)
      const categoryValue = formData.get('category');
      if (!categoryValue || categoryValue.trim() === '') {
        throw new Error('Category is required');
      }
      
      // Make the request
      const response = await api.post('/products', formData, { headers });
      
      // Clear cache for products to reflect new addition
      this.clearCache();
      
      console.log('✅ Product created successfully');
      return response;
    } catch (error) {
      console.error('❌ Product creation failed:', error);
      
      // Handle specific error cases with better messages
      if (error.isPermissionError) {
        // This comes from api.js interceptor
        throw new Error(error.message);
      }
      
      if (error.response?.status === 403) {
        const auth = api.isAuthenticated();
        throw new Error(`Permission denied. Your account (role: ${auth.role}) cannot create products. 
          Requires vendor or admin role.`);
      }
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.message === 'Category not found') {
          throw new Error('The selected category does not exist. Please choose a valid category.');
        } else if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).join(', ');
          throw new Error(`Validation errors: ${errorMessages}`);
        } else if (errorData.message) {
          throw new Error(errorData.message);
        }
      }
      
      // Generic error
      throw error;
    }
  }

  // FIXED: Update product with permission check
  async updateProduct(id, formData) {
    try {
      // Check permissions
      const auth = this.checkProductPermissions();
      console.log(`✅ Permission check passed for updating product ${id}`);
      
      // Prepare headers
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${api.getToken()}`
      };
      
      // Debug log
      console.log(`📤 Updating product ${id}`);
      
      const response = await api.put(`/products/${id}`, formData, { headers });

      // Clear cache
      this.cache.delete(`product:${id}`);
      this.clearCache();
      
      console.log('✅ Product updated successfully');
      return response;
    } catch (error) {
      console.error(`❌ Failed to update product ${id}:`, error);
      
      if (error.isPermissionError) {
        throw new Error(error.message);
      }
      
      if (error.response?.status === 403) {
        throw new Error('Permission denied. You can only update your own products or need admin access.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Product not found. It may have been deleted.');
      }
      
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      // Check permissions
      this.checkProductPermissions();
      
      const response = await api.delete(`/products/${id}`);

      // Clear cache
      this.cache.delete(`product:${id}`);
      this.clearCache();
      
      return response;
    } catch (error) {
      console.error(`Failed to delete product ${id}:`, error.message);
      throw error;
    }
  }

  async getFeaturedProducts(limit = 12) {
    return this.getAllProducts({
      featured: true,
      published: true,
      approved: true,
      limit,
      sortBy: 'featured'
    }, true);
  }

  async getNewArrivals(limit = 8) {
    return this.getAllProducts({
      published: true,
      approved: true,
      limit,
      sortBy: 'newest'
    }, true);
  }

  async getBestSellers(limit = 8) {
    return this.getAllProducts({
      published: true,
      approved: true,
      limit,
      sortBy: 'sales'
    }, true);
  }

  async getTrendingProducts(limit = 8) {
    return this.getAllProducts({
      published: true,
      approved: true,
      limit,
      sortBy: 'trending'
    }, true);
  }

  async getHomepageData() {
    const tasks = [
      () => this.getFeaturedProducts(12),
      () => this.getNewArrivals(8),
      () => this.getBestSellers(8),
      () => this.getTrendingProducts(8)
    ];

    try {
      const [featured, newArrivals, bestSellers, trending] = await executeSequentially(tasks, 800);
      
      return {
        featured: featured.data?.products || [],
        newArrivals: newArrivals.data?.products || [],
        bestSellers: bestSellers.data?.products || [],
        trending: trending.data?.products || []
      };
    } catch (error) {
      console.error('Failed to fetch homepage data:', error);
      return {
        featured: [],
        newArrivals: [],
        bestSellers: [],
        trending: []
      };
    }
  }

  async searchProducts(query, filters = {}) {
    const params = {
      search: query,
      ...filters,
      limit: filters.limit || 20,
      page: filters.page || 1
    };

    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await retryWithBackoff(
        () => api.get('/products/search', { params }),
        2,
        1000
      );

      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Search failed:', error.message);
      throw error;
    }
  }

  async getRelatedProducts(productId, limit = 4) {
    try {
      const response = await retryWithBackoff(
        () => api.get(`/products/${productId}/related`, {
          params: { limit }
        }),
        1,
        1000
      );
      return response;
    } catch (error) {
      console.error(`Failed to get related products for ${productId}:`, error);
      return { data: [] };
    }
  }

  async getVendorProducts(params = {}) {
    try {
      this.checkProductPermissions();
      
      const response = await api.get('/products/vendor/my', {
        params,
        headers: {
          'Authorization': `Bearer ${api.getToken()}`
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch vendor products:', error.message);
      throw error;
    }
  }

  async updateProductStock(id, stockData) {
    try {
      this.checkProductPermissions();
      
      const response = await api.put(`/products/${id}/stock`, stockData, {
        headers: {
          'Authorization': `Bearer ${api.getToken()}`
        }
      });
      return response;
    } catch (error) {
      console.error(`Failed to update stock for product ${id}:`, error.message);
      throw error;
    }
  }

  async bulkUpdateProducts(ids, updates) {
    try {
      this.checkProductPermissions();
      
      const response = await api.put('/products/bulk/update', { ids, updates }, {
        headers: {
          'Authorization': `Bearer ${api.getToken()}`
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to bulk update products:', error.message);
      throw error;
    }
  }
}

export default new ProductService();