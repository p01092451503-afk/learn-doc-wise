import { Trophy, Zap, Flame, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UserStatsProps {
  totalPoints: number;
  level: number;
  experiencePoints: number;
  streakDays: number;
}

export const UserStats = ({ totalPoints, level, experiencePoints, streakDays }: UserStatsProps) => {
  const pointsToNextLevel = level * 100;
  const currentLevelProgress = experiencePoints % 100;
  const progressPercentage = (currentLevelProgress / 100) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground">레벨</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{level}</div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {currentLevelProgress} / 100 XP
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <span className="text-xs text-muted-foreground">총 포인트</span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">획득한 포인트</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-xs text-muted-foreground">연속 학습</span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{streakDays}일</div>
            <div className="text-xs text-muted-foreground">
              {streakDays >= 7 ? "🔥 대단해요!" : "계속 도전하세요!"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-xs text-muted-foreground">경험치</span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{experiencePoints.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">총 경험치</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};