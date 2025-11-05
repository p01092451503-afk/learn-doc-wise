import { useEffect, useState } from "react";
import atomLogo from "@/assets/atom-logo.png";

const loadingMessages = [
  "잠시만 기다려주세요...",
  "열심히 준비하고 있어요 ✨",
  "조금만 기다려주세요 🎯",
  "거의 다 됐어요!",
  "로딩 중이에요 💫",
  "준비하고 있어요...",
];

export const AtomLoader = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* Pulsing outer glow */}
          <div className="absolute inset-0 animate-ping opacity-30">
            <img 
              src={atomLogo} 
              alt="Loading" 
              className="w-24 h-24 object-contain"
            />
          </div>
          
          {/* Main logo with pulse */}
          <img 
            src={atomLogo} 
            alt="Loading" 
            className="w-24 h-24 object-contain relative animate-pulse"
          />
        </div>
        
        {/* Loading dots */}
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Loading message */}
        <p className="text-muted-foreground text-sm font-medium animate-fade-in">
          {loadingMessages[messageIndex]}
        </p>
      </div>
    </div>
  );
};
