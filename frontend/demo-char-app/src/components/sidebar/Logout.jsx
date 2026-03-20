// import React, { useState } from "react";
// import PropTypes from "prop-types";
// import { LogOut, AlertCircle, X } from "lucide-react";
// import { cn } from "../../lib/utils";

// /**
//  * Logout Component
//  * A high-fidelity "Sign Out" button designed for the NexusAI Obsidian theme.
//  * Features a two-step confirmation process to prevent accidental logouts.
//  */
// const Logout = ({ onLogout, className }) => {
//   const [showConfirm, setShowConfirm] = useState(false);

//   /**
//    * Toggles the confirmation state to show/hide the 'Are you sure?' prompt.
//    */
//   const toggleConfirm = (e) => {
//     e.stopPropagation();
//     setShowConfirm(!showConfirm);
//   };

//   /**
//    * Executes the logout callback passed from the parent.
//    */
//   const handleFinalLogout = (e) => {
//     e.stopPropagation();
//     onLogout();
//   };

//   if (showConfirm) {
//     return (
//       <div 
//         className={cn(
//           "w-full flex items-center justify-between gap-3 px-3 py-2.5 mt-auto rounded-xl border border-destructive/30 bg-destructive/10 animate-in fade-in zoom-in-95 duration-200",
//           className
//         )}
//       >
//         <div className="flex items-center gap-3">
//           <AlertCircle size={16} className="text-destructive animate-pulse" />
//           <span className="text-[11px] font-bold uppercase tracking-wider text-destructive">
//             Confirm Sign Out?
//           </span>
//         </div>
//         <div className="flex items-center gap-1">
//           <button 
//             onClick={handleFinalLogout}
//             className="p-1.5 hover:bg-destructive hover:text-white rounded-lg transition-colors"
//             title="Yes, Logout"
//           >
//             <LogOut size={14} />
//           </button>
//           <button 
//             onClick={toggleConfirm}
//             className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
//             title="Cancel"
//           >
//             <X size={14} />
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <button 
//       className={cn(
//         "w-full flex items-center gap-3 px-3 py-2.5 mt-auto transition-all duration-300 group",
//         "rounded-xl border border-transparent hover:border-destructive/20 hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
//         className
//       )}
//       onClick={toggleConfirm}
//       type="button"
//       aria-label="Logout"
//     >
//       {/* 1. Icon Container */}
//       <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted group-hover:bg-destructive/10 transition-colors duration-300 shadow-sm">
//         <LogOut 
//           size={18} 
//           className="group-hover:scale-110 group-hover:-translate-x-0.5 transition-all duration-300" 
//         />
//       </div>
      
//       {/* 2. Labeling */}
//       <div className="flex flex-col items-start leading-none text-left">
//         <span className="text-[13px] font-bold tracking-tight text-foreground group-hover:text-destructive transition-colors">
//           Sign Out
//         </span>
//         <span className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-40 mt-1.5 group-hover:opacity-60 transition-opacity">
//           End Session
//         </span>
//       </div>

//       {/* 3. Visual Indicator */}
//       <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity pr-1">
//         <div className="w-1.5 h-1.5 bg-destructive rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
//       </div>
//     </button>
//   );
// };

// Logout.propTypes = {
//   /** Callback function to handle the logout logic in the parent component */
//   onLogout: PropTypes.func.isRequired,
//   /** Optional tailwind classes for positioning */
//   className: PropTypes.string,
// };

// export default Logout;


import React, { useState, memo, useCallback } from "react";
import PropTypes from "prop-types";
import { LogOut, AlertCircle, X, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Logout Component
 * A high-fidelity "Sign Out" interaction with a confirmation safety net.
 */
const Logout = ({ onLogout, className }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  /**
   * Toggles the confirmation state.
   */
  const toggleConfirm = useCallback((e) => {
    e?.stopPropagation();
    setIsConfirming((prev) => !prev);
  }, []);

  /**
   * Executes the logout callback with error handling.
   */
  const handleFinalLogout = useCallback((e) => {
    e?.stopPropagation();
    try {
      if (typeof onLogout === "function") {
        onLogout();
      } else {
        console.error("Logout Component: onLogout prop is missing.");
      }
    } catch (error) {
      console.error("Logout Component: Critical error during logout execution", error);
    }
  }, [onLogout]);

  // --- Render Logic: Confirmation State ---
  if (isConfirming) {
    return (
      <div 
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 mt-auto rounded-xl",
          "border border-destructive/30 bg-destructive/10",
          "animate-in fade-in zoom-in-95 duration-300 ease-out",
          className
        )}
        role="alert"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <AlertCircle size={14} className="text-destructive shrink-0 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-destructive truncate">
            Are you sure?
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={handleFinalLogout}
            className="flex items-center justify-center w-8 h-8 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
            title="Confirm Logout"
            type="button"
          >
            <LogOut size={14} />
          </button>
          
          <button 
            onClick={toggleConfirm}
            className="flex items-center justify-center w-8 h-8 bg-background/50 hover:bg-background rounded-lg text-muted-foreground transition-colors border border-border/40"
            title="Cancel"
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  // --- Render Logic: Default State ---
  return (
    <button 
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 mt-auto transition-all duration-300 group",
        "rounded-xl border border-transparent hover:border-destructive/20 hover:bg-destructive/5",
        "text-muted-foreground hover:text-destructive active:scale-[0.98]",
        className
      )}
      onClick={toggleConfirm}
      type="button"
      aria-label="Sign out of your account"
      aria-expanded={isConfirming}
    >
      {/* Visual Identity Icon */}
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary group-hover:bg-destructive/10 transition-colors duration-300 shadow-sm border border-border/20">
        <LogOut 
          size={16} 
          className="group-hover:scale-110 group-hover:-translate-x-0.5 transition-all duration-300" 
          aria-hidden="true"
        />
      </div>
      
      {/* Textual Content */}
      <div className="flex flex-col items-start leading-none text-left flex-1 overflow-hidden">
        <span className="text-[13px] font-bold tracking-tight text-foreground group-hover:text-destructive transition-colors">
          Sign Out
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50 mt-1.5 group-hover:text-destructive/60 transition-colors">
          End Session
        </span>
      </div>

      {/* Trailing Indicator */}
      <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
        <ChevronRight size={14} className="text-destructive/40" />
      </div>
    </button>
  );
};

// --- Component Metadata ---

Logout.propTypes = {
  /** Function triggered upon final confirmation */
  onLogout: PropTypes.func.isRequired,
  /** Tailwind extension classes */
  className: PropTypes.string,
};

Logout.defaultProps = {
  onLogout: () => console.warn("Logout: No logout handler provided."),
};

// Use memo to prevent re-renders in the sidebar
export default memo(Logout);