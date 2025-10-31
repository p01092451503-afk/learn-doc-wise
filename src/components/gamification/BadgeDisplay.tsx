import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock } from "lucide-react";
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

const badgeColors = {
  bronze: "from-amber-700 to-amber-900 border-amber-700",
  silver: "from-gray-400 to-gray-600 border-gray-400",
  gold: "from-yellow-400 to-yellow-600 border-yellow-500",
  platinum: "from-purple-400 to-purple-600 border-purple-500",
};

export const BadgeDisplay = ({ badges }: BadgeDisplayProps) => {
  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>획득한 배지</CardTitle>
          <Badge variant="secondary">
            {earnedBadges.length} / {badges.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {earnedBadges.map((badge) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`relative aspect-square rounded-lg bg-gradient-to-br ${badgeColors[badge.badge_type]} border-2 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform`}
                  >
                    <div className="text-4xl">{badge.icon}</div>
                    <CheckCircle2 className="absolute -top-2 -right-2 h-6 w-6 text-green-500 bg-background rounded-full" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="font-bold">{badge.name}</div>
                    <div className="text-xs text-muted-foreground">{badge.description}</div>
                    {badge.earned_at && (
                      <div className="text-xs mt-1">
                        획득: {new Date(badge.earned_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {lockedBadges.map((badge) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative aspect-square rounded-lg bg-muted border-2 border-muted-foreground/20 flex items-center justify-center cursor-pointer opacity-50">
                    <div className="text-4xl grayscale">{badge.icon}</div>
                    <Lock className="absolute -top-2 -right-2 h-6 w-6 text-muted-foreground bg-background rounded-full" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="font-bold">{badge.name}</div>
                    <div className="text-xs text-muted-foreground">{badge.description}</div>
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