import api from './api'

const productService = {
  getAllProducts: (params = {}) => {
    console.log('=== PRODUCT SERVICE: getAllProducts called ===');
    console.log('Params received:', params);
    console.log('Type of params:', typeof params);
    
    // Handle different types of params
    let queryParams = {};
    
    if (typeof params === 'string') {
      console.log('Params is a string, parsing...');
      // If it's a string like "?admin=true&limit=100", remove the ? and parse
      const cleanString = params.startsWith('?') ? params.substring(1) : params;
      const urlParams = new URLSearchParams(cleanString);
      queryParams = Object.fromEntries(urlParams.entries());
    } else if (typeof params === 'object' && params !== null) {
      console.log('Params is an object, using directly');
      queryParams = params;
    } else {
      console.log('Params is undefined or null, using empty object');
      queryParams = {};
    }
    
    console.log('Final query params:', queryParams);
    return api.get('/products', { params: queryParams });
  },
  
  getProductById: (id) => {
    console.log('=== PRODUCT SERVICE: getProductById called ===');
    console.log('Product ID:', id);
    return api.get(`/products/${id}`);
  },
  
  createProduct: (productData) => {
    console.log('=== PRODUCT SERVICE: createProduct called ===');
    console.log('Type of productData:', typeof productData);
    console.log('Is FormData?', productData instanceof FormData);
    
    let formData;
    
    // Check if productData is already FormData
    if (productData instanceof FormData) {
      console.log('Already FormData, using directly');
      formData = productData;
    } else {
      // If it's an object, convert to FormData
      console.log('Converting object to FormData');
      formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        const value = productData[key];
        console.log(`Processing key: ${key}, value:`, value);
        
        if (key === 'images' && Array.isArray(value)) {
          // Handle images array
          value.forEach((file, index) => {
            if (file instanceof File) {
              formData.append('images', file);
              console.log(`Appended image ${index}: ${file.name}`);
            } else {
              console.log(`Image ${index} is not a File object:`, file);
            }
          });
        } else if (key === 'attributes' || key === 'specifications' || key === 'tags' || key === 'shipping' || key === 'variants') {
          // Stringify complex objects
          if (value && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
            console.log(`Appended ${key} as JSON:`, value);
          }
        } else {
          // Append simple values
          if (value !== undefined && value !== null) {
            formData.append(key, value);
            console.log(`Appended ${key}: ${value}`);
          }
        }
      });
    }
    
    // Debug: Log all FormData entries
    console.log('=== FormData Contents ===');
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: File - ${pair[1].name} (${pair[1].size} bytes, ${pair[1].type})`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
    
    // IMPORTANT: Do NOT set Content-Type header manually
    // Axios will automatically set it for FormData
    return api.post('/products', formData);
  },
  
  updateProduct: (id, productData) => {
    console.log('=== PRODUCT SERVICE: updateProduct called ===');
    console.log('Product ID:', id);
    console.log('Product data type:', typeof productData);
    
    let formData;
    
    if (productData instanceof FormData) {
      formData = productData;
    } else {
      formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        const value = productData[key];
        
        if (key === 'images' && Array.isArray(value)) {
          value.forEach(file => {
            if (file instanceof File) {
              formData.append('images', file);
            }
          });
        } else if (key === 'attributes' || key === 'specifications' || key === 'tags' || key === 'shipping' || key === 'variants' || key === 'seo' || key === 'removeImages') {
          if (value && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          }
        } else {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        }
      });
    }
    
    console.log('=== Update FormData Contents ===');
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: File - ${pair[1].name}`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
    
    return api.put(`/products/${id}`, formData);
  },
  
  deleteProduct: (id) => {
    console.log('=== PRODUCT SERVICE: deleteProduct called ===');
    console.log('Product ID:', id);
    return api.delete(`/products/${id}`);
  },
  
  getVendorProducts: (params = {}) => {
    console.log('=== PRODUCT SERVICE: getVendorProducts called ===');
    console.log('Params:', params);
    
    let queryParams = {};
    if (typeof params === 'string') {
      const cleanString = params.startsWith('?') ? params.substring(1) : params;
      const urlParams = new URLSearchParams(cleanString);
      queryParams = Object.fromEntries(urlParams.entries());
    } else if (typeof params === 'object' && params !== null) {
      queryParams = params;
    }
    
    return api.get('/products/vendor/my', { params: queryParams });
  },
  
  searchProducts: (query) => {
    console.log('=== PRODUCT SERVICE: searchProducts called ===');
    console.log('Search query:', query);
    return api.get(`/products/search?q=${encodeURIComponent(query)}`);
  },
  
  updateStock: (id, stockData) => {
    console.log('=== PRODUCT SERVICE: updateStock called ===');
    console.log('Product ID:', id);
    console.log('Stock data:', stockData);
    
    return api.put(`/products/${id}/stock`, stockData);
  },
  
  bulkUpdateProducts: (data) => {
    console.log('=== PRODUCT SERVICE: bulkUpdateProducts called ===');
    console.log('Bulk update data:', data);
    
    return api.put('/products/bulk/update', data);
  },
  
  // Test function for debugging
  testCreateProduct: () => {
    console.log('=== TEST: Creating product with hardcoded data ===');
    
    const testFormData = new FormData();
    testFormData.append('title', 'Test Product from Service');
    testFormData.append('description', 'This is a test product');
    testFormData.append('price', '99.99');
    testFormData.append('stock', '10');
    testFormData.append('category', '695cd1c13876fe34c7a01367'); // cars category
    
    // Log what's in test FormData
    console.log('=== Test FormData Contents ===');
    for (let pair of testFormData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    
    return api.post('/products', testFormData);
  },
  
  // Helper function to convert query string to object
  parseQueryString: (queryString) => {
    if (!queryString) return {};
    const cleanString = queryString.startsWith('?') ? queryString.substring(1) : queryString;
    const urlParams = new URLSearchParams(cleanString);
    return Object.fromEntries(urlParams.entries());
  },
  
  // Helper function to convert object to query string
  toQueryString: (params = {}) => {
    if (!params || Object.keys(params).length === 0) return '';
    const urlParams = new URLSearchParams(params);
    return `?${urlParams.toString()}`;
  }
}

export default productService