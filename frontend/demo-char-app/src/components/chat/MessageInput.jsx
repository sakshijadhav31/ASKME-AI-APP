

// import React, { useState, useRef, useLayoutEffect, useCallback } from "react";
// import PropTypes from "prop-types";
// import { SendHorizonal, Sparkles, Square } from "lucide-react";
// import { cn } from "../../lib/utils";

// /**
//  * MessageInput Component
//  * ----------------------
//  * A sophisticated, auto-expanding text input for the chat interface.
//  * Fixed: Added 'onStop' to the props destructuring to resolve ReferenceError.
//  */
// const MessageInput = ({ onSend, isTyping, onStop }) => {
//   const [inputValue, setInputValue] = useState("");
//   const textareaRef = useRef(null);

//   /**
//    * Auto-resize logic: Adjusts textarea height based on content.
//    */
//   useLayoutEffect(() => {
//     const node = textareaRef.current;
//     if (node) {
//       node.style.height = "inherit"; 
//       const scrollHeight = node.scrollHeight;
//       node.style.height = `${Math.min(scrollHeight, 200)}px`;
//     }
//   }, [inputValue]);

//   const handleSendMessage = useCallback(() => {
//     if (inputValue.trim() && !isTyping) {
//       onSend(inputValue);
//       setInputValue("");
//       if (textareaRef.current) textareaRef.current.style.height = "inherit";
//     }
//   }, [inputValue, isTyping, onSend]);

//   const handleKeyDown = (event) => {
//     if (event.key === "Enter" && !event.shiftKey) {
//       event.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="relative w-full max-w-3xl mx-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
//       <div className={cn(
//         "relative flex items-end gap-3 p-3 transition-all duration-500 rounded-[2rem] border shadow-2xl",
//         "bg-card/40 backdrop-blur-2xl border-border/40 shadow-black/20",
//         "focus-within:border-primary/40 focus-within:bg-card/60 focus-within:shadow-primary/5",
//         isTyping ? "opacity-90 shadow-none" : "opacity-100"
//       )}>
        
//         <div className="pb-2.5 pl-2 text-muted-foreground/40">
//           <Sparkles size={18} aria-hidden="true" />
//         </div>

//         <textarea
//           ref={textareaRef}
//           className={cn(
//             "flex-1 max-h-[200px] min-h-[44px] bg-transparent text-foreground px-1 py-2.5 outline-none resize-none text-[15px] leading-relaxed font-sans",
//             "placeholder:text-muted-foreground/30 custom-scrollbar disabled:cursor-not-allowed"
//           )}
//           rows="1"
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder={isTyping ? "Generating response..." : "Ask me anything..."}
//           disabled={isTyping}
//           aria-label="Chat input"
//         />
        
//         <div className="flex items-center">
//           {isTyping ? (
//             <button
//               type="button"
//               onClick={onStop}
//               className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
//               title="Stop generation"
//             >
//               <Square size={18} fill="currentColor" />
//             </button>
//           ) : (
//             <button 
//               type="button"
//               onClick={handleSendMessage} 
//               disabled={!inputValue.trim()}
//               className={cn(
//                 "flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 shadow-lg",
//                 !inputValue.trim()
//                   ? "text-muted-foreground/30 bg-muted/50 cursor-not-allowed shadow-none" 
//                   : "text-primary-foreground bg-primary hover:scale-105 active:scale-95 shadow-primary/20 hover:shadow-primary/40"
//               )}
//               title="Send message"
//             >
//               <SendHorizonal 
//                 size={20} 
//                 strokeWidth={2.5} 
//                 className={cn(inputValue.trim() && "animate-in slide-in-from-left-2")} 
//               />
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- Added Default Props for Safety ---
// MessageInput.defaultProps = {
//   onStop: () => {},
// };

// MessageInput.propTypes = {
//   onSend: PropTypes.func.isRequired,
//   isTyping: PropTypes.bool.isRequired,
//   onStop: PropTypes.func.isRequired,
// };

// export default MessageInput;


