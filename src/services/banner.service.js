import api from './api'

const bannerService = {
  createAd: (adData) => {
    console.log('bannerService.createAd called');
    console.log('Is FormData?', adData instanceof FormData);
    
    if (adData instanceof FormData) {
      console.log('Using FormData upload');
      
      // Debug: Log FormData contents
      console.log('FormData entries:');
      for (let [key, value] of adData.entries()) {
        console.log(`${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
      }
      
      return api.post('/ads', adData)
        .catch(error => {
          console.error('Create ad FormData error:', error.response || error);
          throw error;
        });
    }
    
    console.log('Using JSON upload');
    return api.post('/ads', adData)
      .catch(error => {
        console.error('Create ad JSON error:', error.response || error);
        throw error;
      });
  },
  
  getAllAds: (params = {}) => {
    return api.get('/ads', { params })
      .catch(error => {
        console.error('Get all ads error:', error.response || error);
        throw error;
      });
  },
  
  getAdById: (id) => {
    return api.get(`/ads/${id}`)
      .catch(error => {
        console.error('Get ad by ID error:', error.response || error);
        throw error;
      });
  },
  
  updateAd: (id, adData) => {
    if (adData instanceof FormData) {
      return api.put(`/ads/${id}`, adData)
        .catch(error => {
          console.error('Update ad FormData error:', error.response || error);
          throw error;
        });
    }
    return api.put(`/ads/${id}`, adData)
      .catch(error => {
        console.error('Update ad JSON error:', error.response || error);
        throw error;
      });
  },
  
  deleteAd: (id) => {
    return api.delete(`/ads/${id}`)
      .catch(error => {
        console.error('Delete ad error:', error.response || error);
        throw error;
      });
  },
  
  getActiveAds: (params) => {
    return api.get('/ads/active', { params })
      .catch(error => {
        console.error('Get active ads error:', error.response || error);
        throw error;
      });
  },
  
  trackAdView: (id) => {
    return api.post(`/ads/${id}/view`)
      .catch(error => {
        console.error('Track ad view error:', error.response || error);
        throw error;
      });
  },
  
  trackAdClick: (id) => {
    return api.post(`/ads/${id}/click`)
      .catch(error => {
        console.error('Track ad click error:', error.response || error);
        throw error;
      });
  },
  
  getAdAnalytics: (id) => {
    return api.get(`/ads/${id}/analytics`)
      .catch(error => {
        console.error('Get ad analytics error:', error.response || error);
        throw error;
      });
  },
  
  approveAd: (id, data) => {
    return api.put(`/ads/${id}/approve`, data)
      .catch(error => {
        console.error('Approve ad error:', error.response || error);
        throw error;
      });
  }
}

export default bannerService