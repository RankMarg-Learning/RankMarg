// api.ts
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({ keepAlive: true });

const baseURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

const api = axios.create({
  baseURL,
  httpsAgent,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, 
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token and handle caching
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching for auth-critical requests
    if (config.url?.includes('/auth/')) {
      config.params = { ...config.params, _t: Date.now() };
    }

    // Add cache control for GET requests
    if (config.method === 'get') {
      config.headers['Cache-Control'] = 'no-store';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired or invalid - clear any cached auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_cache');
        sessionStorage.removeItem('auth_cache');
        
        // Redirect to login if not already on auth page
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/sign-in') && !currentPath.startsWith('/sign-up')) {
          window.location.href = '/sign-in';
        }
      }
    } else if (error.response?.status >= 500) {
      // Server error - could implement retry logic here
      console.error('Server error:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      console.error('Request timeout:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
