import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  theme?: "dark" | "light";
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  theme = "dark",
}: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="h-16 w-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-violet-400" />
      </div>
      <h3 className={cn(
        "text-lg font-semibold mb-2 transition-colors",
        theme === "dark" ? "text-white" : "text-slate-900"
      )}>{title}</h3>
      <p className={cn(
        "text-sm text-center max-w-md mb-6 transition-colors",
        theme === "dark" ? "text-slate-400" : "text-slate-600"
      )}>{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-violet-500 hover:bg-violet-600"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};
