import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const StudentCounselingLog = () => {
  // 내 상담 이력 조회 (복호화 RPC 사용 - 비공개가 아닌 것만)
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["my-counseling-logs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: logsData, error: logsError } = await supabase.rpc('get_counseling_logs', {
        p_student_id: user?.id,
      });

      if (logsError) throw logsError;

      // 관련 정보 조인 (courses, profiles)
      const enrichedLogs = await Promise.all((logsData || []).map(async (log: any) => {
        const [courseRes, profileRes] = await Promise.all([
          supabase.from("courses").select("title").eq("id", log.course_id).single(),
          supabase.from("profiles").select("full_name").eq("user_id", log.counselor_id).single(),
        ]);
        
        return {
          ...log,
          courses: courseRes.data,
          profiles: profileRes.data,
        };
      }));

      return enrichedLogs;
    },
  });

  const counselingTypes: { [key: string]: string } = {
    career: "진로 상담",
    learning: "학습 상담",
    life: "생활 상담",
    employment: "취업 상담",
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-violet-500" />
            상담 이력
          </h1>
          <p className="text-muted-foreground mt-2">
            내가 받은 상담 내용을 확인하세요
          </p>
        </div>

        {/* 상담 이력 목록 */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                로딩 중...
              </CardContent>
            </Card>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                상담 이력이 없습니다.
              </CardContent>
            </Card>
          ) : (
            logs.map((log: any) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{log.summary}</CardTitle>
                      <CardDescription>
                        <span className="flex items-center gap-2 mt-1.5">
                          <User className="h-4 w-4" />
                          상담자: {log.profiles?.full_name} • {log.courses?.title}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {counselingTypes[log.counseling_type] || log.counseling_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(log.counseling_date).toLocaleString('ko-KR')}
                  </div>
                  {log.student_concerns && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-semibold mb-1.5">내 고민:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.student_concerns}</p>
                    </div>
                  )}
                  {log.counselor_advice && (
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm font-semibold mb-1.5">상담 조언:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.counselor_advice}</p>
                    </div>
                  )}
                  {log.follow_up_needed && (
                    <div className="text-sm text-muted-foreground px-3 py-2 bg-muted/20 rounded-lg">
                      📋 후속 조치 예정
                      {log.follow_up_date && `: ${new Date(log.follow_up_date).toLocaleDateString('ko-KR')}`}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCounselingLog;
