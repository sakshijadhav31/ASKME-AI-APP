// import React, { useEffect, useRef, useState, useCallback } from "react";
// import PropTypes from "prop-types";
// import { Zap } from "lucide-react";

// // Component Imports
// import ChatHeader from "../layout/ChatHeader";
// import ChatMessage from "./ChatMessage";
// import ChatInput from "./ChatInput";
// import ChatControls from "./ChatControls";
// import { cn } from "../../lib/utils";

// /**
//  * ChatWindow Component
//  * The primary container for the chat interface. It manages:
//  * 1. Message history rendering
//  * 2. Auto-scrolling to the latest message
//  * 3. User prompt editing and submission
//  * 4. Empty state (Welcome Screen) presentation
//  */
// const ChatWindow = ({ 
//   messages, onSend, isTyping, isThinking, 
//   onStop, isPaused, onResume, 
//   selectedModel, setSelectedModel 
// }) => {
//   const scrollEndRef = useRef(null);
//   const [copiedIndex, setCopiedIndex] = useState(null);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editValue, setEditValue] = useState("");

//   /**
//    * Automatically scrolls the viewport to the bottom of the message list.
//    * Triggered whenever messages change or the AI begins 'thinking'.
//    */
//   const scrollToBottom = useCallback(() => {
//     scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isThinking, scrollToBottom]);

//   /**
//    * Handles text copying to the system clipboard with a temporary success state.
//    */
//   const handleCopy = (text, index) => {
//     navigator.clipboard.writeText(text).then(() => {
//       setCopiedIndex(index);
//       setTimeout(() => setCopiedIndex(null), 2000);
//     });
//   };

//   /**
//    * Initiates the inline editing mode for a specific user message.
//    */
//   const startEditing = (text, index) => {
//     setEditingIndex(index);
//     setEditValue(text);
//   };

//   /**
//    * Submits the edited version of a previous user message.
//    */
//   const submitEdit = () => {
//     if (editValue.trim()) {
//       onSend(editValue);
//       setEditingIndex(null);
//       setEditValue("");
//     }
//   };

//   return (
//     <div className="flex flex-col h-full w-full bg-background relative overflow-hidden transition-colors duration-500">
      
//       {/* 1. Header Navigation */}
//       <ChatHeader 
//         selectedModel={selectedModel} 
//         setSelectedModel={setSelectedModel} 
//       />

//       {/* 2. Chat Viewport (Scrollable Area) */}
//       <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar bg-transparent flex flex-col">
//         {messages.length === 0 && !isThinking ? (
          
//           /* Empty State / Welcome Screen */
//           <div className="flex-1 flex flex-col items-center justify-center select-none animate-in fade-in duration-700">
//             <div className="w-20 h-20 mb-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.05)]">
//               <Zap size={40} className="text-primary fill-primary/20" />
//             </div>
//             <h2 className="text-2xl font-bold uppercase tracking-[0.4em] text-foreground/80">Nexus AI</h2>
//             <div className="flex items-center gap-2 mt-3 opacity-40">
//               <div className="h-[1px] w-8 bg-foreground"></div>
//               <p className="text-[10px] font-bold uppercase tracking-widest">v2.4 Obsidian Edition</p>
//               <div className="h-[1px] w-8 bg-foreground"></div>
//             </div>
//           </div>
          
//         ) : (
//           <div className="flex flex-col w-full pb-32">
//             {/* Iterative Message Rendering */}
//             {messages.map((m, i) => (
//               <ChatMessage 
//                 key={`${i}-${m.role}`} 
//                 m={m} i={i}
//                 copiedIndex={copiedIndex} handleCopy={handleCopy}
//                 editingIndex={editingIndex} startEditing={startEditing}
//                 editValue={editValue} setEditValue={setEditValue}
//                 submitEdit={submitEdit} cancelEdit={() => setEditingIndex(null)}
//               />
//             ))}

//             {/* AI Thinking / Streaming Indicator */}
//             {isThinking && (
//               <div className="flex w-full gap-4 md:gap-6 py-10 px-4 bg-muted/20 border-b border-border/10">
//                 <div className="max-w-3xl mx-auto flex w-full gap-4 md:gap-6">
//                   <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]">
//                     <Zap size={18} className="animate-pulse" />
//                   </div>
//                   <div className="flex flex-col gap-2.5 pt-1">
//                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Nexus AI</span>
//                     <div className="flex gap-2 items-center px-1">
//                       <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
//                       <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
//                       <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {/* Invisible Anchor for Scrolling */}
//             <div ref={scrollEndRef} className="h-4" />
//           </div>
//         )}
//       </div>

//       {/* 3. Interaction Overlay (Fixed Bottom) */}
//       <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background/95 to-transparent pt-20 pb-6 pointer-events-none">
//         <div className="max-w-3xl mx-auto px-4 flex flex-col items-center pointer-events-auto">
          
//           {/* Action Controls (Stop/Resume) */}
//           <ChatControls 
//             isTyping={isTyping} 
//             isPaused={isPaused} 
//             onStop={onStop} 
//             onResume={onResume} 
//           />

//           {/* User Input Field */}
//           <ChatInput 
//             onSend={onSend} 
//             disabled={isTyping || isThinking} 
//           />
          
