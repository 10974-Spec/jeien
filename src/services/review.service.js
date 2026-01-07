import api from './api'

const reviewService = {
  createReview: (reviewData) => {
    const formData = new FormData()
    Object.keys(reviewData).forEach(key => {
      if (key === 'images' && Array.isArray(reviewData[key])) {
        reviewData[key].forEach(file => {
          formData.append('images', file)
        })
      } else if (key === 'attributes') {
        formData.append(key, JSON.stringify(reviewData[key]))
      } else {
        formData.append(key, reviewData[key])
      }
    })
    
    return api.post('/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  
  getVendorReviews: (params) => api.get('/reviews/vendor/my', { params }),
  
  updateReview: (id, reviewData) => {
    const formData = new FormData()
    Object.keys(reviewData).forEach(key => {
      if (key === 'images' && Array.isArray(reviewData[key])) {
        reviewData[key].forEach(file => {
          formData.append('images', file)
        })
      } else if (key === 'attributes') {
        formData.append(key, JSON.stringify(reviewData[key]))
      } else {
        formData.append(key, reviewData[key])
      }
    })
    
    return api.put(`/reviews/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  
  addReplyToReview: (id, replyData) => api.post(`/reviews/${id}/reply`, replyData),
  
  updateReply: (id, replyData) => api.put(`/reviews/${id}/reply`, replyData),
  
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  
  reportReview: (id, reportData) => api.post(`/reviews/${id}/report`, reportData),
  
  moderateReview: (id, moderationData) => api.put(`/reviews/${id}/moderate`, moderationData),
  
  getAllReviews: (params) => api.get('/reviews/admin/all', { params }),
}

export default reviewService