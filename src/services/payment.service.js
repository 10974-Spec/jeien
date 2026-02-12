import api from './api';

const paymentService = {
  /**
   * Initiate M-Pesa payment
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.orderId - Order ID
   * @param {string} paymentData.phone - Phone number (072xxxxxxx)
   * @param {number} paymentData.amount - Amount to pay
   */
  initiateMpesaPayment: (paymentData) => {
    console.log('Initiating M-Pesa payment:', paymentData);
    return api.post('/payments/mpesa', paymentData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },

  /**
   * Process PayPal payment
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.orderId - Order ID
   * @param {string} paymentData.paymentId - PayPal payment ID
   */
  processPayPalPayment: (paymentData) => {
    console.log('Processing PayPal payment:', paymentData);
    return api.post('/payments/paypal', paymentData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },

  /**
   * Process card payment
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.orderId - Order ID
   * @param {string} paymentData.token - Payment token from Stripe/Flutterwave
   * @param {number} paymentData.amount - Amount to pay
   * @param {string} paymentData.currency - Currency code (default: KES)
   */
  processCardPayment: (paymentData) => {
    console.log('Processing card payment:', {
      ...paymentData,
      token: paymentData.token ? `${paymentData.token.substring(0, 10)}...` : 'missing'
    });
    return api.post('/payments/card', paymentData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },

  /**
   * Get payment status for an order
   * @param {string} orderId - Order ID
   */
  getPaymentStatus: (orderId) => {
    console.log('Getting payment status for order:', orderId);
    return api.get(`/payments/status/${orderId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },

  /**
   * Get available payment methods
   */
  getPaymentMethods: () => {
    console.log('Getting payment methods');
    return api.get('/payments/methods', {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },

  /**
   * Test M-Pesa payment (development only)
   * @param {Object} testData - Test payment data
   */
  testMpesaPayment: (testData) => {
    console.log('Testing M-Pesa payment:', testData);
    return api.post('/payments/test/mpesa', testData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },

  /**
   * Manually complete a payment (development only - for real M-Pesa payments on localhost)
   * @param {string} orderId - Order ID to complete
   */
  manualCompletePayment: (orderId) => {
    console.log('Manually completing payment for order:', orderId);
    return api.post('/payments/manual-complete', { orderId }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
};

export default paymentService;