import atomLogo from "@/assets/atom-logo.png";
import { cn } from "@/lib/utils";

interface AtomSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AtomSpinner = ({ size = "md", className }: AtomSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Pulsing outer glow */}
      <div className="absolute inset-0 animate-ping opacity-30">
        <img 
          src={atomLogo} 
          alt="Loading" 
          className={cn("object-contain", sizeClasses[size])}
        />
      </div>
      
      {/* Main logo with pulse */}
      <img 
        src={atomLogo} 
        alt="Loading" 
        className={cn("object-contain relative animate-pulse", sizeClasses[size])}
      />
    </div>
  );
};
