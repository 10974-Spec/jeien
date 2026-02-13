import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsService from '../services/analytics.service';

const useAnalytics = () => {
    const location = useLocation();

    // Track page views on route change
    useEffect(() => {
        const page = location.pathname;
        const title = document.title;
        analyticsService.trackPageView(page, title);
    }, [location]);

    return {
        trackProductView: analyticsService.trackProductView,
        trackAddToCart: analyticsService.trackAddToCart,
        trackRemoveFromCart: analyticsService.trackRemoveFromCart,
        trackCheckoutStart: analyticsService.trackCheckoutStart,
        trackPurchase: analyticsService.trackPurchase,
        trackSearch: analyticsService.trackSearch
    };
};

export default useAnalytics;
