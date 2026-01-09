import api from './api';

const categoryService = {
  createCategory: (categoryData) => {
    console.log('=== CATEGORY SERVICE: CREATE CATEGORY ===');
    console.log('Received data:', categoryData);
    console.log('Type of data:', typeof categoryData);
    console.log('Is FormData?', categoryData instanceof FormData);
    
    let formData;
    
    if (categoryData instanceof FormData) {
      formData = categoryData;
      console.log('Using provided FormData');
    } else if (categoryData && typeof categoryData === 'object') {
      formData = new FormData();
      console.log('Creating FormData from object');
      
      // Append all fields from the object
      Object.keys(categoryData).forEach(key => {
        if (key === 'image' && categoryData[key] instanceof File) {
          formData.append(key, categoryData[key]);
          console.log(`Appended file: ${key} = ${categoryData[key].name} (${categoryData[key].size} bytes)`);
        } else if (categoryData[key] !== undefined && categoryData[key] !== null) {
          // Convert to string and append
          const value = String(categoryData[key]);
          formData.append(key, value);
          console.log(`Appended: ${key} = ${value}`);
        }
      });
    } else {
      console.error('Invalid data received:', categoryData);
      throw new Error('Invalid category data');
    }
    
    // Log FormData contents for debugging
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      const [key, value] = pair;
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: "${value}"`);
      }
    }
    
    return api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getAllCategories: (params) => {
    console.log('categoryService.getAllCategories - params:', params);
    return api.get('/categories', { params });
  },
  
  getCategoryById: (id) => {
    console.log('categoryService.getCategoryById - id:', id);
    return api.get(`/categories/${id}`);
  },
  
  updateCategory: (id, categoryData) => {
    console.log('=== CATEGORY SERVICE: UPDATE CATEGORY ===');
    console.log('Category ID:', id);
    console.log('Received data:', categoryData);
    
    let formData;
    
    if (categoryData instanceof FormData) {
      formData = categoryData;
      console.log('Using provided FormData');
    } else if (categoryData && typeof categoryData === 'object') {
      formData = new FormData();
      console.log('Creating FormData from object');
      
      Object.keys(categoryData).forEach(key => {
        if (key === 'image' && categoryData[key] instanceof File) {
          formData.append(key, categoryData[key]);
          console.log(`Appended file: ${key} = ${categoryData[key].name}`);
        } else if (categoryData[key] !== undefined && categoryData[key] !== null) {
          const value = String(categoryData[key]);
          formData.append(key, value);
          console.log(`Appended: ${key} = ${value}`);
        }
      });
    } else {
      console.error('Invalid data received:', categoryData);
      throw new Error('Invalid category data');
    }
    
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      const [key, value] = pair;
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: "${value}"`);
      }
    }
    
    return api.put(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteCategory: (id) => {
    console.log('categoryService.deleteCategory - id:', id);
    return api.delete(`/categories/${id}`);
  },
  
  getCategoryProducts: (id, params) => {
    console.log('categoryService.getCategoryProducts - id:', id, 'params:', params);
    return api.get(`/categories/${id}/products`, { params });
  },
  
  getFeaturedCategories: () => {
    console.log('categoryService.getFeaturedCategories');
    return api.get('/categories/featured');
  },
};

export default categoryService;