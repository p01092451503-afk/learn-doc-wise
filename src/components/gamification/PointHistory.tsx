import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  FileCheck, 
  GraduationCap, 
  Flame, 
  MessageSquare, 
  MessageCircle,
  LogIn 
} from "lucide-react";

interface PointHistoryEntry {
  id: string;
  points: number;
  action_type: string;
  description: string;
  created_at: string;
}

interface PointHistoryProps {
  history: PointHistoryEntry[];
}

const actionIcons = {
  lesson_completed: BookOpen,
  assignment_completed: FileCheck,
  course_completed: GraduationCap,
  streak_bonus: Flame,
  community_post: MessageSquare,
  community_comment: MessageCircle,
  login: LogIn,
};

const actionLabels = {
  lesson_completed: "강의 완료",
  assignment_completed: "과제 완료",
  course_completed: "과정 완료",
  streak_bonus: "연속 학습 보너스",
  community_post: "게시글 작성",
  community_comment: "댓글 작성",
  login: "로그인",
};

export const PointHistory = ({ history }: PointHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>포인트 이력</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {history.map((entry) => {
              const Icon = actionIcons[entry.action_type as keyof typeof actionIcons];
              const label = actionLabels[entry.action_type as keyof typeof actionLabels];
              
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5">
                    {Icon && <Icon className="h-5 w-5 text-primary" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium">{label}</span>
                      <Badge 
                        variant={entry.points > 0 ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {entry.points > 0 ? "+" : ""}{entry.points}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.created_at).toLocaleString('ko-KR')}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {history.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                아직 포인트 이력이 없습니다.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};