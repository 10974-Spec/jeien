import api from './api';

const messageService = {
    // Send a message (public - no auth required)
    sendMessage: async (messageData) => {
        const response = await api.post('/messages', messageData);
        return response.data;
    },

    // Get all messages (admin only)
    getAllMessages: async (params = {}) => {
        const response = await api.get('/messages', { params });
        return response.data;
    },

    // Update message status (admin only)
    updateMessageStatus: async (messageId, status) => {
        const response = await api.patch(`/messages/${messageId}/status`, { status });
        return response.data;
    },

    // Reply to message (admin only)
    replyToMessage: async (messageId, replyMessage) => {
        const response = await api.post(`/messages/${messageId}/reply`, { replyMessage });
        return response.data;
    },

    // Delete message (admin only)
    deleteMessage: async (messageId) => {
        const response = await api.delete(`/messages/${messageId}`);
        return response.data;
    }
};

export default messageService;
