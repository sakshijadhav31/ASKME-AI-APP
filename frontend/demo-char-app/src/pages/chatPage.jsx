


import React, { useState, useEffect, useRef, useCallback } from "react";

// UI Components
import Sidebar from "../components/sidebar/Sidebar"; 
import ChatHeader from "../components/layout/ChatHeader"; 
import ChatMessage from "../components/chat/ChatMessage"; 
import ChatInput from "../components/chat/MessageInput";
import TypingIndicator from "../components/chat/TypingIndicator";
import EmptyState from "../components/chat/EmptyState";

// Service Layer
import { chatService } from '../api/chatService';
import { authService } from '../api/authService';

const CHATS_CACHE_KEY = "cached_user_chats";

/**
 * ChatPage Component
 * ------------------
 * Main container for the ASK ME AI interface. Handles real-time streaming,
 * chat session management, and optimistic UI updates.
 */
function ChatPage({ user, onLogout }) {
  // --- State Management ---
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem(CHATS_CACHE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(chats.length === 0);
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash"); 
  const [copiedIndex, setCopiedIndex] = useState(-1);

  // --- Refs for Stream Control and DOM ---
  const abortControllerRef = useRef(null);
  const scrollRef = useRef(null);
  const isFirstRender = useRef(true);

  /**
   * Fetches the user's conversation history from the database.
   */
  const loadChats = useCallback(async () => {
    if (!user?.token) return;
    try {
      const data = await chatService.getChats(); 
      setChats(data);
      localStorage.setItem(CHATS_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("[ChatPage] Load Chats Error:", error);
      if (error.response?.status === 401) onLogout();
    } finally {
      setIsLoadingChats(false);
    }
  }, [user?.token, onLogout]);

  /**
   * Switches the active chat and loads its message history.
   * Aborts any ongoing AI response generation before switching.
   */
  const handleSelectChat = useCallback(async (id) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    
    if (!id || id === "null") {
      setActiveId(null);
      setMessages([]);
      return;
    }

    setActiveId(id); 
    setMessages([]); 
    setIsThinking(true);

    try {
      const data = await chatService.getMessages(id);
      setMessages(data || []);
    } catch (error) { 
      console.error("[ChatPage] Fetch Messages Error:", error);
    } finally { 
      setIsThinking(false); 
    }
  }, []);

  /**
   * Syncs user details with backend on first load and populates sidebar.
   */
  useEffect(() => { 
    const init = async () => {
      if (user?.token && isFirstRender.current) {
        isFirstRender.current = false;
        try {
          await authService.syncUser(user.token); 
          await loadChats();
        } catch (err) {
          console.error("[ChatPage] Auth Sync Failed:", err);
        }
      }
    };
    init();
  }, [user?.token, loadChats]);

  /**
   * Interrupts the current AI generation stream.
   */
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsThinking(false);
    }
  }, []);

  /**
   * Updates the title of a specific chat session.
   */
  const handleUpdateTitle = useCallback(async (chatId, newTitle) => {
    if (!newTitle.trim()) return;

    // Optimistic UI Update
    const previousChats = [...chats];
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));

    try {
      await chatService.updateChat(chatId, { title: newTitle }, user?.token);
      
      // Update cache after successful API call
      const updatedChats = chats.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      );
      localStorage.setItem(CHATS_CACHE_KEY, JSON.stringify(updatedChats));
    } catch (error) {
      console.error("[ChatPage] Update Title Failed:", error);
      setChats(previousChats); // Rollback on failure
      alert("Failed to update title. Please try again.");
    }
  }, [user?.token, chats]);

  /**
   * Deletes a chat session with an optimistic UI update.
   */
  const handleDeleteChat = useCallback(async (chatId) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    const previousChats = [...chats];
    
    // Optimistic UI Update
    setChats(prev => prev.filter(c => c.id !== chatId));

    if (activeId === chatId) {
      setActiveId(null);
      setMessages([]);
    }

    try {
      await chatService.deleteChat(chatId, user?.token);
      
      const updated = previousChats.filter(c => c.id !== chatId);
      localStorage.setItem(CHATS_CACHE_KEY, JSON.stringify(updated));
      console.log("[ChatPage] Chat deleted successfully.");
    } catch (error) {
      console.error("[ChatPage] Delete failed, rolling back UI:", error);
      setChats(previousChats); 
      alert("Delete failed. Please check your connection.");
    }
  }, [activeId, user?.token, chats]);

  const handleClearChat = useCallback(async () => {
  if (!activeId) return;
  
  // Optional: Add a confirmation dialog
  if (!window.confirm("Are you sure you want to clear all messages in this chat?")) return;

  try {
    // 1. Call your API to clear messages for this specific activeId
    // await chatService.clearMessages(activeId, user?.token);
    
    // 2. Clear the UI state
    setMessages([]);
    
    console.log("Chat cleared successfully");
  } catch (error) {
    console.error("Failed to clear chat:", error);
  }
}, [activeId, user?.token]);
  /**
   * Sends a message and processes the incoming data stream from the backend.
   */
  const handleSend = useCallback(async (text) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: "user", message: text }]);
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsThinking(true);

    try {
      const payload = { 
        message: text, 
        model_name: selectedModel, 
        history: [] 
      };

      const res = await chatService.streamChat(
        activeId, 
        payload, 
        user?.token, 
        abortControllerRef.current.signal
      );

      const newIdFromHeader = res.headers.get("x-chat-id");
      if (!activeId && newIdFromHeader) {
        setActiveId(newIdFromHeader);
        const newChat = { id: newIdFromHeader, title: text.substring(0, 30) };
        setChats(prev => [newChat, ...prev]);
      }

      setIsThinking(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      setMessages(prev => [...prev, { role: "assistant", message: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].role === "assistant") {
            updated[lastIndex] = { ...updated[lastIndex], message: updated[lastIndex].message + chunk };
          }
          return updated;
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("[ChatPage] Stream stopped by user.");
      } else {
        console.error("[ChatPage] Stream Error:", error);
        setMessages(prev => [...prev, { role: "assistant", message: "Connection lost. Please try again." }]);
      }
    } finally {
      setIsThinking(false);
      abortControllerRef.current = null;
    }
  }, [activeId, selectedModel, user?.token]);

  // --- UI Helpers ---
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <Sidebar 
        user={user}
        chats={chats} 
        activeId={activeId} 
        onDelete={handleDeleteChat}
        onUpdateTitle={handleUpdateTitle}
        onSelect={handleSelectChat}
        onNew={() => { setActiveId(null); setMessages([]); }}
        onLogout={onLogout} 
        isLoadingChats={isLoadingChats}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-background relative shadow-2xl">
        <ChatHeader selectedModel={selectedModel} setSelectedModel={setSelectedModel} onClearChat={handleClearChat} />

        <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scrollbar px-4">
          {messages.length === 0 && !isThinking ? (
            <EmptyState onSuggestion={handleSend} />
          ) : (
            <div className="max-w-3xl mx-auto py-10 flex flex-col gap-2">
              {messages.map((m, i) => (
                <ChatMessage 
                  key={i} m={m} i={i} 
                  handleCopy={handleCopy} 
                  copiedIndex={copiedIndex} 
                />
              ))}
              {isThinking && <TypingIndicator />}
            </div>
          )}
        </div>

        <div className="p-6 bg-gradient-to-t from-background via-background to-transparent">
          <ChatInput 
            onSend={handleSend} 
            isTyping={isThinking} 
            onStop={handleStopGeneration} 
          />
          <p className="text-[10px] text-center text-muted-foreground/40 mt-4 tracking-[0.2em] uppercase font-bold">
              AskMe AI can make mistakes. Check important info
          </p>
        </div>
      </main>
    </div>
  );
}

