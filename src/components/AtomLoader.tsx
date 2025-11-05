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
  const [animationCycle, setAnimationCycle] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    const animationInterval = setInterval(() => {
      setAnimationCycle((prev) => prev + 1);
    }, 3000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(animationInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-64 h-32 flex items-center justify-center">
          {/* Villain (검은 구체) */}
          <div 
            key={`villain-${animationCycle}`}
            className="absolute right-8 w-12 h-12 rounded-full bg-destructive animate-[pulse_0.5s_ease-in-out_infinite]"
            style={{
              animation: 'villain-explode 3s ease-in-out infinite',
            }}
          />
          
          {/* Explosion particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`particle-${animationCycle}-${i}`}
              className="absolute right-8 w-2 h-2 rounded-full bg-destructive"
              style={{
                animation: `particle-explode-${i} 3s ease-out infinite`,
                animationDelay: '1.5s',
              }}
            />
          ))}

          {/* Atom Hero */}
          <div 
            key={`atom-${animationCycle}`}
            className="absolute left-8"
            style={{
              animation: 'atom-attack 3s ease-in-out infinite',
            }}
          >
            <div className="relative">
              {/* Pulsing outer glow */}
              <div className="absolute inset-0 animate-ping opacity-30">
                <img 
                  src={atomLogo} 
                  alt="Loading" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              
              {/* Main logo */}
              <img 
                src={atomLogo} 
                alt="Loading" 
                className="w-16 h-16 object-contain relative"
              />
            </div>
          </div>
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

      <style>{`
        @keyframes atom-attack {
          0%, 100% {
            transform: translateX(0) scale(1);
          }
          40% {
            transform: translateX(120px) scale(1.2);
          }
          50% {
            transform: translateX(120px) scale(1.5);
          }
          60% {
            transform: translateX(120px) scale(1);
          }
        }

        @keyframes villain-explode {
          0%, 45% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.8;
          }
          55% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        ${[...Array(8)].map((_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          const distance = 40;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          return `
            @keyframes particle-explode-${i} {
              0%, 48% {
                transform: translate(0, 0) scale(1);
                opacity: 0;
              }
              50% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              70% {
                transform: translate(${x}px, ${y}px) scale(0.5);
                opacity: 0.5;
              }
              80%, 100% {
                transform: translate(${x * 1.5}px, ${y * 1.5}px) scale(0);
                opacity: 0;
              }
            }
          `;
        }).join('')}
      `}</style>
    </div>
  );
};
