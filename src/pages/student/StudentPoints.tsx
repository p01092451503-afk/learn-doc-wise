import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Coins, TrendingUp, TrendingDown, Gift } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";

interface PointHistory {
  id: string;
  created_at: string;
  points: number;
  action_type: string;
  description: string;
}

const StudentPoints = () => {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPointsData();
  }, []);

  const fetchPointsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 포인트 데이터 조회
      const { data: pointsData, error: pointsError } = await supabase
        .from("user_gamification")
        .select("total_points")
        .eq("user_id", user.id)
        .maybeSingle();

      if (pointsError) throw pointsError;
      setPoints(pointsData?.total_points || 0);

      // 포인트 히스토리 조회
      const { data: historyData, error: historyError } = await supabase
        .from("point_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (historyError) throw historyError;
      setHistory(historyData || []);
    } catch (error) {
      console.error("Error fetching points:", error);
      toast({
        title: "오류",
        description: "포인트 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionTypeText = (actionType: string) => {
    const types: Record<string, string> = {
      lesson_completed: "강의 완료",
      assignment_completed: "과제 제출",
      community_post: "게시글 작성",
      community_comment: "댓글 작성",
      streak_bonus: "연속 학습 보너스",
      badge_earned: "배지 획득",
      course_completed: "강좌 수료",
      perfect_attendance: "개근 보너스",
    };
    return types[actionType] || actionType;
  };

  const nextMilestone = Math.ceil(points / 1000) * 1000;
  const milestoneProgress = (points / nextMilestone) * 100;

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Coins className="h-8 w-8 text-accent" />
            포인트 & 마일리지
          </h1>
          <p className="text-muted-foreground mt-2">
            학습 활동으로 포인트를 모아 다양한 혜택을 받으세요
          </p>
        </div>

        {/* 포인트 현황 */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>내 포인트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 mb-4">
                    <Coins className="h-12 w-12 text-accent" />
                  </div>
                  <p className="text-5xl font-bold text-gradient mb-2">
                    {points.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground">보유 포인트</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      다음 마일스톤까지
                    </span>
                    <span className="font-semibold">
                      {(nextMilestone - points).toLocaleString()}P
                    </span>
                  </div>
                  <Progress value={milestoneProgress} className="h-3" />
                  <p className="text-xs text-muted-foreground text-right">
                    {nextMilestone.toLocaleString()}P 달성 시 특별 보상!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                포인트 사용
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border bg-muted/50">
                <p className="font-semibold mb-1">강의 할인</p>
                <p className="text-sm text-muted-foreground">
                  1,000P = ₩1,000 할인
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/50">
                <p className="font-semibold mb-1">프리미엄 기능</p>
                <p className="text-sm text-muted-foreground">
                  특별 기능 잠금 해제
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/50">
                <p className="font-semibold mb-1">배지 구매</p>
                <p className="text-sm text-muted-foreground">
                  한정판 배지 획득
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 적립/사용 내역 */}
        <Card>
          <CardHeader>
            <CardTitle>포인트 내역</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">포인트 내역을 불러오는 중...</p>
                </div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">포인트 내역이 없습니다</h3>
                <p className="text-muted-foreground">
                  학습 활동을 통해 포인트를 적립해보세요!
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>일시</TableHead>
                    <TableHead>활동</TableHead>
                    <TableHead>상세 내용</TableHead>
                    <TableHead className="text-right">포인트</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(item.created_at), "yyyy.MM.dd HH:mm", { locale: ko })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getActionTypeText(item.action_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center justify-end gap-1 font-semibold ${
                          item.points > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {item.points > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {item.points > 0 ? "+" : ""}{item.points.toLocaleString()}P
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentPoints;