export default ChatPage;

// import React, { useState, useEffect, useRef, useCallback, memo } from "react";
// import PropTypes from "prop-types";

// // UI Components
// import Sidebar from "../components/sidebar/Sidebar"; 
// import ChatHeader from "../components/layout/ChatHeader"; 
// import ChatMessage from "../components/chat/ChatMessage"; 
// import ChatInput from "../components/chat/MessageInput";
// import TypingIndicator from "../components/chat/TypingIndicator";
// import EmptyState from "../components/chat/EmptyState";

// // Service Layer
// import { chatService } from '../api/chatService';
// import { authService } from '../api/authService';
// import { cn } from "../lib/utils";

// const CHATS_CACHE_KEY = "cached_user_chats";

// /**
//  * ChatPage Component
//  * Orchestrates the chat experience, streaming, and session history.
//  */
// function ChatPage({ user, onLogout }) {
//   // --- State: Persistent & UI ---
//   const [chats, setChats] = useState(() => {
//     const saved = localStorage.getItem(CHATS_CACHE_KEY);
//     return saved ? JSON.parse(saved) : [];
//   });
  
//   const [activeId, setActiveId] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [isThinking, setIsThinking] = useState(false);
//   const [isLoadingChats, setIsLoadingChats] = useState(chats.length === 0);
//   const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash"); 
//   const [copiedIndex, setCopiedIndex] = useState(-1);

