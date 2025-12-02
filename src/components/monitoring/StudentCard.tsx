import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentCardProps {
  studentId: string;
  name: string;
  courseName: string;
  progress: number;
  isOnline: boolean;
  isFocused: boolean;
  lastMouseMovement: Date;
  avatarUrl?: string;
}

export function StudentCard({
  name,
  courseName,
  progress,
  isOnline,
  isFocused,
  lastMouseMovement,
  avatarUrl,
}: StudentCardProps) {
  // 이탈 징후 감지: 포커스 아웃 또는 10분 이상 마우스 움직임 없음
  const now = new Date();
  const minutesSinceLastActivity = Math.floor(
    (now.getTime() - lastMouseMovement.getTime()) / 1000 / 60
  );
  const hasAlert = !isFocused || minutesSinceLastActivity >= 10;

  return (
    <Card
      className={cn(
        "relative p-4 transition-all duration-300",
        hasAlert && "animate-pulse border-destructive border-2"
      )}
    >
      {/* 이상 징후 배지 */}
      {hasAlert && (
        <div className="absolute top-2 right-2">
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            이탈 의심
          </Badge>
        </div>
      )}

      {/* 학생 정보 */}
      <div className="flex items-start gap-3">
        {/* 아바타 */}
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          {/* 접속 상태 점 */}
          <div
            className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
              isOnline ? "bg-green-500" : "bg-muted-foreground"
            )}
          />
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{name}</h4>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {courseName}
          </p>

          {/* 진도율 */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">진도율</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* 상태 정보 */}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={isOnline ? "default" : "secondary"} className="text-xs">
              {isOnline ? "접속 중" : "오프라인"}
            </Badge>
            {!isFocused && (
              <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
                화면 이탈
              </Badge>
            )}
            {minutesSinceLastActivity >= 10 && isOnline && (
              <Badge variant="outline" className="text-xs text-red-500 border-red-500">
                {minutesSinceLastActivity}분 대기
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
