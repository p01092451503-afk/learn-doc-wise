import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_type: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement_value: number;
  earned?: boolean;
  earned_at?: string;
}

interface BadgeDisplayProps {
  badges: BadgeItem[];
}

const badgeStyles = {
  bronze: {
    gradient: "from-orange-400 via-orange-500 to-orange-700",
    shadow: "shadow-[0_0_30px_rgba(251,146,60,0.5)]",
    glow: "group-hover:shadow-[0_0_50px_rgba(251,146,60,0.7)]",
  },
  silver: {
    gradient: "from-gray-200 via-gray-300 to-gray-500",
    shadow: "shadow-[0_0_30px_rgba(156,163,175,0.5)]",
    glow: "group-hover:shadow-[0_0_50px_rgba(156,163,175,0.7)]",
  },
  gold: {
    gradient: "from-yellow-300 via-yellow-400 to-yellow-600",
    shadow: "shadow-[0_0_30px_rgba(250,204,21,0.5)]",
    glow: "group-hover:shadow-[0_0_50px_rgba(250,204,21,0.7)]",
  },
  platinum: {
    gradient: "from-cyan-300 via-blue-400 to-purple-500",
    shadow: "shadow-[0_0_30px_rgba(139,92,246,0.5)]",
    glow: "group-hover:shadow-[0_0_50px_rgba(139,92,246,0.7)]",
  },
};

export const BadgeDisplay = ({ badges }: BadgeDisplayProps) => {
  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>획득한 배지</CardTitle>
          <Badge variant="secondary" className="text-sm">
            {earnedBadges.length} / {badges.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {earnedBadges.map((badge) => {
            const style = badgeStyles[badge.badge_type];
            return (
              <TooltipProvider key={badge.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="group flex flex-col items-center gap-2 cursor-pointer">
                      <div
                        className={`relative w-full aspect-square rounded-full bg-gradient-to-br ${style.gradient} ${style.shadow} ${style.glow} transition-all duration-300 flex items-center justify-center hover:scale-110 border-4 border-white/20`}
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="text-5xl relative z-10 drop-shadow-lg">{badge.icon}</div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-50" />
                      </div>
                      <span className="text-xs font-medium text-center line-clamp-2">{badge.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center max-w-xs">
                      <div className="font-bold">{badge.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
                      {badge.earned_at && (
                        <div className="text-xs mt-2 text-green-500">
                          획득: {new Date(badge.earned_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
          
          {lockedBadges.map((badge) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="group flex flex-col items-center gap-2 cursor-pointer">
                    <div className="relative w-full aspect-square rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center border-4 border-gray-400/30 opacity-40">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="text-4xl grayscale relative z-10">{badge.icon}</div>
                      <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-center line-clamp-2 text-muted-foreground">???</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center max-w-xs">
                    <div className="font-bold">{badge.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
                    <div className="text-xs mt-2 text-orange-500">
                      목표: {badge.requirement_value}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};