//   // --- Refs: Controller & DOM ---
//   const abortControllerRef = useRef(null);
//   const scrollRef = useRef(null);
//   const isFirstRender = useRef(true);

//   /**
//    * Syncs the chat list with LocalStorage whenever it changes.
//    */
//   useEffect(() => {
//     localStorage.setItem(CHATS_CACHE_KEY, JSON.stringify(chats));
//   }, [chats]);

//   /**
//    * Fetch conversation history.
//    */
//   const loadChats = useCallback(async () => {
//     if (!user?.token) return;
//     try {
//       const data = await chatService.getChats(); 
//       setChats(data || []);
//     } catch (error) {
//       console.error("[ChatPage] History Sync Error:", error);
//       if (error.response?.status === 401) onLogout();
//     } finally {
//       setIsLoadingChats(false);
//     }
//   }, [user?.token, onLogout]);

//   /**
//    * Initializes the session.
//    */
//   useEffect(() => { 
//     if (user?.token && isFirstRender.current) {
//       isFirstRender.current = false;
//       authService.syncUser(user.token)
//         .then(loadChats)
//         .catch(err => console.error("[ChatPage] Init Sync Error:", err));
//     }
//   }, [user?.token, loadChats]);

//   /**
//    * Selects a chat and loads history.
//    */
//   const handleSelectChat = useCallback(async (id) => {
//     // Abort existing streams before switching
//     if (abortControllerRef.current) abortControllerRef.current.abort();
    
//     if (!id) {
//       setActiveId(null);
//       setMessages([]);
//       return;
//     }

//     setActiveId(id); 
//     setMessages([]); 
//     setIsThinking(true);

//     try {
//       const data = await chatService.getMessages(id);
//       setMessages(data || []);
//     } catch (error) { 
//       console.error("[ChatPage] Message Load Error:", error);
//     } finally { 
//       setIsThinking(false); 
//     }
//   }, []);
// const handleDeleteChat = useCallback(async (chatId) => {
//     if (!window.confirm("Are you sure you want to delete this chat?")) return;

//     const previousChats = [...chats];
    
//     // Optimistic UI Update
//     setChats(prev => prev.filter(c => c.id !== chatId));

//     if (activeId === chatId) {
//       setActiveId(null);
//       setMessages([]);
//     }

//     try {
//       await chatService.deleteChat(chatId, user?.token);
      
//       const updated = previousChats.filter(c => c.id !== chatId);
//       localStorage.setItem(CHATS_CACHE_KEY, JSON.stringify(updated));
//       console.log("[ChatPage] Chat deleted successfully.");
//     } catch (error) {
//       console.error("[ChatPage] Delete failed, rolling back UI:", error);
//       setChats(previousChats); 
//       alert("Delete failed. Please check your connection.");
//     }
//   }, [activeId, user?.token, chats]);

//   const handleUpdateTitle = useCallback(async (chatId, newTitle) => {
//     if (!newTitle.trim()) return;

  
//     const previousChats = [...chats];
//     setChats(prev => prev.map(chat => 
//       chat.id === chatId ? { ...chat, title: newTitle } : chat
//     ));

//     try {
//       await chatService.updateChat(chatId, { title: newTitle }, user?.token);
      
//       // Update cache after successful API call
//       const updatedChats = chats.map(chat => 
//         chat.id === chatId ? { ...chat, title: newTitle } : chat
//       );
//       localStorage.setItem(CHATS_CACHE_KEY, JSON.stringify(updatedChats));
//     } catch (error) {
//       console.error("[ChatPage] Update Title Failed:", error);
//       setChats(previousChats); // Rollback on failure
//       alert("Failed to update title. Please try again.");
//     }
//   }, [user?.token, chats]);
//   /**
//    * Stops an active stream.
//    */
//   const handleStopGeneration = useCallback(() => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//       abortControllerRef.current = null;
//       setIsThinking(false);
//     }
//   }, []);

//   /**
//    * Handles the AI response stream.
//    */
//   const handleSend = useCallback(async (text) => {
//     const trimmedText = text.trim();
//     if (!trimmedText) return;

//     // 1. Update UI with User Message
//     setMessages(prev => [...prev, { role: "user", message: trimmedText }]);
    
//     if (abortControllerRef.current) abortControllerRef.current.abort();
//     abortControllerRef.current = new AbortController();
//     setIsThinking(true);

