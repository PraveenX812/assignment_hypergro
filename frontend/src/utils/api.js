import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000 // 15 second timeout
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] ${config.method.toUpperCase()} ${config.url} - Request started`);
    } else {
      console.warn('[API] No auth token found for request:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`[API] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
    return response;
  },
  (error) => {
    if (error.config) {
      const endTime = new Date();
      const duration = endTime - error.config.metadata.startTime;
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error(
          `[API] ${error.config.method.toUpperCase()} ${error.config.url} - ` +
          `Error ${error.response.status}: ${error.response.statusText} (${duration}ms)`
        );
        
        // Log response data if available
        if (error.response.data) {
          console.error('[API] Error details:', error.response.data);
        }
        
        // Handle 401 Unauthorized responses
        if (error.response.status === 401) {
          console.warn('[Auth] Session expired or invalid token');
          // Clear the invalid token
          localStorage.removeItem('token');
          
          // Only redirect if not already on the login page
          if (!window.location.pathname.includes('/login')) {
            // Store current URL to redirect back after login
            const currentPath = window.location.pathname + window.location.search;
            localStorage.setItem('redirectAfterLogin', currentPath);
            // Redirect to login page
            window.location.href = '/login';
          }
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error(`[API] No response received for ${error.config.url}`, error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('[API] Request setup error:', error.message);
      }
    } else {
      console.error('[API] Error without config:', error);
    }
    
    return Promise.reject(error);
  }
);

export default api;
