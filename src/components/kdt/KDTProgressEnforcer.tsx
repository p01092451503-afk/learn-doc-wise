import { ReactNode } from "react";
import { AlertTriangle, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContentItem {
  id: string;
  title: string;
  order_index: number;
}

interface ProgressItem {
  content_id: string;
  completed: boolean;
  progress_percentage: number;
}

interface KDTProgressEnforcerProps {
  contents: ContentItem[];
  progress: ProgressItem[];
  currentContentId: string;
  onSelectContent: (content: ContentItem) => void;
  onSkipAttempt?: (currentIndex: number, targetIndex: number) => void;
  requiredProgressPercent?: number;
  children?: (props: { 
    canAccess: (contentId: string) => boolean; 
    getLockedReason: (contentId: string) => string | null;
  }) => ReactNode;
}

const KDTProgressEnforcer = ({
  contents,
  progress,
  currentContentId,
  onSelectContent,
  onSkipAttempt,
  requiredProgressPercent = 80,
  children,
}: KDTProgressEnforcerProps) => {
  // 콘텐츠가 완료되었는지 확인
  const isContentCompleted = (contentId: string) => {
    const contentProgress = progress.find(p => p.content_id === contentId);
    return contentProgress?.completed || (contentProgress?.progress_percentage || 0) >= requiredProgressPercent;
  };

  // 콘텐츠에 접근 가능한지 확인
  const canAccessContent = (contentId: string) => {
    const content = contents.find(c => c.id === contentId);
    if (!content) return false;

    // 첫 번째 콘텐츠는 항상 접근 가능
    if (content.order_index === 1) return true;

    // 이전 콘텐츠가 완료되었는지 확인
    const previousContent = contents.find(c => c.order_index === content.order_index - 1);
    if (!previousContent) return true;

    return isContentCompleted(previousContent.id);
  };

  // 잠금 사유 반환
  const getLockedReason = (contentId: string): string | null => {
    if (canAccessContent(contentId)) return null;

    const content = contents.find(c => c.id === contentId);
    if (!content) return "콘텐츠를 찾을 수 없습니다.";

    const previousContent = contents.find(c => c.order_index === content.order_index - 1);
    if (!previousContent) return null;

    const prevProgress = progress.find(p => p.content_id === previousContent.id);
    const prevPercent = prevProgress?.progress_percentage || 0;

    return `이전 차시 "${previousContent.title}"을(를) ${requiredProgressPercent}% 이상 시청해야 합니다. (현재: ${Math.round(prevPercent)}%)`;
  };

  // 콘텐츠 선택 핸들러
  const handleSelectContent = (content: ContentItem) => {
    const currentContent = contents.find(c => c.id === currentContentId);
    const targetContent = content;

    if (!canAccessContent(content.id)) {
      // 스킵 시도 로깅
      if (currentContent && onSkipAttempt) {
        onSkipAttempt(currentContent.order_index, targetContent.order_index);
      }
      return;
    }

    onSelectContent(content);
  };

  // render props 패턴 지원
  if (children) {
    return <>{children({ canAccess: canAccessContent, getLockedReason })}</>;
  }

  // 기본 UI 렌더링
  return (
    <div className="space-y-2">
      {contents.map((content, index) => {
        const canAccess = canAccessContent(content.id);
        const lockedReason = getLockedReason(content.id);
        const contentProgress = progress.find(p => p.content_id === content.id);
        const progressPercent = contentProgress?.progress_percentage || 0;
        const isCompleted = isContentCompleted(content.id);
        const isCurrent = content.id === currentContentId;

        return (
          <Card
            key={content.id}
            className={`cursor-pointer transition-all ${
              isCurrent 
                ? "ring-2 ring-primary border-primary" 
                : canAccess 
                  ? "hover:border-primary/50" 
                  : "opacity-60 cursor-not-allowed"
            }`}
            onClick={() => handleSelectContent(content)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {index + 1}차시
                    </span>
                    {isCompleted && (
                      <Badge variant="default" className="text-xs">완료</Badge>
                    )}
                    {!canAccess && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Lock className="h-3 w-3" />
                        잠김
                      </Badge>
                    )}
                  </div>
                  <h4 className={`font-medium truncate ${!canAccess ? "text-muted-foreground" : ""}`}>
                    {content.title}
                  </h4>
                  {progressPercent > 0 && progressPercent < 100 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>진도율</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {!canAccess && (
                  <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              
              {/* 잠금 사유 표시 */}
              {!canAccess && lockedReason && (
                <div className="mt-3 flex items-start gap-2 p-2 bg-orange-500/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {lockedReason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KDTProgressEnforcer;
