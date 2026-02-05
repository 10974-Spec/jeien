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
  timeout: 30000,
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log user info for debugging permissions
    console.log('🔐 Current user for request:', {
      id: user._id,
      role: user.role,
      email: user.email,
      hasToken: !!token
    });
    
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
  async (error) => {
    const originalRequest = error.config;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.error('🔴 API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      userRole: user.role,
      userId: user._id,
      backendUrl: API_BASE_URL
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await axiosInstance.post('/api/auth/refresh', {
            refreshToken
          });
          
          const { token, refreshToken: newRefreshToken } = refreshResponse.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }

    // Handle 403 Forbidden - IMPORTANT: Enhanced permission error handling
    if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden - Detailed permission check:');
      console.error('User Role:', user.role);
      console.error('User ID:', user._id);
      console.error('Request Path:', error.config?.url);
      console.error('Server Message:', error.response?.data?.message);
      
      // Create a more helpful error message
      const serverMessage = error.response?.data?.message || 'Permission denied';
      let userMessage = 'Permission denied. ';
      
      if (serverMessage.includes('vendor')) {
        userMessage += 'You need vendor privileges to manage products.';
      } else if (serverMessage.includes('admin')) {
        userMessage += 'You need admin privileges to perform this action.';
      } else if (serverMessage.includes('logged in')) {
        userMessage += 'Please log in with the correct account.';
      } else {
        userMessage += 'Your account does not have sufficient permissions.';
      }
      
      return Promise.reject({
        success: false,
        message: userMessage,
        status: 403,
        isPermissionError: true,
        originalError: error,
        userRole: user.role,
        requiredRole: error.response?.data?.requiredRole
      });
    }

    // Handle 400 Bad Request - often validation errors
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      let userMessage = 'Validation error: ';
      
      if (errorData.message) {
        userMessage += errorData.message;
      } else if (errorData.errors) {
        const errors = Object.values(errorData.errors).join(', ');
        userMessage += errors;
      }
      
      return Promise.reject({
        success: false,
        message: userMessage,
        status: 400,
        isValidationError: true,
        originalError: error
      });
    }

    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error - Backend might be unavailable');
      
      if (API_BASE_URL.includes('onrender.com')) {
        return Promise.reject({
          success: false,
          message: 'Backend service is temporarily unavailable. Please wait a moment and try again.',
          isNetworkError: true,
          isRenderSleeping: true
        });
      }
    }

    // Default error handling
    return Promise.reject({
      success: false,
      message: error.response?.data?.message || 'An unexpected error occurred',
      status: error.response?.status,
      originalError: error
    });
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
  
  // Role check helper
  checkProductPermissions: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!token) {
      return {
        canManage: false,
        reason: 'Not logged in',
        requiredRole: 'vendor or admin'
      };
    }
    
    const role = user.role?.toLowerCase();
    const canManage = role === 'vendor' || role === 'admin';
    
    return {
      canManage,
      userRole: role,
      userId: user._id,
      requiredRole: 'vendor or admin',
      reason: canManage ? '' : `User role "${role}" cannot manage products`
    };
  },
  
  // Raw axios instance
  raw: axiosInstance,
  
  getApiUrl: () => API_BASE_URL,
  
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role?.toLowerCase();
    
    return {
      hasToken: !!token,
      user: user,
      role: role,
      isAdmin: role === 'admin',
      isVendor: role === 'vendor',
      isBuyer: role === 'buyer' || !role,
      canManageProducts: role === 'vendor' || role === 'admin'
    };
  },
  
  getToken: () => localStorage.getItem('token'),
  
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
  },
  
  // Permission check before making product requests
  ensureProductPermissions: () => {
    const auth = api.isAuthenticated();
    
    if (!auth.hasToken) {
      throw new Error('Please log in to manage products');
    }
    
    if (!auth.canManageProducts) {
      throw new Error(`Your account (role: ${auth.role}) does not have permission to manage products. Requires vendor or admin role.`);
    }
    
    return auth;
  }
};

// Test backend connection on startup
if (typeof window !== 'undefined') {
  setTimeout(() => {
    api.health()
      .then(res => {
        console.log(`✅ Connected to backend: ${API_BASE_URL}`);
        
        const authStatus = api.isAuthenticated();
        console.log('🔐 Current auth status:', authStatus);
        
        if (authStatus.hasToken) {
          api.getProfile()
            .then(profileRes => {
              console.log('✅ Valid session, user:', profileRes.data);
              // Update localStorage with fresh user data
              if (profileRes.data.user) {
                localStorage.setItem('user', JSON.stringify(profileRes.data.user));
              }
            })
            .catch(profileErr => {
              console.warn('⚠️ Session validation failed:', profileErr.message);
              if (profileErr.response?.status === 401) {
                api.clearAuth();
                console.log('🔄 Cleared invalid session');
              }
            });
        }
      })
      .catch(err => {
        console.warn(`⚠️ Backend connection check:`, err.message);
      });
  }, 1000);
}

export default api;