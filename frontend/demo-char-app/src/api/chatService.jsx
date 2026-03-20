
import apiClient from './axiosInstance';

/**
 * Service to handle all Chat-related API interactions.
 * Standardizes API calls with robust error handling and timeout management.
 */
export const chatService = {
  
  /**
   * Fetches the list of all chat sessions.
   */
  getChats: async () => {
    try {
      const response = await apiClient.get('/chats/');
      return response.data;
    } catch (error) {
      console.error("ChatService [getChats]:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Retrieves message history for a specific chat.
   */
  getMessages: async (chatId) => {
    if (!chatId || chatId === "null" || chatId === "undefined") {
      return [];
    }

    try {
      const response = await apiClient.get(`/chats/${chatId}/messages`);
      return response.data;
    } catch (error) {
      console.error(`ChatService [getMessages] ID ${chatId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Deletes a specific chat session.
   * Added an extended timeout to prevent 401/timeout errors during slow DB operations.
   */
 deleteChat: async (chatId) => {
  // Defensive Check
  if (typeof chatId !== 'string' && typeof chatId !== 'number') {
    console.error("❌ ChatService: Invalid ID type passed to deleteChat:", chatId);
    throw new Error("Invalid Chat ID");
  }

  try {
    return await apiClient.delete(`/chats/${chatId}`, {
      timeout: 30000 
    });
  } catch (error) {
    console.error(`ChatService [deleteChat] ID ${chatId}:`, error.response?.data || error.message);
    throw error;
  }
},

  /**
   * Updates the title of a chat sessionn
   */
  updateChat: async (chatId, data, token) => {
  try {
    // API Call to /{chat_id}/title
    const response = await apiClient.put(`/chats/${chatId}/title`, data, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      },
      timeout: 20000 
    });
    return response.data;
  } catch (error) {
    console.error(`ChatService [updateChat] ID ${chatId}:`, error.response?.data || error.message);
    throw error;
  }
},

  /**
   * Handles AI Response Streaming using native fetch.
   * Utilizes the baseURL from axiosInstance for consistency.
   */
  streamChat: async (chatId, payload, token, signal) => {
    const baseUrl = apiClient.defaults.baseURL.replace(/\/$/, ""); // Remove trailing slash if exists
    const endpoint = chatId ? `/chats/${chatId}/messages` : `/chats/`;
    const fullUrl = `${baseUrl}${endpoint}`;

    if (!token) {
      throw new Error("Authentication token is missing.");
    }

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Stream error: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("StreamChat: Request aborted.");
      } else {
        console.error("ChatService [streamChat]:", error.message);
      }
      throw error;
    }
  }
};