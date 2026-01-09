import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jeien-backend.onrender.com';

// Request Queue Class
class RequestQueue {
  constructor(maxRequestsPerSecond = 2) {
    this.queue = [];
    this.processing = false;
    this.maxRequestsPerSecond = maxRequestsPerSecond;
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.resetInterval = null;
    
    // Reset request count every second
    this.resetInterval = setInterval(() => {
      this.requestCount = 0;
    }, 1000);
  }

  async add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      // Check rate limit
      if (this.requestCount >= this.maxRequestsPerSecond) {
        await new Promise(resolve => setTimeout(resolve, 1000 / this.maxRequestsPerSecond));
        this.requestCount = 0;
      }
      
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const minDelay = 1000 / this.maxRequestsPerSecond;
      
      if (timeSinceLastRequest < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastRequest));
      }
      
      const { request, resolve, reject } = this.queue.shift();
      this.lastRequestTime = Date.now();
      this.requestCount++;
      
      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    
    this.processing = false;
  }

  destroy() {
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
    }
  }
}

// Initialize queue
const requestQueue = new RequestQueue(2); // 2 requests per second

// Base axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'X-Client': 'web-frontend'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add API key if available
    const apiKey = localStorage.getItem('api_key');
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }
    
    // Handle Content-Type for FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      // Let browser set the boundary
      delete config.headers['Content-Type'];
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = Date.now() + Math.random().toString(36).substr(2, 9);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log rate limit headers
    const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
    const rateLimitReset = response.headers['x-ratelimit-reset'];
    
    if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
      console.warn(`Rate limit low: ${rateLimitRemaining} requests remaining. Reset at: ${rateLimitReset}`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details
    console.error('API Error:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    // Handle 429 - Rate Limit
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      
      // Retry the request
      return axiosInstance(originalRequest);
    }
    
    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - Check internet connection');
      
      // Return a structured error response
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your internet connection.',
        isNetworkError: true,
        originalError: error
      });
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
      
      return Promise.reject({
        success: false,
        message: 'Server error. Please try again later.',
        status: error.response.status,
        data: error.response.data
      });
    }
    
    // For other errors, pass through the error response
    return Promise.reject(error.response?.data || {
      success: false,
      message: 'An unexpected error occurred'
    });
  }
);

// Queued API wrapper
const api = {
  get: (url, config = {}) => requestQueue.add(() => axiosInstance.get(url, config)),
  post: (url, data, config = {}) => requestQueue.add(() => axiosInstance.post(url, data, config)),
  put: (url, data, config = {}) => requestQueue.add(() => axiosInstance.put(url, data, config)),
  delete: (url, config = {}) => requestQueue.add(() => axiosInstance.delete(url, config)),
  patch: (url, data, config = {}) => requestQueue.add(() => axiosInstance.patch(url, data, config)),
  head: (url, config = {}) => requestQueue.add(() => axiosInstance.head(url, config)),
  options: (url, config = {}) => requestQueue.add(() => axiosInstance.options(url, config)),
  
  // Raw axios for non-queued requests
  raw: axiosInstance,
  
  // Cancel token source
  CancelToken: axios.CancelToken,
  isCancel: axios.isCancel,
  
  // Clear queue
  clearQueue: () => {
    requestQueue.queue = [];
  },
  
  // Get queue stats
  getQueueStats: () => ({
    queueLength: requestQueue.queue.length,
    isProcessing: requestQueue.processing,
    requestCount: requestQueue.requestCount
  }),
  
  // Set rate limit
  setRateLimit: (maxRequestsPerSecond) => {
    requestQueue.maxRequestsPerSecond = maxRequestsPerSecond;
  }
};

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    requestQueue.destroy();
  });
}

export default api;