import axios from 'axios';

// Detect environment and set API URL
const getApiBaseUrl = () => {
  // If running on Render (production frontend)
  if (window.location.hostname.includes('jeien.com') || 
      window.location.hostname.includes('onrender.com')) {
    return 'https://jeien-backend.onrender.com';
  }
  
  // Use environment variable if set
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Default to local backend for development
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

console.log(`🌐 API Base URL: ${API_BASE_URL}`);
console.log(`🚀 Environment: ${import.meta.env.MODE}`);
console.log(`📍 Hostname: ${window.location.hostname}`);

// Base axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for Render
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Client': 'web-frontend',
    'X-Client-Version': '1.0.0'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      baseURL: error.config?.baseURL
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }

    // Handle network errors (Render might be sleeping)
    if (!error.response) {
      console.error('Network error - Backend might be sleeping on Render');
      
      // If using Render backend and it's sleeping, show message
      if (API_BASE_URL.includes('onrender.com')) {
        return Promise.reject({
          success: false,
          message: 'Backend is waking up. Please wait a moment and try again.',
          isRenderSleeping: true,
          originalError: error
        });
      }
    }

    return Promise.reject(error);
  }
);

// Helper to build URLs with /api prefix
const buildUrl = (url) => {
  return `/api${url.startsWith('/') ? url : '/' + url}`;
};

// API wrapper
const api = {
  // HTTP methods
  get: (url, config = {}) => axiosInstance.get(buildUrl(url), config),
  post: (url, data, config = {}) => axiosInstance.post(buildUrl(url), data, config),
  put: (url, data, config = {}) => axiosInstance.put(buildUrl(url), data, config),
  delete: (url, config = {}) => axiosInstance.delete(buildUrl(url), config),
  patch: (url, data, config = {}) => axiosInstance.patch(buildUrl(url), data, config),
  
  // Auth endpoints
  login: (email, password) => axiosInstance.post('/api/auth/login', { email, password }),
  register: (userData) => axiosInstance.post('/api/auth/register', userData),
  logout: () => axiosInstance.post('/api/auth/logout'),
  getProfile: () => axiosInstance.get('/api/auth/me'),
  
  // Health check
  health: () => axiosInstance.get('/api/health'),
  
  // Test endpoints
  testBackend: () => axiosInstance.get('/api/health').then(res => ({
    url: API_BASE_URL,
    status: res.status,
    data: res.data
  })),
  
  // Raw axios instance
  raw: axiosInstance,
  
  // Get current API URL
  getApiUrl: () => API_BASE_URL,
  
  // Switch API URL (useful for testing)
  switchBackend: (newUrl) => {
    console.log(`🔄 Switching backend from ${API_BASE_URL} to ${newUrl}`);
    localStorage.setItem('preferred_backend', newUrl);
    window.location.reload();
  }
};

// Test backend connection on startup
if (typeof window !== 'undefined') {
  // Wait a bit after page load
  setTimeout(() => {
    api.health()
      .then(res => {
        console.log(`✅ Connected to backend: ${API_BASE_URL}`);
        console.log('Backend info:', res.data);
      })
      .catch(err => {
        console.warn(`⚠️ Could not connect to ${API_BASE_URL}:`, err.message);
        
        // If local backend fails, suggest switching
        if (API_BASE_URL.includes('localhost') && import.meta.env.DEV) {
          console.log('💡 Tip: Is your local backend running? Try:');
          console.log('    npm run dev (in backend folder)');
          console.log('💡 Or switch to production backend:');
          console.log('    api.switchBackend("https://jeien-backend.onrender.com")');
        }
      });
  }, 2000);
}

export default api;