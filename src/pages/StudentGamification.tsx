import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserStats } from "@/components/gamification/UserStats";
import { BadgeDisplay } from "@/components/gamification/BadgeDisplay";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { PointHistory } from "@/components/gamification/PointHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function StudentGamification() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserId(user.id);

      // 사용자 통계 로드
      const { data: statsData } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (statsData) {
        setUserStats(statsData);
      } else {
        // 게이미피케이션 데이터가 없으면 기본값 표시
        setUserStats({
          total_points: 0,
          level: 1,
          experience_points: 0,
          streak_days: 0,
        });
      }

      // 배지 정보 로드
      const { data: allBadges } = await supabase
        .from("badges")
        .select("*")
        .order("requirement_value", { ascending: true });

      const { data: userBadges } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", user.id);

      const badgesWithStatus = (allBadges || []).map(badge => ({
        ...badge,
        earned: userBadges?.some(ub => ub.badge_id === badge.id),
        earned_at: userBadges?.find(ub => ub.badge_id === badge.id)?.earned_at,
      }));

      setBadges(badgesWithStatus);

      // 리더보드 로드
      const { data: leaderboardData } = await supabase
        .from("leaderboard")
        .select("*")
        .limit(10);

      setLeaderboard(leaderboardData || []);

      // 포인트 이력 로드
      const { data: historyData } = await supabase
        .from("point_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setPointHistory(historyData || []);

    } catch (error) {
      console.error("Error loading gamification data:", error);
      toast({
        title: "오류",
        description: "게이미피케이션 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!userStats) {
    return (
      <DashboardLayout userRole="student">
        <div className="text-center">
          <p className="text-muted-foreground">게이미피케이션 데이터를 불러올 수 없습니다.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">나의 학습 현황</h1>
          <p className="text-muted-foreground">
            학습을 통해 포인트를 모으고 배지를 획득하세요!
          </p>
        </div>

      <UserStats
        totalPoints={userStats.total_points}
        level={userStats.level}
        experiencePoints={userStats.experience_points}
        streakDays={userStats.streak_days}
      />

      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges">배지</TabsTrigger>
          <TabsTrigger value="leaderboard">리더보드</TabsTrigger>
          <TabsTrigger value="history">포인트 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="mt-6">
          <BadgeDisplay badges={badges} />
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <Leaderboard entries={leaderboard} currentUserId={currentUserId} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <PointHistory history={pointHistory} />
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}