import React, { useState, useRef, useLayoutEffect, useCallback, memo } from "react";
import PropTypes from "prop-types";
import { SendHorizonal, Sparkles, Square } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Custom hook to handle textarea auto-resizing.
 * Max height is capped at 200px.
 */
const useAutoResize = (value) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (node) {
      node.style.height = "inherit";
      const scrollHeight = node.scrollHeight;
      node.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [value]);

  return ref;
};

/**
 * MessageInput Component
 * Sophisticated input field with auto-expansion and generation control.
 */
const MessageInput = ({ onSend, isTyping, onStop }) => {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useAutoResize(inputValue);

  /**
   * Resets the input state and textarea height.
   */
  const resetInput = useCallback(() => {
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
    }
  }, [textareaRef]);

  /**
   * Handler for sending messages with error safety.
   */
  const handleSendMessage = useCallback(() => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue || isTyping) return;

    try {
      if (typeof onSend === "function") {
        onSend(trimmedValue);
        resetInput();
      } else {
        console.error("MessageInput: onSend prop is not a function.");
      }
    } catch (error) {
      console.error("MessageInput: Failed to send message:", error);
    }
  }, [inputValue, isTyping, onSend, resetInput]);

  /**
   * Captures Enter key for submission (ignoring Shift+Enter).
   */
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Safe wrapper for stop generation.
   */
  const handleStop = () => {
    if (typeof onStop === "function") {
      onStop();
    }
  };

  return (
    <div 
      className="relative w-full max-w-3xl mx-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-700"
      role="form"
    >
      <div
        className={cn(
          "relative flex items-end gap-3 p-3 transition-all duration-500 rounded-[2rem] border shadow-2xl",
          "bg-card/40 backdrop-blur-2xl border-border/40 shadow-black/20",
          "focus-within:border-primary/40 focus-within:bg-card/60 focus-within:shadow-primary/5",
          isTyping ? "opacity-90 shadow-none pointer-events-none" : "opacity-100"
        )}
      >
        {/* Decorative Icon */}
        <div className="pb-2.5 pl-2 text-muted-foreground/40" aria-hidden="true">
          <Sparkles size={18} />
        </div>

        {/* Input Area */}
        <textarea
          ref={textareaRef}
          className={cn(
            "flex-1 max-h-[200px] min-h-[44px] bg-transparent text-foreground px-1 py-2.5",
            "outline-none resize-none text-[15px] leading-relaxed font-sans",
            "placeholder:text-muted-foreground/30 custom-scrollbar disabled:cursor-not-allowed"
          )}
          rows="1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isTyping ? "Generating response..." : "Ask me anything..."}
          disabled={isTyping}
          aria-label="Chat input field"
          aria-multiline="true"
          aria-busy={isTyping}
        />

        {/* Action Buttons */}
        <div className="flex items-center">
          {isTyping ? (
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center justify-center w-11 h-11 rounded-2xl 
                         transition-all duration-300 bg-destructive/10 text-destructive 
                         hover:bg-destructive hover:text-destructive-foreground 
                         focus-visible:ring-2 focus-visible:ring-destructive/50 outline-none"
              title="Stop generation"
              aria-label="Stop generating response"
            >
              <Square size={18} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className={cn(
                "flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                !inputValue.trim()
                  ? "text-muted-foreground/30 bg-muted/50 cursor-not-allowed shadow-none"
                  : "text-primary-foreground bg-primary hover:scale-105 active:scale-95 shadow-primary/20 hover:shadow-primary/40"
              )}
              title="Send message"
              aria-label="Send message"
            >
              <SendHorizonal
                size={20}
                strokeWidth={2.5}
                className={cn(inputValue.trim() && "animate-in slide-in-from-left-2")}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Component Standards ---

MessageInput.propTypes = {
  /** Function to handle message submission */
  onSend: PropTypes.func.isRequired,
  /** State indicating if the AI is currently generating */
  isTyping: PropTypes.bool.isRequired,
  /** Function to abort response generation */
  onStop: PropTypes.func,
};

MessageInput.defaultProps = {
  onStop: () => console.warn("MessageInput: onStop handler not implemented"),
};

// Optimization: Prevent re-renders unless props change
export default memo(MessageInput);