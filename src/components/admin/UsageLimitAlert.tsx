import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Ban, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UsageLimitAlertProps {
  type: "student" | "storage" | "ai_token";
  current: number;
  max: number;
  percentage: number;
  isBlocking?: boolean;
}

export const UsageLimitAlert = ({ type, current, max, percentage, isBlocking = false }: UsageLimitAlertProps) => {
  const navigate = useNavigate();

  const config = {
    student: {
      title: "학생 수 제한",
      icon: <AlertTriangle className="h-5 w-5" />,
      message: `현재 ${current}명의 학생이 등록되어 있습니다. 최대 ${max}명까지 가능합니다.`,
      blockMessage: "학생 수 제한에 도달했습니다. 새로운 학생을 등록할 수 없습니다.",
    },
    storage: {
      title: "스토리지 용량 제한",
      icon: <AlertTriangle className="h-5 w-5" />,
      message: `현재 ${current.toFixed(2)}GB를 사용 중입니다. 최대 ${max}GB까지 가능합니다.`,
      blockMessage: "스토리지 용량이 초과되었습니다. 파일을 업로드할 수 없습니다.",
    },
    ai_token: {
      title: "AI 토큰 제한",
      icon: <AlertTriangle className="h-5 w-5" />,
      message: `이번 달 ${current.toLocaleString()}개의 토큰을 사용했습니다. 최대 ${max.toLocaleString()}개까지 가능합니다.`,
      blockMessage: "AI 토큰 제한에 도달했습니다. AI 기능을 사용할 수 없습니다.",
    },
  };

  const currentConfig = config[type];
  const isWarning = percentage >= 80 && percentage < 100;
  const isError = percentage >= 100;

  if (!isWarning && !isError) return null;

  return (
    <Alert variant={isError ? "destructive" : "default"} className="mb-4">
      <div className="flex items-start gap-3">
        {isBlocking ? <Ban className="h-5 w-5" /> : currentConfig.icon}
        <div className="flex-1">
          <AlertTitle className="mb-2 flex items-center gap-2">
            {currentConfig.title}
            {isBlocking && <span className="text-xs bg-destructive/20 px-2 py-1 rounded">차단됨</span>}
          </AlertTitle>
          <AlertDescription>
            <p className="mb-3">
              {isBlocking ? currentConfig.blockMessage : currentConfig.message}
            </p>
            <p className="text-sm mb-3">
              사용률: <strong>{percentage.toFixed(1)}%</strong>
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isError ? "default" : "outline"}
                onClick={() => navigate("/admin/settings")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                플랜 업그레이드
              </Button>
              {type === "storage" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/admin/content")}
                >
                  파일 관리
                </Button>
              )}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
