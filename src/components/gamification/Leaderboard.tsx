import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  level: number;
  rank: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export const Leaderboard = ({ entries, currentUserId }: LeaderboardProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30";
      case 2:
        return "from-gray-400/20 to-gray-400/5 border-gray-400/30";
      case 3:
        return "from-amber-700/20 to-amber-700/5 border-amber-700/30";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          리더보드
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry) => {
            const isCurrentUser = entry.user_id === currentUserId;
            const isTopThree = entry.rank <= 3;
            
            return (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isCurrentUser 
                    ? "bg-primary/10 border-primary" 
                    : isTopThree
                    ? `bg-gradient-to-r ${getRankColor(entry.rank)} border`
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback>
                      {entry.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate flex items-center gap-2">
                      {entry.full_name}
                      {isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">
                          나
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      레벨 {entry.level}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {entry.total_points.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">포인트</div>
                </div>
              </div>
            );
          })}
          
          {entries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              아직 리더보드에 데이터가 없습니다.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};