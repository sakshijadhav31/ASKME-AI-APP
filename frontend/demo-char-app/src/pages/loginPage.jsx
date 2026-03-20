


import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import jwt_Decode from "jwt-decode";
import { Zap, ShieldCheck, Sun, Moon, Sparkles } from "lucide-react";

/**
 * Login Component
 * Handles Google OAuth authentication, JWT decoding, and theme persistence.
 * * @param {Function} onLoginSuccess - Callback function to lift user state to App.js
 */
const Login = ({ onLoginSuccess }) => {
  // State for UI management
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  /**
   * Toggles between light and dark modes
   * Persists the choice to localStorage for cross-session consistency
   */
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  /**
   * Side effect to sync the DOM's class list with the current theme state
   * This enables Tailwind's 'dark:' variant functionality
   */
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  /**
   * Handles successful Google OAuth response
   * 1. Extracts Credential (JWT)
   * 2. Stores token for the Axios Interceptor
   * 3. Decodes user profile information
   * 4. Triggers the success callback
   */
  const handleGoogleSuccess = (response) => {
    setIsLoggingIn(true);
    setError(null);
    
    try {
      const credential = response.credential;
      
      // Critical: Store the token so the Axios Interceptor can attach it to future requests
      localStorage.setItem("token", credential); 

      // Decode the JWT to get user metadata (name, email, avatar)
      const decodedUser = jwt_Decode(credential);
      
      const userData = {
        id: decodedUser.sub,
        email: decodedUser.email,
        name: decodedUser.name,
        picture: decodedUser.picture,
        token: credential, // Passed to App.js state
      };

      // Artificial delay for a smoother UI transition
      setTimeout(() => {
        onLoginSuccess(userData);
        setIsLoggingIn(false);
      }, 800);

    } catch (err) {
      console.error("Authentication Error:", err);
      setError("Failed to decode user information. Please try again.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#09090b] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Global Navigation Header */}
      <header className="w-full px-8 py-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 shadow-lg group-hover:rotate-12 transition-all">
            <Zap size={20} fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold tracking-[0.2em] uppercase">ASK ME AI</h1>
        </div>

        <button 
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2.5 rounded-xl border border-gray-500/20 bg-white/5 backdrop-blur-md hover:bg-gray-500/10 transition-all shadow-sm"
        >
          {theme === "dark" ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-600" />}
        </button>
      </header>

      {/* Main Authentication Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        
        {/* Status Badge */}
        <div className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 animate-pulse">
          <Sparkles size={12} className="text-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Gemini Powered</span>
        </div>

        {/* Authentication Card */}
        <div className="w-full max-w-[440px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Welcome Back</h2>
            <p className="text-gray-400 text-sm leading-relaxed px-4">
              Sign in to experience the next generation of artificial intelligence.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex justify-center">
              {isLoggingIn ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 animate-pulse">Authenticating</span>
                </div>
              ) : (
                <div className="w-full flex justify-center transform transition-all hover:scale-[1.02]">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Login failed. Please verify your credentials and try again.")}
                    theme={theme === "dark" ? "filled_black" : "outline"}
                    shape="pill"
                    size="large"
                    width="320px"
                  />
                </div>
              )}
            </div>

            {/* Error Message Display */}
            {error && (
              <p className="text-red-500 text-xs text-center font-medium animate-bounce">{error}</p>
            )}

            {/* Trust & Security Indicators */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 justify-center">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span className="text-[9px] font-bold uppercase tracking-tighter opacity-60">Secure SSL</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 justify-center">
                <Zap size={12} className="text-amber-500" />
                <span className="text-[9px] font-bold uppercase tracking-tighter opacity-60">Real-time Sync</span>
              </div>
            </div>
          </div>

          <footer className="mt-12 text-[9px] text-center text-gray-500/40 leading-relaxed uppercase tracking-widest font-bold">
            © 2026 ASK ME AI • Intelligent Chat Ecosystem
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Login;