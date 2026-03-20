import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Plus, Loader2, MessageSquareDashed, Sparkles } from "lucide-react";
import ChatItem from "./ChatItem";
import SidebarFooter from "./SidebarFooter";
import { cn } from "../../lib/utils";

/**
 * Sidebar Component
 * Manages the navigation drawer including:
 * 1. App Branding
 * 2. Creating new chat sessions
 * 3. Listing, renaming, and deleting historical chat threads
 * 4. User profile and session management
 */
const Sidebar = ({ 
  user, chats, isLoadingChats, activeId, 
  onSelect, onNew, onLogout, onDelete, onUpdateTitle 
}) => {

  /**
   * Handles renaming a chat thread.
   * Note: In a full production app, replace window.prompt with a custom Modal.
   */
  const handleEditTitle = (e, id, currentTitle) => {
    e.stopPropagation();
    const newTitle = window.prompt("Rename this thread:", currentTitle);
    
    if (newTitle && newTitle.trim() !== "" && newTitle !== currentTitle) {
      onUpdateTitle(id, newTitle.trim());
    }
  };

  /**
   * Handles deleting a chat thread with confirmation
   */
  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      onDelete(chatId);
    }
  };

  // Memoize chat count to prevent unnecessary recalculations
  const chatCount = useMemo(() => chats?.length || 0, [chats]);

  return (
    <aside className="w-[300px] h-full bg-[#0D0F11] border-r border-border/40 flex flex-col z-50 relative overflow-hidden shrink-0">
      
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 blur-[100px] pointer-events-none" aria-hidden="true"></div>

      {/* 1. Branding & Action Section */}
      <div className="p-6 flex flex-col gap-6 relative z-10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
            <Sparkles size={16} fill="currentColor" />
          </div>
          <span className="text-[14px] font-bold tracking-[0.25em] uppercase text-foreground/80">
            ASK ME AI
          </span>
        </div>

        <button 
          className={cn(
            "w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold text-[12px] uppercase tracking-widest transition-all duration-300",
            "shadow-[0_8px_20px_rgba(var(--primary),0.15)] hover:shadow-[0_8px_25px_rgba(var(--primary),0.25)] hover:scale-[1.02] active:scale-[0.98]"
          )} 
          onClick={onNew}
          type="button"
        >
          <Plus size={16} strokeWidth={3} /> New Session
        </button>
      </div>

      {/* 2. Thread History Area */}
      <div className="flex-1 flex flex-col overflow-hidden px-4 mb-4 relative z-10">
        <div className="flex items-center justify-between px-3 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
            Recent Threads
          </span>
          {chatCount > 0 && (
            <span className="text-[9px] font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground/70">
              {chatCount}
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto chat-scrollbar space-y-1 pr-1" aria-label="Chat history">
          {isLoadingChats ? (
            /* Loading State Illustration */
            <div className="flex flex-col items-center justify-center py-12 gap-4 opacity-40 animate-in fade-in duration-500">
              <Loader2 size={22} className="animate-spin text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-center">
                Syncing Library...
              </p>
            </div>
          ) : chats && chats.length > 0 ? (
            /* Historical Chat List */
            <div className="animate-in fade-in slide-in-from-left-2 duration-500">
              {chats.map((chat) => (
                <ChatItem 
                  key={chat.id}
                  chat={chat}
                  isActive={activeId === chat.id}
                  onSelect={onSelect}
                  onEdit={handleEditTitle}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            /* Empty Data State */
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center gap-4 opacity-20 select-none grayscale">
              <div className="p-4 rounded-full border-2 border-dashed border-foreground/20">
                <MessageSquareDashed size={32} strokeWidth={1.5} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                Archives Empty<br/>
                <span className="font-medium normal-case opacity-60 tracking-normal text-[10px]">
                  New conversations will appear here.
                </span>
              </p>
            </div>
          )}
        </nav>
      </div>

      {/* 3. Sidebar Footer (Account & Preferences) */}
      <footer className="mt-auto p-4 border-t border-border/30 bg-[#0A0C0E]/80 backdrop-blur-md relative z-10">
        <SidebarFooter user={user} onLogout={onLogout} />
      </footer>

    </aside>
  );
};

Sidebar.propTypes = {
  user: PropTypes.object,
  chats: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoadingChats: PropTypes.bool.isRequired,
  activeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdateTitle: PropTypes.func.isRequired,
};

export default Sidebar;
