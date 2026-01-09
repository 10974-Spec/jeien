import api from './api';
import { retryWithBackoff, executeSequentially } from '../utils/retryWithBackoff';

class ProductService {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  // Get from cache
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    return null;
  }

  // Set cache
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get all products with retry logic
  async getAllProducts(params = {}, useCache = true) {
    const cacheKey = `products:${JSON.stringify(params)}`;
    
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('Cache hit for products');
        return cached;
      }
    }

    try {
      const response = await retryWithBackoff(
        () => api.get('/products', { params }),
        2, // max retries
        1000 // base delay
      );

      if (useCache) {
        this.setCache(cacheKey, response);
      }

      return response;
    } catch (error) {
      console.error('Failed to fetch products:', error.message);
      
      // Return cached data even if stale
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('Returning stale cached products');
        return cached;
      }
      
      throw error;
    }
  }

  // Get single product
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

  // Get featured products
  async getFeaturedProducts(limit = 12) {
    return this.getAllProducts({
      featured: true,
      published: true,
      approved: true,
      limit,
      sortBy: 'featured'
    }, true);
  }

  // Get new arrivals
  async getNewArrivals(limit = 8) {
    return this.getAllProducts({
      published: true,
      approved: true,
      limit,
      sortBy: 'newest'
    }, true);
  }

  // Get best sellers
  async getBestSellers(limit = 8) {
    return this.getAllProducts({
      published: true,
      approved: true,
      limit,
      sortBy: 'sales'
    }, true);
  }

  // Get trending products
  async getTrendingProducts(limit = 8) {
    return this.getAllProducts({
      published: true,
      approved: true,
      limit,
      sortBy: 'trending'
    }, true);
  }

  // Sequential fetching for homepage (to avoid rate limits)
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

  // Search products
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

  // Get related products
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
}

export default new ProductService();