//     try {
//       const payload = { 
//         message: trimmedText, 
//         model_name: selectedModel, 
//         history: messages.slice(-10) // Send recent context
//       };

//       const res = await chatService.streamChat(
//         activeId, 
//         payload, 
//         user?.token, 
//         abortControllerRef.current.signal
//       );

//       // 2. Detect New Chat ID from Headers
//       const newIdFromHeader = res.headers.get("x-chat-id");
//       if (!activeId && newIdFromHeader) {
//         setActiveId(newIdFromHeader);
//         setChats(prev => [{ id: newIdFromHeader, title: trimmedText.slice(0, 40) }, ...prev]);
//       }

//       setIsThinking(false);

//       // 3. Process the stream
//       const reader = res.body.getReader();
//       const decoder = new TextDecoder();
      
//       // Initialize Assistant Bubble
//       setMessages(prev => [...prev, { role: "assistant", message: "" }]);

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
        
//         const chunk = decoder.decode(value, { stream: true });
        
//         setMessages(prev => {
//           const updated = [...prev];
//           const lastMsg = updated[updated.length - 1];
//           if (lastMsg && lastMsg.role === "assistant") {
//             updated[updated.length - 1] = { ...lastMsg, message: lastMsg.message + chunk };
//           }
//           return updated;
//         });
//       }
//     } catch (error) {
//       if (error.name === 'AbortError') return;
      
//       console.error("[ChatPage] Stream Error:", error);
//       setMessages(prev => [...prev, { 
//         role: "assistant", 
//         message: "⚠️ Connection lost. I've stopped receiving data. Please try again." 
//       }]);
//     } finally {
//       setIsThinking(false);
//       abortControllerRef.current = null;
//     }
//   }, [activeId, selectedModel, user?.token, messages]);

//   /**
//    * Utility: Auto-scroll with smart detection.
//    */
//   useEffect(() => {
//     const container = scrollRef.current;
//     if (!container) return;

//     // Only scroll if the user is already near the bottom (prevents hijacking)
//     const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
    
//     if (isNearBottom) {
//       container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
//     }
//   }, [messages, isThinking]);

//   return (
//     <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
//       {/* Sidebar - History & Sessions */}
//       <Sidebar 
//         user={user}
//         chats={chats} 
//         activeId={activeId} 
//         onDelete={handleDeleteChat} // Implementation assumed from previous refactor
//         onUpdateTitle={handleUpdateTitle} // Implementation assumed from previous refactor
//         onSelect={handleSelectChat}
//         onNew={() => { setActiveId(null); setMessages([]); }}
//         onLogout={onLogout} 
//         isLoadingChats={isLoadingChats}
//       />

//       {/* Main Chat Interface */}
//       <main className="flex-1 flex flex-col min-w-0 bg-background relative border-l border-border/20">
//         <ChatHeader selectedModel={selectedModel} setSelectedModel={setSelectedModel} />

//         {/* Message Viewport */}
//         <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scrollbar px-4 custom-scroll-mask">
//           {messages.length === 0 && !isThinking ? (
//             <EmptyState onSuggestion={handleSend} />
//           ) : (
//             <div className="max-w-3xl mx-auto py-12 flex flex-col gap-6">
//               {messages.map((m, i) => (
//                 <ChatMessage 
//                   key={`${activeId}-${i}`} 
//                   m={m} 
//                   i={i} 
//                   handleCopy={(text) => {
//                     navigator.clipboard.writeText(text);
//                     setCopiedIndex(i);
//                     setTimeout(() => setCopiedIndex(-1), 2000);
//                   }} 
//                   copiedIndex={copiedIndex} 
//                 />
//               ))}
//               {isThinking && <TypingIndicator />}
//             </div>
//           )}
//         </div>

//         {/* Input Area */}
//         <div className="p-6 bg-gradient-to-t from-background via-background to-transparent z-10">
//           <ChatInput 
//             onSend={handleSend} 
//             isTyping={isThinking} 
//             onStop={handleStopGeneration} 
//           />
//           <footer className="text-[10px] text-center text-muted-foreground/30 mt-4 tracking-widest uppercase font-bold">
//             ASK ME AI • Model: {selectedModel}
//           </footer>
//         </div>
//       </main>
//     </div>
//   );
// }

// ChatPage.propTypes = {
//   user: PropTypes.object.isRequired,
//   onLogout: PropTypes.func.isRequired,
// };

// export default memo(ChatPage);