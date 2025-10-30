import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AttendanceCheckerProps {
  courseId: string;
  contentId?: string;
}

export const AttendanceChecker = ({ courseId, contentId }: AttendanceCheckerProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [todayStatus, setTodayStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCheckIn = async () => {
    setIsChecking(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다");

      // 오늘 날짜 가져오기
      const today = new Date().toISOString().split('T')[0];
      
      // 이미 출석했는지 확인
      const { data: existing } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('attendance_date', today)
        .maybeSingle();

      if (existing) {
        toast({
          title: "이미 출석 완료",
          description: "오늘은 이미 출석체크를 하셨습니다.",
          variant: "destructive",
        });
        setTodayStatus(existing.status);
        return;
      }

      // 출석 시간 체크 (오전 6시 ~ 밤 11시 59분)
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      let status = 'present';
      if (hour < 6 || (hour === 23 && minute > 30)) {
        status = 'late';
      }

      // 출석 기록
      const { error } = await supabase
        .from('attendance')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          content_id: contentId || null,
          attendance_date: today,
          check_in_time: now.toISOString(),
          status: status as 'present' | 'late' | 'absent' | 'excused',
        }]);

      if (error) throw error;

      setTodayStatus(status);
      toast({
        title: "출석 완료",
        description: status === 'present' ? "출석이 정상적으로 기록되었습니다." : "지각으로 기록되었습니다.",
      });
    } catch (error) {
      console.error("출석 체크 오류:", error);
      toast({
        title: "출석 실패",
        description: "출석 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <Badge className="gap-1 bg-green-500">
            <CheckCircle className="h-3 w-3" />
            출석
          </Badge>
        );
      case 'late':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            지각
          </Badge>
        );
      case 'absent':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            결석
          </Badge>
        );
      case 'excused':
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            인정 결석
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          출석 체크
          {todayStatus && getStatusBadge(todayStatus)}
        </CardTitle>
        <CardDescription>
          오늘 수업에 출석체크를 진행해주세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleCheckIn}
          disabled={isChecking || !!todayStatus}
          className="w-full"
          size="lg"
        >
          {isChecking ? "처리 중..." : todayStatus ? "출석 완료" : "출석하기"}
        </Button>
        {todayStatus && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            오늘 출석이 완료되었습니다.
          </p>
        )}
      </CardContent>
    </Card>
  );
};