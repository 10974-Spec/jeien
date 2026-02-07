import api from './api'

const vendorService = {
  registerVendor: (vendorData) => api.post('/vendors/register', vendorData),

  getVendorStore: () => api.get('/vendors/store'),

  updateVendorStore: (storeData) => api.put('/vendors/store', storeData),

  updateStoreImages: (formData) =>
    api.put('/vendors/store-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  updateBankDetails: (bankData) => api.put('/vendors/bank-details', bankData),

  getVendorStats: () => api.get('/vendors/stats'),

  getAllVendors: (params) => api.get('/vendors/all', { params }),

  getVendorById: (vendorId) => api.get(`/vendors/${vendorId}`),

  updateVendorStatus: (vendorId, statusData) =>
    api.put(`/vendors/${vendorId}/status`, statusData),

  getPublicVendorProfile: (vendorId) => api.get(`/vendors/public/${vendorId}`),
}

export default vendorService