import api from './api'

const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  
  getMyOrders: (params) => api.get('/orders/my', { params }),
  
  getOrderById: (id) => api.get(`/orders/${id}`),
  
  getAllOrders: (params) => api.get('/orders/admin/all', { params }),
  
  updateOrderStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  
  trackOrder: (orderId) => api.get(`/orders/track/${orderId}`),
}

export default orderService