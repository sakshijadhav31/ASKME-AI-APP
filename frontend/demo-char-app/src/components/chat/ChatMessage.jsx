


// import React, { useState } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { Copy, Check, User, Bot } from "lucide-react"; 
// import { cn } from "../../lib/utils"; 

// const ChatMessage = ({ m }) => {
//   const isAssistant = m.role === "assistant" || m.role === "model";
//   const [msgCopied, setMsgCopied] = useState(false);

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(m.message);
//     setMsgCopied(true);
//     setTimeout(() => setMsgCopied(false), 2000);
//   };

//   return (
//     <div className={cn(
//       "flex w-full gap-4 py-6 px-4 mb-4 rounded-2xl group transition-all duration-300",
//       isAssistant ? "bg-transparent" : "bg-muted/30 border border-border/20 shadow-sm"
//     )}>
      
//       {/* Icon */}
//       <div className="flex-shrink-0 mt-1">
//         <div className={cn(
//           "w-9 h-9 rounded-xl flex items-center justify-center shadow-md",
//           isAssistant ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
//         )}>
//           {isAssistant ? <Bot size={20} /> : <User size={20} />}
//         </div>
//       </div>

//       {/* Content */}
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-xs font-bold tracking-widest uppercase opacity-50">
//             {isAssistant ? "ASK ME AI" : "YOU"}
//           </span>

//           {/* Copy Button (Visible on Hover) */}
//           <button 
//             onClick={copyToClipboard} 
//             className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-muted rounded-md text-muted-foreground transition-all"
//             title="Copy Message"
//           >
//             {msgCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
//           </button>
//         </div>

//         <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed text-foreground/90">
//           <ReactMarkdown
//             remarkPlugins={[remarkGfm]}
//             components={{
//               code({ node, inline, className, children, ...props }) {
//                 const match = /language-(\w+)/.exec(className || "");
//                 const [codeCopied, setCodeCopied] = useState(false);

//                 const handleCodeCopy = () => {
//                   const codeString = String(children).replace(/\n$/, "");
//                   navigator.clipboard.writeText(codeString);
//                   setCodeCopied(true);
//                   setTimeout(() => setCodeCopied(false), 2000);
//                 };

//                 return !inline && match ? (
//                   <div className="relative group/code my-4 rounded-lg overflow-hidden border border-border/50 shadow-xl">
//                     <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] text-gray-400 text-[11px] font-mono">
//                       <span>{match[1].toUpperCase()}</span>
//                       <button onClick={handleCodeCopy} className="flex items-center gap-1.5 hover:text-white transition-colors">
//                         {codeCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
//                         {codeCopied ? "Copied!" : "Copy code"}
//                       </button>
//                     </div>
//                     <SyntaxHighlighter
//                       style={oneDark}
//                       language={match[1]}
//                       PreTag="div"
//                       customStyle={{ margin: 0, padding: "1.2rem", fontSize: "13px" }}
//                       {...props}
//                     >
//                       {String(children).replace(/\n$/, "")}
//                     </SyntaxHighlighter>
//                   </div>
//                 ) : (
//                   <code className={cn("bg-muted px-1.5 py-0.5 rounded text-primary font-mono", className)} {...props}>
//                     {children}
//                   </code>
//                 );
//               },
//             }}
//           >
//             {m.message}
//           </ReactMarkdown>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatMessage;

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, User, Bot, AlertCircle } from "lucide-react"; 
import { cn } from "../../lib/utils"; 

/**
 * ChatMessage Component
 * Renders individual messages with support for Markdown, syntax highlighting, 
 * and clipboard functionality.
 */
const ChatMessage = ({ m }) => {
  const isAssistant = m.role === "assistant" || m.role === "model";
  const isError = m.role === "error"; // Support for error states
  const [msgCopied, setMsgCopied] = useState(false);

  // Handles copying the full message text to clipboard
  const copyToClipboard = () => {
    if (!m.message) return;
    navigator.clipboard.writeText(m.message);
    setMsgCopied(true);
    setTimeout(() => setMsgCopied(false), 2000);
  };

  return (
    <div className={cn(
      "flex w-full gap-4 py-6 px-4 mb-4 rounded-2xl group transition-all duration-300",
      isAssistant ? "bg-transparent" : "bg-muted/30 border border-border/20 shadow-sm",
      isError && "bg-destructive/10 border-destructive/20" // Visual feedback for errors
    )}>
      
      {/* Avatar Section */}
      <div className="flex-shrink-0 mt-1">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shadow-md",
          isAssistant ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
          isError && "bg-destructive text-destructive-foreground"
        )}>
          {isError ? <AlertCircle size={20} /> : (isAssistant ? <Bot size={20} /> : <User size={20} />)}
        </div>
      </div>

      {/* Message Body Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-widest uppercase opacity-50">
            {isError ? "System Error" : (isAssistant ? "Assistant" : "User")}
          </span>

          {/* Action Tools */}
          {!isError && m.message && (
            <button 
              onClick={copyToClipboard} 
              className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-muted rounded-md text-muted-foreground transition-all"
              title="Copy to clipboard"
            >
              {msgCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          )}
        </div>

        {/* Content Rendering */}
        <div className={cn(
          "prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed",
          isError ? "text-destructive font-medium" : "text-foreground/90"
        )}>
          {isError ? (
            <p>{m.message || "An unexpected error occurred. Please try again."}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom handling for code blocks
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const [codeCopied, setCodeCopied] = useState(false);

                  const handleCodeCopy = () => {
                    const codeString = String(children).replace(/\n$/, "");
                    navigator.clipboard.writeText(codeString);
                    setCodeCopied(true);
                    setTimeout(() => setCodeCopied(false), 2000);
                  };

                  if (!inline && match) {
                    return (
                      <div className="relative group/code my-4 rounded-lg overflow-hidden border border-border/50 shadow-xl">
                        {/* Code Header Bar */}
                        <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] text-gray-400 text-[11px] font-mono border-b border-white/5">
                          <span>{match[1].toUpperCase()}</span>
                          <button onClick={handleCodeCopy} className="flex items-center gap-1.5 hover:text-white transition-colors">
                            {codeCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            {codeCopied ? "Copied" : "Copy"}
                          </button>
                        </div>
                        {/* Syntax Highlighter */}
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, padding: "1.2rem", fontSize: "13px", background: "#1e1e1e" }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code className={cn("bg-muted px-1.5 py-0.5 rounded text-primary font-mono", className)} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {m.message}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;