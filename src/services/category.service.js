import api from './api'

const categoryService = {
  createCategory: (categoryData) => {
    const formData = new FormData()
    formData.append('name', categoryData.name)
    formData.append('description', categoryData.description || '')
    if (categoryData.parent) formData.append('parent', categoryData.parent)
    if (categoryData.commissionRate) formData.append('commissionRate', categoryData.commissionRate)
    if (categoryData.image) formData.append('image', categoryData.image)
    
    return api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  getAllCategories: (params) => api.get('/categories', { params }),
  
  getCategoryById: (id) => api.get(`/categories/${id}`),
  
  updateCategory: (id, categoryData) => {
    const formData = new FormData()
    Object.keys(categoryData).forEach(key => {
      if (key === 'image' && categoryData[key]) {
        formData.append('image', categoryData[key])
      } else {
        formData.append(key, categoryData[key])
      }
    })
    
    return api.put(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  
  getCategoryProducts: (id, params) => api.get(`/categories/${id}/products`, { params }),
  
  getFeaturedCategories: () => api.get('/categories/featured'),
}

export default categoryService