//           <p className="text-[10px] text-center text-muted-foreground/50 mt-4 font-bold uppercase tracking-widest">
//             Ask ME AI can make mistakes. Verify critical information.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// ChatWindow.propTypes = {
//   messages: PropTypes.array.isRequired,
//   onSend: PropTypes.func.isRequired,
//   isTyping: PropTypes.bool.isRequired,
//   isThinking: PropTypes.bool.isRequired,
//   onStop: PropTypes.func.isRequired,
//   isPaused: PropTypes.bool.isRequired,
//   onResume: PropTypes.func.isRequired,
//   selectedModel: PropTypes.string.isRequired,
//   setSelectedModel: PropTypes.func.isRequired,
// };

// export default ChatWindow;


import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Zap, AlertCircle } from "lucide-react";

// Component Imports
import ChatHeader from "../layout/ChatHeader";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatControls from "./ChatControls";
import { cn } from "../../lib/utils";

/**
 * ChatWindow Component
 * --------------------
 * The central UI controller for the chat experience.
 * Manages scrolling, message editing, and component lifecycle for the viewport.
 */
const ChatWindow = ({ 
  messages = [], 
  onSend, 
  isTyping, 
  isThinking, 
  onStop, 
  isPaused, 
  onResume, 
  selectedModel, 
  setSelectedModel 
}) => {
  // --- Refs ---
  const scrollViewportRef = useRef(null);
  const scrollEndRef = useRef(null);

  // --- State ---
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  /**
   * Optimized Auto-Scroll
   * Uses a smooth scroll to the invisible anchor at the bottom of the list.
   */
  const scrollToBottom = useCallback(() => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);

  // Trigger scroll whenever message history updates or AI begins processing
  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  /**
   * Clipboard Management
   * Provides visual feedback by setting a temporary 'copied' index.
   */
  const handleCopy = useCallback((text, index) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch((err) => console.error("Clipboard copy failed:", err));
  }, []);

  /**
   * Message Editing Logic
   */
  const startEditing = (text, index) => {
    setEditValue(text);
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const submitEdit = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue) {
      onSend(trimmedValue);
      cancelEdit();
    }
  };

  /**
   * Render Empty State
   */
  const renderWelcomeScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center select-none animate-in fade-in zoom-in-95 duration-700">
      <div className="w-20 h-20 mb-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-center justify-center shadow-lg">
        <Zap size={40} className="text-primary fill-primary/20" />
      </div>
      <h2 className="text-2xl font-bold uppercase tracking-[0.4em] text-foreground/80">Nexus AI</h2>
      <div className="flex items-center gap-2 mt-3 opacity-40">
        <div className="h-[1px] w-8 bg-foreground"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest">v2.4 Obsidian Edition</p>
        <div className="h-[1px] w-8 bg-foreground"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-background relative overflow-hidden">
      
      {/* 1. Sticky Navigation Header */}
      <ChatHeader 
        selectedModel={selectedModel} 
        setSelectedModel={setSelectedModel} 
      />

      {/* 2. Scrollable Message Viewport */}
      <div 
        ref={scrollViewportRef}
        className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar flex flex-col relative"
      >
        {messages.length === 0 && !isThinking ? (
          renderWelcomeScreen()
        ) : (
          <div className="flex flex-col w-full pb-48 pt-4">
            {/* Performance Note: Using index as key is acceptable here 
                since we only append to the end of the array. 
            */}
            {messages.map((message, index) => (
              <ChatMessage 
                key={`${index}-${message.role}`} 
                m={message} 
                i={index}
                copiedIndex={copiedIndex} 
                handleCopy={handleCopy}
                editingIndex={editingIndex} 
                startEditing={startEditing}
                editValue={editValue} 
                setEditValue={setEditValue}
                submitEdit={submitEdit} 
                cancelEdit={cancelEdit}
              />
            ))}

            {/* AI Thinking / Streaming Indicator */}
            {isThinking && (
              <div className="flex w-full gap-4 md:gap-6 py-10 px-4 bg-muted/10 border-y border-border/5 animate-in fade-in duration-300">
                <div className="max-w-3xl mx-auto flex w-full gap-4 md:gap-6">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                    <Zap size={18} className="animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-2.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Nexus AI</span>
                    <div className="flex gap-1.5 items-center px-1">
                      {[0, 150, 300].map((delay) => (
                        <div 
                          key={delay}
                          style={{ animationDelay: `${delay}ms` }}
                          className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll Anchor */}
            <div ref={scrollEndRef} className="h-4 w-full flex-shrink-0" />
          </div>
        )}
      </div>

      {/* 3. Bottom Interface Overlay */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background/95 to-transparent pt-24 pb-8 pointer-events-none">
        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center pointer-events-auto">
          
          {/* Generation State Controls */}
          <ChatControls 
            isTyping={isTyping} 
            isPaused={isPaused} 
            onStop={onStop} 
            onResume={onResume} 
          />

          {/* Prompt Submission Field */}
          <div className="w-full relative">
            <ChatInput 
              onSend={onSend} 
              disabled={isTyping || isThinking} 
            />
          </div>
          
          <p className="text-[10px] text-center text-muted-foreground/40 mt-5 font-bold uppercase tracking-widest leading-none">
            ASK ME AI can make mistakes. Verify critical information.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Prop Validation ---
ChatWindow.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.string,
      message: PropTypes.string,
    })
  ).isRequired,
  onSend: PropTypes.func.isRequired,
  isTyping: PropTypes.bool.isRequired,
  isThinking: PropTypes.bool.isRequired,
  onStop: PropTypes.func.isRequired,
  isPaused: PropTypes.bool.isRequired,
  onResume: PropTypes.func.isRequired,
  selectedModel: PropTypes.string.isRequired,
  setSelectedModel: PropTypes.func.isRequired,
};

export default ChatWindow;