import api from './api'

const orderService = {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   */
  createOrder: (orderData) => {
    console.log('Creating order with data:', orderData)
    return api.post('/orders', orderData, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
  },

  /**
   * Get order by ID
   * @param {string} id - Order ID
   */
  getOrderById: (id) => {
    console.log('Getting order by ID:', id)
    return api.get(`/orders/${id}`)
  },

  /**
   * Get user's orders
   * @param {Object} params - Query parameters
   */
  getUserOrders: (params = {}) => {
    console.log('Getting user orders with params:', params)
    return api.get('/orders/user/me', { params })
  },

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {Object} data - Update data
   */
  updateOrderStatus: (id, data) => {
    console.log('Updating order status:', { id, data })
    return api.put(`/orders/${id}/status`, data)
  },

  /**
   * Cancel order
   * @param {string} id - Order ID
   * @param {Object} data - Cancellation data
   */
  cancelOrder: (id, data = {}) => {
    console.log('Cancelling order:', { id, data })
    return api.post(`/orders/${id}/cancel`, data)
  },

  /**
   * Search orders
   * @param {string} query - Search query
   */
  searchOrders: (query) => {
    console.log('Searching orders:', query)
    return api.get(`/orders/search?q=${encodeURIComponent(query)}`)
  },

  /**
   * Get all orders (admin only)
   * @param {Object} params - Query parameters
   */
  getAllOrders: (params = {}) => {
    console.log('Getting all orders with params:', params)
    return api.get('/orders/admin/all', { params })
  },

  /**
   * Track order by order ID
   * @param {string} orderId - Order tracking ID
   */
  trackOrder: (orderId) => {
    console.log('Tracking order:', orderId)
    return api.get(`/orders/track/${orderId}`)
  }
}

export default orderService