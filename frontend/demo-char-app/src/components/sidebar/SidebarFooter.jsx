// import React from "react";
// import PropTypes from "prop-types";
// import { LogOut, User, ShieldCheck } from "lucide-react";
// import { cn } from "../../lib/utils";

// /**
//  * SidebarFooter Component
//  * Displays the authenticated user's profile information and session management.
//  * Features:
//  * 1. Dynamic avatar rendering (Image or Initial)
//  * 2. Real-time online status indicator
//  * 3. Verified account badge (ShieldCheck)
//  * 4. Quick-access logout functionality with hover animations
//  */
// const SidebarFooter = ({ user, onLogout }) => {
//   // Extract user details with safe fallbacks
//   const userName = user?.name || "Explorer";
//   const userEmail = user?.email || "No session data";
//   const userInitial = userName.charAt(0).toUpperCase();

//   return (
//     <div className={cn(
//       "group flex items-center justify-between gap-3 p-2.5 rounded-[1.25rem] border transition-all duration-500",
//       "bg-card/30 border-border/40 backdrop-blur-sm shadow-lg shadow-black/5",
//       "hover:bg-card/50 hover:border-primary/20 hover:shadow-primary/5"
//     )}>
      
//       {/* 1. User Identity Section */}
//       <div className="flex items-center gap-3 overflow-hidden">
//         <div className="relative shrink-0">
//           {user?.picture ? (
//             <img 
//               src={user.picture} 
//               alt={`${userName}'s profile`} 
//               className="w-10 h-10 rounded-xl object-cover border border-border/50 shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2" 
//             />
//           ) : (
//             <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-sm transition-all group-hover:bg-primary/20">
//               {userInitial || <User size={16} />}
//             </div>
//           )}
          
//           {/* Status Indicator (Animated Pulse) */}
//           <div 
//             className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0D0F11] rounded-full shadow-lg shadow-emerald-500/20 animate-pulse"
//             aria-label="User Online"
//           />
//         </div>
        
//         <div className="flex flex-col min-w-0 pr-2">
//           <div className="flex items-center gap-1.5 overflow-hidden">
//             <span className="text-[13px] font-bold text-foreground truncate tracking-tight leading-none group-hover:text-primary transition-colors">
//               {userName}
//             </span>
//             <ShieldCheck 
//               size={12} 
//               className="text-primary/60 shrink-0" 
//               aria-label="Verified Account"
//             />
//           </div>
//           <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5 font-medium opacity-60 group-hover:opacity-100 transition-opacity">
//             {userEmail}
//           </span>
//         </div>
//       </div>

//       {/* 2. Session Management (Logout) */}
//       <button 
//         className={cn(
//           "flex items-center justify-center w-9 h-9 shrink-0 transition-all duration-300 rounded-xl",
//           "text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:rotate-12 active:scale-90"
//         )} 
//         onClick={onLogout} 
//         type="button"
//         title="Sign Out"
//         aria-label="Log out of session"
//       >
//         <LogOut size={16} strokeWidth={2.5} />
//       </button>

//     </div>
//   );
// };

// SidebarFooter.propTypes = {
//   /** User object containing name, email, and optionally a profile picture URL */
//   user: PropTypes.shape({
//     name: PropTypes.string,
//     email: PropTypes.string,
//     picture: PropTypes.string,
//   }),
//   /** Callback function to handle the logout logic */
//   onLogout: PropTypes.func.isRequired,
// };

// export default SidebarFooter;


import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { LogOut, User, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * SidebarFooter Component
 * Displays user profile, verification status, and logout actions.
 */
const SidebarFooter = ({ user, onLogout }) => {
  // Memoize user initials to prevent re-calculation (e.g., "John Doe" -> "JD")
  const userInitial = useMemo(() => {
    if (!user?.name) return null;
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  const userName = user?.name || "Anonymous User";
  const userEmail = user?.email || "Guest Session";

  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-3 p-2 rounded-2xl border transition-all duration-500",
        "bg-card/30 border-border/40 backdrop-blur-sm shadow-sm",
        "hover:bg-card/60 hover:border-primary/20 hover:shadow-primary/5"
      )}
    >
      {/* 1. Identity & Status Section */}
      <div className="flex items-center gap-3 overflow-hidden min-w-0">
        <div className="relative shrink-0">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={`${userName}'s profile`}
              className="w-9 h-9 rounded-xl object-cover border border-border/50 shadow-sm 
                         transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.src = ""; // Clear broken src
                e.target.className = "hidden"; // Hide img and let fallback show
              }}
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 
                            flex items-center justify-center text-primary font-bold text-xs 
                            transition-all group-hover:bg-primary/20 shadow-inner">
              {userInitial || <User size={14} />}
            </div>
          )}

          {/* Active Status Ring */}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 
                       border-2 border-[#0D0F11] rounded-full shadow-lg 
                       shadow-emerald-500/20 animate-pulse"
            aria-hidden="true"
          />
        </div>

        {/* User Metadata */}
        <div className="flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-[13px] font-bold text-foreground truncate tracking-tight leading-none">
              {userName}
            </span>
            {user?.verified && (
              <ShieldCheck
                size={12}
                className="text-primary/60 shrink-0"
                aria-label="Verified User"
              />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground truncate mt-1 font-medium opacity-50 
                           group-hover:opacity-100 transition-opacity">
            {userEmail}
          </span>
        </div>
      </div>

      {/* 2. Quick Actions */}
      <button
        onClick={onLogout}
        className={cn(
          "flex items-center justify-center w-8 h-8 shrink-0 transition-all duration-300 rounded-lg",
          "text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95"
        )}
        type="button"
        title="Sign Out"
        aria-label="Log out"
      >
        <LogOut size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
};

// --- Component Standards ---

SidebarFooter.propTypes = {
  /** * User information object. 
   * Added 'verified' boolean to the shape for the ShieldCheck logic. 
   */
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    picture: PropTypes.string,
    verified: PropTypes.bool,
  }),
  /** Required callback for logout procedure */
  onLogout: PropTypes.func.isRequired,
};

SidebarFooter.defaultProps = {
  user: {
    name: "Explorer",
    email: "session.active@nexus",
    verified: true,
  },
};

export default memo(SidebarFooter);