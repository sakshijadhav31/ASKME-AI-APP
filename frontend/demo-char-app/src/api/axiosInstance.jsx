import axios from 'axios';

/**
 * Global Axios Instance Configuration
 * This instance centralizes the Base URL and default headers.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // 20-second timeout for better UX on slow networks
});

/**
 * Request Interceptor
 * Automatically injects the Authorization header before every request is sent.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Standard Bearer token implementation
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles global API responses and error states (e.g., 401 Unauthorized).
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return the response directly if successful
    return response;
  },
  (error) => {
    // Handle 401 (Unauthorized) globally
    if (error.response && error.response.status === 401) {
      console.error("Session expired or unauthorized. Logging out...");
      
      // Clear local storage to prevent infinite loops of failed requests
      localStorage.removeItem('token');
      localStorage.removeItem('cached_user_chats');
      
      // Optional: Redirect user to login page if window is available
      if (typeof window !== 'undefined') {
        window.location.href = '/login'; 
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;