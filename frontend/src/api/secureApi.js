// Secure API configuration with httpOnly cookies support
import axios from 'axios';

const API_BASE_URL = '/api';

const secureApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies
  timeout: 10000, // 10 second timeout
});

// Request interceptor for automatic token refresh and CSRF protection
secureApi.interceptors.request.use(
  async (config) => {
    // No need to manually add Authorization header - httpOnly cookies handle this
    
    // Add CSRF token for stateful requests (POST, PUT, DELETE, PATCH)
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      const csrfToken = sessionStorage.getItem('csrf_token');
      if (csrfToken) {
        config.headers['X-CSRF-TOKEN'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for automatic token refresh
let isRefreshing = false;
let queued = [];

const resolveQueue = (error) => {
  queued.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  queued = [];
};

secureApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid retrying refresh endpoint itself
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queued.push({ resolve, reject });
        }).then(() => secureApi(originalRequest));
      }

      isRefreshing = true;
      try {
        await secureApi.post('/auth/refresh-token', {}, { withCredentials: true });
        resolveQueue(null);
        return secureApi(originalRequest);
      } catch (refreshError) {
        resolveQueue(refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default secureApi;
