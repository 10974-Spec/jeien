import api from './api';

const notificationService = {
    // Get all notifications
    getNotifications: async (params = {}) => {
        const response = await api.get('/notifications', { params });
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },

    // Mark as read
    markAsRead: async (id) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    // Mark all as read
    markAllAsRead: async () => {
        const response = await api.patch('/notifications/mark-all-read');
        return response.data;
    },

    // Delete notification
    deleteNotification: async (id) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },

    // Delete all notifications
    deleteAllNotifications: async () => {
        const response = await api.delete('/notifications/all/delete');
        return response.data;
    }
};

export default notificationService;
