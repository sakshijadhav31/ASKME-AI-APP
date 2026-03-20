// import React from "react";
// import { Bot } from "lucide-react";
// import { cn } from "../../lib/utils";

// /**
//  * TypingIndicator Component
//  * A high-fidelity loading state displayed while the AI is processing a request.
//  * Features:
//  * 1. Staggered bouncing-dot animation using CSS delays.
//  * 2. Subtle pulse and fade-in transitions for a smooth appearance.
//  * 3. Branding-consistent iconography and typography.
//  */
// const TypingIndicator = ({ className }) => {
//   return (
//     <div 
//       className={cn(
//         "w-full py-8 px-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out",
//         className
//       )}
//       role="status"
//       aria-live="polite"
//       aria-label="AI is thinking"
//     >
//       <div className="max-w-3xl mx-auto flex gap-6">
        
//         {/* 1. Bot Avatar Representation */}
//         <div className="shrink-0">
//           <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
//             <Bot size={16} className="animate-pulse" />
//           </div>
//         </div>

//         {/* 2. Animation & Status Text */}
//         <div className="flex items-center gap-1.5 pt-2">
//           {/* Staggered Bouncing Dots */}
//           <div className="flex gap-1.5 items-center px-1">
//             <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:-0.32s]"></div>
//             <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:-0.16s]"></div>
//             <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:0.8s]"></div>
//           </div>
          
//           <span className="ml-3 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 select-none">
//             Thinking
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TypingIndicator;

import React, { memo } from "react";
import PropTypes from "prop-types";
import { Bot } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Dot Sub-component
 * Handles individual dot animation with configurable delay.
 */
const Dot = ({ delay }) => (
  <div
    className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce"
    style={{ 
      animationDuration: "0.8s", 
      animationDelay: delay 
    }}
  />
);

/**
 * TypingIndicator Component
 * A production-ready loading state for AI response generation.
 */
const TypingIndicator = ({ className, statusText = "Thinking" }) => {
  return (
    <div
      className={cn(
        "w-full py-8 px-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out",
        className
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="max-w-3xl mx-auto flex gap-6">
        
        {/* 1. Bot Avatar Visual */}
        <div className="shrink-0">
          <div 
            className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 
                       flex items-center justify-center text-emerald-500 
                       shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          >
            <Bot size={16} className="animate-pulse" aria-hidden="true" />
          </div>
        </div>

        {/* 2. Animation & Progress Text */}
        <div className="flex items-center gap-1.5 pt-2">
          {/* Staggered Dot Sequence */}
          <div className="flex gap-1.5 items-center px-1" aria-hidden="true">
            <Dot delay="-0.32s" />
            <Dot delay="-0.16s" />
            <Dot delay="0s" />
          </div>
          
          {/* Status Label */}
          <span 
            className="ml-3 text-[10px] font-bold uppercase tracking-[0.25em] 
                       text-muted-foreground/40 select-none pointer-events-none"
          >
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Component Standards ---

TypingIndicator.propTypes = {
  /** Optional additional classes for layout positioning */
  className: PropTypes.string,
  /** The text displayed next to the animation */
  statusText: PropTypes.string,
};

// Use memo to ensure the component doesn't re-render 
// during global state changes unless its own props change.
export default memo(TypingIndicator);