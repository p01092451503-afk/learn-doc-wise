import { useEffect, useState } from "react";

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
      <div className="flex flex-col items-center gap-8">
        {/* Loading dots with enhanced animations */}
        <div className="flex gap-4 items-center">
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
            <div className="absolute inset-0 w-6 h-6 rounded-full bg-primary/30 animate-ping" style={{ animationDelay: '0ms' }} />
          </div>
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '200ms' }} />
            <div className="absolute inset-0 w-6 h-6 rounded-full bg-primary/30 animate-ping" style={{ animationDelay: '200ms' }} />
          </div>
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '400ms' }} />
            <div className="absolute inset-0 w-6 h-6 rounded-full bg-primary/30 animate-ping" style={{ animationDelay: '400ms' }} />
          </div>
        </div>

        {/* Loading message */}
        <p className="text-muted-foreground text-sm font-medium animate-fade-in">
          {loadingMessages[messageIndex]}
        </p>
      </div>
    </div>
  );
};
