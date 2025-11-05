import atomLogo from "@/assets/atom-logo.png";

export const AtomLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-4">
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
        
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
