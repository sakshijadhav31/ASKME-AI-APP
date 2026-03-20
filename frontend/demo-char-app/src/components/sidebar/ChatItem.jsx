import React from "react";
import PropTypes from "prop-types";
import { MessageSquare, Pencil, Trash2, Hash } from "lucide-react";

/**
 * ChatItem Component
 * Represents a single conversation thread in the sidebar list.
 * Includes action buttons for renaming and deleting threads.
 */
const ChatItem = ({ chat, isActive, onSelect, onEdit, onDelete }) => {
  
  /**
   * Handles action button clicks without triggering the parent onClick (Selection)
   * @param {Event} e - React Synthetic Event
   * @param {Function} action - The specific action to perform (Edit/Delete)
   */
  const handleAction = (e, action) => {
    e.stopPropagation(); // Prevents the chat from being selected when clicking an icon
    action(e, chat.id, chat.title);
  };

  return (
    <div 
      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out mb-1
        ${isActive 
          ? "bg-[#272A2E] text-[#E1E2E7] shadow-sm border border-white/5" 
          : "text-[#9DA0A4] hover:bg-[#272A2E]/50 hover:text-[#E1E2E7]"}`}
      onClick={() => onSelect(chat.id)}
      role="button"
      aria-selected={isActive}
    >
      {/* 1. Left Side - Icon and Thread Title */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`flex-shrink-0 transition-colors ${isActive ? "text-blue-400" : "text-gray-500 group-hover:text-blue-400/70"}`}>
          {isActive ? <Hash size={16} /> : <MessageSquare size={16} />}
        </div>
        
        <span className="truncate text-sm font-medium tracking-tight overflow-hidden whitespace-nowrap">
          {chat.title || "Untitled Thread"}
        </span>
      </div>
      
      {/* 2. Right Side - Action Controls (Visible on Hover or Active State) */}
      <div className={`flex items-center gap-1 transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        {/* Rename Action */}
        <button 
          className="p-1.5 hover:bg-gray-700 rounded-md text-gray-500 hover:text-blue-400 transition-all"
          onClick={(e) => handleAction(e, onEdit)}
          title="Rename Thread"
          type="button"
        >
          <Pencil size={13} />
        </button>
        
        {/* Delete Action */}
        <button 
          className="p-1.5 hover:bg-red-500/10 rounded-md text-gray-500 hover:text-red-400 transition-all"
          onClick={(e) => handleAction(e, onDelete)}
          title="Delete Thread"
          type="button"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Active Selection Indicator */}
      {isActive && (
        <div className="absolute left-0 w-1 h-4 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
      )}
    </div>
  );
};

// Prop validation for production stability
ChatItem.propTypes = {
  chat: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ChatItem;