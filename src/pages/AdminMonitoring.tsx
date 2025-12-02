import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Monitor, Users, UserCheck, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Cohort {
  id: string;
  name: string;
  course_id: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

interface StudentActivity {
  id: string;
  user_id: string;
  cohort_id: string;
  current_course_id: string | null;
  progress_percentage: number;
  is_online: boolean;
  is_focus: boolean;
  status: 'active' | 'focus_out' | 'idle' | 'offline';
  last_active_at: string;
  last_heartbeat_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
  course?: {
    title: string;
  };
}

const AdminMonitoring = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCohorts();
  }, []);

  useEffect(() => {
    if (selectedCohort) {
      fetchStudents();
      subscribeToStudentUpdates();
    }
  }, [selectedCohort]);

  const fetchCohorts = async () => {
    try {
      const { data, error } = await supabase
        .from("cohorts")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setCohorts(data || []);
      if (data && data.length > 0) {
        setSelectedCohort(data[0].id);
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "기수 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedCohort) return;

    try {
      // Fetch student activity status
      const { data: activityData, error: activityError } = await supabase
        .from("student_activity_status")
        .select("*")
        .eq("cohort_id", selectedCohort);

      if (activityError) throw activityError;

      if (!activityData || activityData.length === 0) {
        setStudents([]);
        return;
      }

      // Get unique user IDs and course IDs
      const userIds = [...new Set(activityData.map(a => a.user_id))];
      const courseIds = [...new Set(activityData.map(a => a.current_course_id).filter(Boolean))];

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      // Fetch courses
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds);

      // Create lookup maps
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      const coursesMap = new Map(coursesData?.map(c => [c.id, c]) || []);

      // Combine data
      const combined = activityData.map(activity => ({
        ...activity,
        profile: profilesMap.get(activity.user_id),
        course: activity.current_course_id ? coursesMap.get(activity.current_course_id) : undefined
      }));

      setStudents(combined as StudentActivity[]);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const subscribeToStudentUpdates = () => {
    if (!selectedCohort) return;

    const channel = supabase
      .channel('student-activity-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_activity_status',
          filter: `cohort_id=eq.${selectedCohort}`
        },
        () => {
          fetchStudents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'focus_out':
      case 'idle':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '학습중';
      case 'focus_out':
        return '화면 이탈';
      case 'idle':
        return '미반응';
      case 'offline':
        return '오프라인';
      default:
        return status;
    }
  };

  const totalStudents = students.length;
  const onlineStudents = students.filter(s => s.is_online).length;
  const alertStudents = students.filter(s => s.status === 'focus_out' || s.status === 'idle').length;

  const formatLastActive = (timestamp: string) => {
    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${Math.floor(diffHours / 24)}일 전`;
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="flex h-[calc(100vh-4rem)] gap-6">
        {/* Left Sidebar - Cohort Selection */}
        <div className="w-64 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">진행 기수</h2>
            <div className="space-y-2">
              {cohorts.map((cohort) => (
                <Card
                  key={cohort.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedCohort === cohort.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedCohort(cohort.id)}
                >
                  <CardContent className="p-4">
                    <div className="font-medium">{cohort.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(cohort.start_date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 space-y-6 overflow-auto">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Monitor className="h-7 w-7 text-primary" />
              실시간 훈련생 모니터링
            </h1>
            <p className="text-muted-foreground mt-2">
              훈련생들의 학습 상태를 실시간으로 모니터링합니다
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 훈련생</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground mt-1">등록된 훈련생</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">현재 접속</CardTitle>
                <UserCheck className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{onlineStudents}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  접속률: {totalStudents > 0 ? Math.round((onlineStudents / totalStudents) * 100) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">이탈 의심</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{alertStudents}</div>
                <p className="text-xs text-muted-foreground mt-1">즉시 확인 필요</p>
              </CardContent>
            </Card>
          </div>

          {/* Student Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => {
              const isAlert = student.status === 'focus_out' || student.status === 'idle';
              
              return (
                <Card
                  key={student.id}
                  className={cn(
                    "relative transition-all",
                    isAlert && "border-red-500 animate-pulse"
                  )}
                >
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      getStatusColor(student.status)
                    )} />
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Student Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {student.profile?.full_name?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {student.profile?.full_name || '이름 없음'}
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {getStatusText(student.status)}
                          </Badge>
                        </div>
                      </div>

                      {/* Course Info */}
                      {student.course && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">현재 수강</div>
                          <div className="text-sm font-medium truncate">
                            {student.course.title}
                          </div>
                        </div>
                      )}

                      {/* Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">진도율</span>
                          <span className="text-sm font-semibold">
                            {Math.round(student.progress_percentage || 0)}%
                          </span>
                        </div>
                        <Progress value={student.progress_percentage || 0} className="h-2" />
                      </div>

                      {/* Last Active */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatLastActive(student.last_active_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {students.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  선택된 기수에 등록된 훈련생이 없습니다.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminMonitoring;
