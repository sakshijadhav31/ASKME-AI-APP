
import apiClient from './axiosInstance';

/**
 * Service to handle user-related authentication and synchronization.
 */
export const authService = {
  /**
   * Syncs the authenticated user's profile with the backend database.
   * This is typically called once after a successful Google Login.
   * * @param {string} token - The Google Credential/JWT token.
   * @returns {Promise<Object>} The synchronized user data from the backend.
   */
  syncUser: async (token) => {
    // Basic validation before making the network request
    if (!token) {
      console.error("AuthService: Missing token for syncUser");
      throw new Error("Authentication token is missing. Please login again.");
    }

    try {
      /**
       * Note: We send the token as a query parameter as required by your backend logic.
       * The 'Authorization' header is also automatically attached by our Axios Interceptor.
       */
      const response = await apiClient.post(
        `/users/sync-user`, 
        {}, // Empty body
        {
          params: { token },
          // Optional: Add a custom flag to identify this request in logs
          headers: { 'X-Action-Type': 'User-Sync' } 
        }
      );

      return response.data;
    } catch (error) {
      // Extracting the most relevant error message for the UI
      const errorMessage = error.response?.data?.detail || error.message || "Failed to sync user session.";
      
      console.error("AuthService Sync Error:", {
        status: error.response?.status,
        details: errorMessage
      });

      // Re-throwing a clean error object
      throw new Error(errorMessage);
    }
  },

  /**
   * Clears local authentication data.
   * Use this during the logout flow.
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cached_user_chats');
    // If using window.location for hard redirect:
    // window.location.href = '/login';
  }
};