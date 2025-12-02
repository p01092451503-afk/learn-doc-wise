import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, AlertTriangle, Eye } from "lucide-react";
import { CohortList } from "./CohortList";
import { StudentCard } from "./StudentCard";
import { AtomLoader } from "@/components/AtomLoader";
import { EmptyState } from "@/components/operator/EmptyState";

interface Cohort {
  id: string;
  name: string;
  courseName: string;
  startDate: string;
  endDate?: string;
  studentCount: number;
  isActive: boolean;
}

interface StudentActivity {
  studentId: string;
  name: string;
  courseName: string;
  progress: number;
  isOnline: boolean;
  isFocused: boolean;
  lastMouseMovement: Date;
  avatarUrl?: string;
}

export function StudentMonitoringDashboard() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 통계 계산
  const totalStudents = students.length;
  const onlineStudents = students.filter((s) => s.isOnline).length;
  const alertStudents = students.filter((s) => {
    const now = new Date();
    const minutesSinceLastActivity = Math.floor(
      (now.getTime() - s.lastMouseMovement.getTime()) / 1000 / 60
    );
    return !s.isFocused || minutesSinceLastActivity >= 10;
  }).length;

  // 기수 목록 불러오기
  useEffect(() => {
    fetchCohorts();
  }, []);

  // 선택된 기수의 학생 활동 불러오기
  useEffect(() => {
    if (selectedCohortId) {
      fetchStudentActivities(selectedCohortId);
      subscribeToActivityUpdates(selectedCohortId);
    }
  }, [selectedCohortId]);

  const fetchCohorts = async () => {
    try {
      const { data: cohortsData, error: cohortsError } = await supabase
        .from("cohorts")
        .select(
          `
          id,
          name,
          start_date,
          end_date,
          is_active,
          course_id,
          courses (
            title
          )
        `
        )
        .eq("is_active", true)
        .order("start_date", { ascending: false });

      if (cohortsError) throw cohortsError;

      // 각 기수의 학생 수 계산
      const cohortsWithCount = await Promise.all(
        (cohortsData || []).map(async (cohort) => {
          const { count } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .eq("cohort_id", cohort.id);

          return {
            id: cohort.id,
            name: cohort.name,
            courseName: (cohort.courses as any)?.title || "알 수 없는 강의",
            startDate: cohort.start_date,
            endDate: cohort.end_date,
            studentCount: count || 0,
            isActive: cohort.is_active,
          };
        })
      );

      setCohorts(cohortsWithCount);

      // 첫 번째 기수 자동 선택
      if (cohortsWithCount.length > 0 && !selectedCohortId) {
        setSelectedCohortId(cohortsWithCount[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching cohorts:", error);
      toast({
        title: "오류",
        description: "기수 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentActivities = async (cohortId: string) => {
    try {
      setLoading(true);

      // 해당 기수의 학생 목록
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(
          `
          user_id,
          progress,
          course_id,
          courses (
            title
          )
        `
        )
        .eq("cohort_id", cohortId);

      if (enrollmentsError) throw enrollmentsError;

      if (!enrollments || enrollments.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // 학생 프로필 정보
      const userIds = enrollments.map((e) => e.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // 학생 활동 추적 정보
      const { data: activities, error: activitiesError } = await supabase
        .from("student_activity_tracking")
        .select("*")
        .eq("cohort_id", cohortId)
        .in("user_id", userIds);

      if (activitiesError) throw activitiesError;

      // 데이터 결합
      const studentsData: StudentActivity[] = enrollments.map((enrollment) => {
        const profile = profiles?.find((p) => p.user_id === enrollment.user_id);
        const activity = activities?.find((a) => a.user_id === enrollment.user_id);

        return {
          studentId: enrollment.user_id,
          name: profile?.full_name || "이름 없음",
          courseName: (enrollment.courses as any)?.title || "알 수 없는 강의",
          progress: enrollment.progress || 0,
          isOnline: activity?.is_online || false,
          isFocused: activity?.is_focused !== false,
          lastMouseMovement: activity?.last_mouse_movement_at
            ? new Date(activity.last_mouse_movement_at)
            : new Date(),
          avatarUrl: profile?.avatar_url || undefined,
        };
      });

      setStudents(studentsData);
    } catch (error: any) {
      console.error("Error fetching student activities:", error);
      toast({
        title: "오류",
        description: "학생 활동 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToActivityUpdates = (cohortId: string) => {
    const channel = supabase
      .channel(`monitoring-${cohortId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "student_activity_tracking",
          filter: `cohort_id=eq.${cohortId}`,
        },
        () => {
          // 실시간 업데이트 시 데이터 다시 불러오기
          fetchStudentActivities(cohortId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading && cohorts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AtomLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Eye className="h-7 w-7 text-primary" />
          실시간 훈련생 모니터링
        </h1>
        <p className="text-muted-foreground">
          K-Digital Training 심사 요건 대응 시스템
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* 왼쪽: 기수 목록 */}
        <div>
          <CohortList
            cohorts={cohorts}
            selectedCohortId={selectedCohortId}
            onSelectCohort={setSelectedCohortId}
          />
        </div>

        {/* 오른쪽: 통계 및 학생 목록 */}
        <div className="space-y-6">
          {/* 상단 요약 통계 */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatsCard
              title="총 수강생"
              value={totalStudents.toString()}
              icon={<Users className="h-4 w-4" />}
              description="등록된 전체 학생"
            />
            <StatsCard
              title="현재 접속자"
              value={onlineStudents.toString()}
              icon={<Activity className="h-4 w-4 text-green-500" />}
              description="온라인 학습 중"
              valueColor="text-green-500"
            />
            <StatsCard
              title="이탈 의심자"
              value={alertStudents.toString()}
              icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
              description="즉시 확인 필요"
              valueColor="text-destructive"
            />
          </div>

          {/* 학생 카드 그리드 */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <AtomLoader />
            </div>
          ) : students.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={Users}
                  title="등록된 학생이 없습니다"
                  description="선택한 기수에 등록된 학생이 없습니다"
                  theme="light"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {students.map((student) => (
                <StudentCard key={student.studentId} {...student} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatsCard = ({
  title,
  value,
  icon,
  description,
  valueColor = "text-foreground",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  valueColor?: string;
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium whitespace-nowrap">{title}</CardTitle>
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-1 min-w-0">
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
      <p className="text-xs text-muted-foreground whitespace-nowrap">{description}</p>
    </CardContent>
  </Card>
);
