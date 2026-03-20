// import React from "react";
// import PropTypes from "prop-types";
// import { Sparkles, MessageSquarePlus, Terminal, Zap } from "lucide-react";

// /**
//  * SUGGESTIONS_CONFIG
//  * Centralized data for the initial welcome suggestions.
//  * In a larger app, this could come from a JSON file or an API.
//  */
// const SUGGESTIONS_CONFIG = [
//   { 
//     title: "Algorithm", 
//     desc: "Explain Dijkstra's algorithm simply", 
//     icon: <Terminal size={14} />,
//     category: "Technical"
//   },
//   { 
//     title: "Email Draft", 
//     desc: "Professional project status update email", 
//     icon: <MessageSquarePlus size={14} />,
//     category: "Writing"
//   },
//   { 
//     title: "Concept", 
//     desc: "How do neural networks learn?", 
//     icon: <Zap size={14} />,
//     category: "Education"
//   },
// ];

// /**
//  * EmptyState Component
//  * Displays a welcome interface when no messages exist in the current thread.
//  * Encourages user interaction through quick-start suggestions.
//  */
// const EmptyState = ({ onSuggestion }) => {
//   return (
//     <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-700 select-none">
      
//       {/* 1. Brand Visuals */}
//       <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6 shadow-[0_0_30px_rgba(var(--primary),0.1)] border border-primary/20">
//         <Sparkles size={32} aria-hidden="true" />
//       </div>
      
//       <h2 className="text-2xl font-bold tracking-tight mb-2 uppercase">ASK ME AI</h2>
//       <p className="text-muted-foreground text-sm max-w-[320px] mb-10 leading-relaxed font-medium">
//         Curiosity Meets Intelligence. <br /> How can I help you today?
//       </p>

//       {/* 2. Suggestion Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl">
//         {SUGGESTIONS_CONFIG.map((suggestion, index) => (
//           <button
//             key={`suggestion-${index}`}
//             onClick={() => onSuggestion(suggestion.desc)}
//             className="flex flex-col items-start p-4 bg-card/40 border border-border/50 rounded-2xl hover:border-primary/30 hover:bg-card/60 transition-all group text-left shadow-sm active:scale-[0.98]"
//             type="button"
//           >
//             <div className="p-2 bg-muted rounded-lg mb-3 group-hover:text-primary transition-colors">
//               {suggestion.icon}
//             </div>
            
//             <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-foreground/60">
//               {suggestion.title}
//             </div>
            
//             <div className="text-[12px] font-medium text-foreground/90 line-clamp-2 leading-snug">
//               {suggestion.desc}
//             </div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// EmptyState.propTypes = {
//   /** Callback function triggered when a suggestion card is clicked */
//   onSuggestion: PropTypes.func.isRequired,
// };

// export default EmptyState;


import React, { memo } from "react";
import PropTypes from "prop-types";
import { Sparkles, MessageSquarePlus, Terminal, Zap } from "lucide-react";

/**
 * SUGGESTIONS_DATA
 * Configuration for the welcome screen suggestions.
 * Unique IDs are used for React keys to ensure better performance and stability.
 */
const SUGGESTIONS_DATA = [
  {
    id: "algo-001",
    title: "Algorithm",
    desc: "Explain Dijkstra's algorithm simply",
    icon: <Terminal size={14} />,
    category: "Technical",
  },
  {
    id: "email-002",
    title: "Email Draft",
    desc: "Professional project status update email",
    icon: <MessageSquarePlus size={14} />,
    category: "Writing",
  },
  {
    id: "concept-003",
    title: "Concept",
    desc: "How do neural networks learn?",
    icon: <Zap size={14} />,
    category: "Education",
  },
];

/**
 * SuggestionCard (Sub-component)
 * Renders individual interactive suggestion cards.
 */
const SuggestionCard = memo(({ title, desc, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-start p-4 bg-card/40 border border-border/50 rounded-2xl 
               hover:border-primary/30 hover:bg-card/60 transition-all group text-left 
               shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 
               focus-visible:ring-primary/50"
    type="button"
    aria-label={`Suggestion: ${title} - ${desc}`}
  >
    <div className="p-2 bg-muted rounded-lg mb-3 group-hover:text-primary transition-colors">
      {icon}
    </div>

    <span className="text-[10px] font-bold uppercase tracking-widest mb-1 text-foreground/60">
      {title}
    </span>

    <span className="text-[12px] font-medium text-foreground/90 line-clamp-2 leading-snug">
      {desc}
    </span>
  </button>
));

SuggestionCard.displayName = "SuggestionCard";

/**
 * EmptyState Component
 * The main landing view when no messages are present in the chat.
 */
const EmptyState = ({ onSuggestion }) => {
  /**
   * Safe click handler to prevent errors if onSuggestion is not provided
   * or is not a function.
   */
  const handleSuggestionClick = (description) => {
    try {
      if (typeof onSuggestion === "function") {
        onSuggestion(description);
      } else {
        console.warn("EmptyState: onSuggestion prop is missing or not a function.");
      }
    } catch (error) {
      console.error("EmptyState: Error executing suggestion callback", error);
    }
  };

  return (
    <div 
      className="h-full flex flex-col items-center justify-center p-6 text-center 
                 animate-in fade-in zoom-in duration-700 select-none"
      role="region" 
      aria-labelledby="welcome-heading"
    >
      {/* Brand Visual Header */}
      <header className="flex flex-col items-center">
        <div 
          className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center 
                     text-primary mb-6 shadow-[0_0_30px_rgba(var(--primary),0.1)] 
                     border border-primary/20"
        >
          <Sparkles size={32} aria-hidden="true" />
        </div>

        <h2 id="welcome-heading" className="text-2xl font-bold tracking-tight mb-2 uppercase">
          ASK ME AI
        </h2>
        
        <p className="text-muted-foreground text-sm max-w-[320px] mb-10 leading-relaxed font-medium">
          Curiosity Meets Intelligence. <br /> How can I help you today?
        </p>
      </header>

      {/* Suggestion Grid Section */}
      <section className="w-full max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SUGGESTIONS_DATA.map((item) => (
            <SuggestionCard
              key={item.id}
              title={item.title}
              desc={item.desc}
              icon={item.icon}
              onClick={() => handleSuggestionClick(item.desc)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

// Component Metadata
EmptyState.propTypes = {
  /** Callback function triggered when a suggestion card is clicked */
  onSuggestion: PropTypes.func.isRequired,
};

// Default props to prevent crashes
EmptyState.defaultProps = {
  onSuggestion: (msg) => console.log("Default suggestion handler:", msg),
};

export default EmptyState;