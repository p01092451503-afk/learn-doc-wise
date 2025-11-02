import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserStats } from "@/components/gamification/UserStats";
import { BadgeDisplay } from "@/components/gamification/BadgeDisplay";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { PointHistory } from "@/components/gamification/PointHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Trophy } from "lucide-react";

const mockBadges = [
  { id: '1', name: '첫 걸음', description: '첫 강의를 시작했습니다', icon: '🌱', badge_type: 'bronze', requirement_type: 'lessons_completed', requirement_value: 1, earned: true, earned_at: new Date().toISOString() },
  { id: '2', name: '학습왕', description: '10개 강의를 완료했습니다', icon: '📚', badge_type: 'silver', requirement_type: 'lessons_completed', requirement_value: 10, earned: true, earned_at: new Date().toISOString() },
  { id: '3', name: '연속 학습 3일', description: '3일 연속으로 학습했습니다', icon: '🔥', badge_type: 'bronze', requirement_type: 'streak', requirement_value: 3, earned: true, earned_at: new Date().toISOString() },
  { id: '4', name: '포인트 1000', description: '1000 포인트를 획득했습니다', icon: '⭐', badge_type: 'silver', requirement_type: 'points', requirement_value: 1000, earned: true, earned_at: new Date().toISOString() },
  { id: '5', name: '마스터', description: '50개 강의를 완료했습니다', icon: '🏆', badge_type: 'gold', requirement_type: 'lessons_completed', requirement_value: 50, earned: false },
  { id: '6', name: '전설', description: '100개 강의를 완료했습니다', icon: '👑', badge_type: 'platinum', requirement_type: 'lessons_completed', requirement_value: 100, earned: false },
  { id: '7', name: '연속 학습 7일', description: '7일 연속으로 학습했습니다', icon: '⚡', badge_type: 'silver', requirement_type: 'streak', requirement_value: 7, earned: false },
  { id: '8', name: '포인트 5000', description: '5000 포인트를 획득했습니다', icon: '🌟', badge_type: 'gold', requirement_type: 'points', requirement_value: 5000, earned: false },
];

const mockLeaderboard = [
  { rank: 1, user_id: '1', full_name: '김철수', total_points: 5420, level: 54, avatar_url: null },
  { rank: 2, user_id: '2', full_name: '이영희', total_points: 4890, level: 49, avatar_url: null },
  { rank: 3, user_id: '3', full_name: '박진열', total_points: 1250, level: 13, avatar_url: null },
  { rank: 4, user_id: '4', full_name: '최민수', total_points: 980, level: 10, avatar_url: null },
  { rank: 5, user_id: '5', full_name: '정수진', total_points: 750, level: 8, avatar_url: null },
];

const mockPointHistory = [
  { id: '1', points: 50, action_type: 'lesson_completed', description: 'React 기초 강의 완료', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', points: 100, action_type: 'assignment_completed', description: '과제 제출 완료', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', points: 50, action_type: 'streak_bonus', description: '5일 연속 학습 보너스', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', points: 30, action_type: 'lesson_completed', description: 'CSS 스타일링 완료', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: '5', points: 20, action_type: 'community_post', description: '질문 게시글 작성', created_at: new Date(Date.now() - 259200000).toISOString() },
];

export default function StudentGamification() {
  const [searchParams] = useSearchParams();
  const isDemoMode = searchParams.has('role');
  const { toast } = useToast();
  const [loading, setLoading] = useState(!isDemoMode);
  const [userStats, setUserStats] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    if (isDemoMode) {
      // 데모 모드에서는 하드코딩된 데이터 사용
      setUserStats({
        total_points: 1250,
        level: 13,
        experience_points: 1250,
        streak_days: 5,
      });
      setBadges(mockBadges);
      setLeaderboard(mockLeaderboard);
      setPointHistory(mockPointHistory);
      setCurrentUserId('3');
      setLoading(false);
    } else {
      loadData();
    }
  }, [isDemoMode]);

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
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="h-8 w-8" />
            나의 학습 현황
          </h1>
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