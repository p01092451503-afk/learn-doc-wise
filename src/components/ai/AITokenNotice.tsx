import { Coins, Info } from "lucide-react";

interface AITokenNoticeProps {
  variant?: "default" | "compact";
}

export const AITokenNotice = ({ variant = "default" }: AITokenNoticeProps) => {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Coins className="h-3 w-3" />
        <span>AI 토큰이 소모됩니다</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
      <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
      <div className="space-y-1">
        <p className="font-medium text-foreground">AI 토큰 사용 안내</p>
        <p className="text-muted-foreground text-xs">
          이 기능을 사용하면 AI 토큰이 소모됩니다. 사용량은 관리자 대시보드에서 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
};
