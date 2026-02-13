import api from './api';

const adminService = {
    // Database reset (admin only)
    resetDatabase: async (confirmationCode) => {
        const response = await api.post('/admin/database/reset', { confirmationCode });
        return response.data;
    },

    // Get security logs (admin only)
    getSecurityLogs: async () => {
        const response = await api.get('/admin/security/logs');
        return response.data;
    },

    // Get payment tracking (admin only)
    getPaymentTracking: async (params = {}) => {
        const response = await api.get('/admin/payments/tracking', { params });
        return response.data;
    }
};

export default adminService;
