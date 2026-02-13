import api from './api';

// Generate unique session ID
const getSessionId = () => {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
};

const analyticsService = {
    // Track any event
    trackEvent: async (type, data = {}) => {
        try {
            const sessionId = getSessionId();
            const userId = localStorage.getItem('userId') || null;

            await api.post('/analytics/track', {
                sessionId,
                type,
                data,
                userId
            });
        } catch (error) {
            // Fail silently - don't disrupt user experience
            console.error('Analytics tracking error:', error);
        }
    },

    // Track page view
    trackPageView: (page, title) => {
        return analyticsService.trackEvent('PAGE_VIEW', { page, title });
    },

    // Track product view
    trackProductView: (productId, title) => {
        return analyticsService.trackEvent('PRODUCT_VIEW', { productId, title });
    },

    // Track add to cart
    trackAddToCart: (productId, title, quantity = 1) => {
        return analyticsService.trackEvent('ADD_TO_CART', { productId, title, quantity });
    },

    // Track remove from cart
    trackRemoveFromCart: (productId, title) => {
        return analyticsService.trackEvent('REMOVE_FROM_CART', { productId, title });
    },

    // Track checkout start
    trackCheckoutStart: (amount, itemCount) => {
        return analyticsService.trackEvent('CHECKOUT_START', { amount, itemCount });
    },

    // Track purchase
    trackPurchase: (orderId, amount, itemCount) => {
        return analyticsService.trackEvent('PURCHASE', { orderId, amount, itemCount });
    },

    // Track search
    trackSearch: (query, resultsCount) => {
        return analyticsService.trackEvent('SEARCH', { query, resultsCount });
    },

    // Admin: Get analytics overview
    getOverview: async (period = '7d') => {
        const response = await api.get('/analytics/overview', { params: { period } });
        return response.data;
    },

    // Admin: Get visit stats
    getVisitStats: async (period = '7d') => {
        const response = await api.get('/analytics/visits', { params: { period } });
        return response.data;
    },

    // Admin: Get product views
    getProductViews: async (period = '7d', limit = 10) => {
        const response = await api.get('/analytics/products', { params: { period, limit } });
        return response.data;
    },

    // Admin: Get top pages
    getTopPages: async (period = '7d', limit = 10) => {
        const response = await api.get('/analytics/pages', { params: { period, limit } });
        return response.data;
    },

    // Admin: Get device breakdown
    getDeviceBreakdown: async (period = '7d') => {
        const response = await api.get('/analytics/devices', { params: { period } });
        return response.data;
    },

    // Admin: Get realtime visitors
    getRealtimeVisitors: async () => {
        const response = await api.get('/analytics/realtime');
        return response.data;
    }
};

export default analyticsService;
