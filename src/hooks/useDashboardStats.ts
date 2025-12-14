import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// 학생 대시보드 통계
export const useStudentDashboardStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['student-dashboard-stats', userId],
    queryFn: async () => {
      if (!userId) return null;

      // 수강 중인 강좌 수
      const { count: enrolledCourses } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // 완료한 과제 수
      const { count: completedAssignments } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', userId)
        .eq('status', 'graded');

      // 전체 과제 수 (수강 중인 강좌 기준)
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', userId);

      const courseIds = enrollments?.map(e => e.course_id) || [];
      
      let totalAssignments = 0;
      if (courseIds.length > 0) {
        const { count } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .in('course_id', courseIds)
          .eq('status', 'published');
        totalAssignments = count || 0;
      }

      // 획득한 배지 수
      const { count: earnedBadges } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // 학습 시간 (분 -> 시간)
      const { data: learningGoals } = await supabase
        .from('daily_learning_goals')
        .select('completed_minutes')
        .eq('user_id', userId);

      const totalMinutes = learningGoals?.reduce((sum, g) => sum + (g.completed_minutes || 0), 0) || 0;
      const learningHours = (totalMinutes / 60).toFixed(1);

      // 수강 중인 강좌 목록 (진행률 포함)
      const { data: enrolledCoursesData } = await supabase
        .from('enrollments')
        .select(`
          id,
          progress,
          course:courses(
            id,
            title,
            instructor_id
          )
        `)
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .limit(5);

      return {
        enrolledCourses: enrolledCourses || 0,
        completedAssignments: completedAssignments || 0,
        totalAssignments,
        earnedBadges: earnedBadges || 0,
        learningHours,
        enrolledCoursesData: enrolledCoursesData || [],
      };
    },
    staleTime: 30 * 1000, // 30초 캐싱
    enabled: !!userId,
  });
};

// 강사 대시보드 통계
export const useTeacherDashboardStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['teacher-dashboard-stats', userId],
    queryFn: async () => {
      if (!userId) return null;

      // 강사가 가르치는 강좌들
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, status')
        .eq('instructor_id', userId);

      const courseIds = courses?.map(c => c.id) || [];
      const activeCourses = courses?.filter(c => c.status === 'published').length || 0;
      const pendingCourses = courses?.filter(c => c.status === 'draft').length || 0;

      // 전체 학생 수
      let totalStudents = 0;
      if (courseIds.length > 0) {
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .in('course_id', courseIds);
        totalStudents = count || 0;
      }

      // 강좌별 학생 수와 정보
      const coursesWithStats = await Promise.all(
        (courses || []).slice(0, 5).map(async (course) => {
          const { count: studentCount } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          return {
            ...course,
            studentCount: studentCount || 0,
          };
        })
      );

      // 최근 활동 (과제 제출, 출석 등)
      let recentSubmissions: any[] = [];
      if (courseIds.length > 0) {
        const { data: assignments } = await supabase
          .from('assignments')
          .select('id')
          .in('course_id', courseIds);

        const assignmentIds = assignments?.map(a => a.id) || [];

        if (assignmentIds.length > 0) {
          const { data: submissions } = await supabase
            .from('assignment_submissions')
            .select(`
              id,
              submitted_at,
              status,
              student_id,
              assignment:assignments(title, course:courses(title))
            `)
            .in('assignment_id', assignmentIds)
            .order('submitted_at', { ascending: false })
            .limit(5);

          // 학생 이름 조회
          if (submissions && submissions.length > 0) {
            const studentIds = [...new Set(submissions.map(s => s.student_id))];
            const { data: profiles } = await supabase
              .from('profiles')
              .select('user_id, full_name')
              .in('user_id', studentIds);

            const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

            recentSubmissions = submissions.map(s => ({
              ...s,
              studentName: profileMap.get(s.student_id) || '학생',
            }));
          }
        }
      }

      return {
        totalStudents,
        activeCourses,
        pendingCourses,
        totalCourses: courses?.length || 0,
        coursesWithStats,
        recentSubmissions,
      };
    },
    staleTime: 30 * 1000,
    enabled: !!userId,
  });
};

// 관리자 대시보드 통계
export const useAdminDashboardStats = (tenantId: string | undefined) => {
  return useQuery({
    queryKey: ['admin-dashboard-stats', tenantId],
    queryFn: async () => {
      // 전체 사용자 수
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 역할별 사용자 수
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role');

      const studentCount = roleData?.filter(r => r.role === 'student').length || 0;
      const teacherCount = roleData?.filter(r => r.role === 'teacher').length || 0;
      const adminCount = roleData?.filter(r => r.role === 'admin' || r.role === 'operator').length || 0;

      // 전체 강좌 수
      const { count: totalCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // 강좌 상태별 수
      const { data: courseStatusData } = await supabase
        .from('courses')
        .select('status');

      const activeCourses = courseStatusData?.filter(c => c.status === 'published').length || 0;
      const pendingCourses = courseStatusData?.filter(c => c.status === 'draft').length || 0;
      const archivedCourses = courseStatusData?.filter(c => c.status === 'archived').length || 0;

      // 전체 수강신청 수
      const { count: totalEnrollments } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });

      // 최근 활동 (최근 가입한 사용자)
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('user_id, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // 최근 생성된 강좌
      const { data: recentCourses } = await supabase
        .from('courses')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // AI 토큰 사용량
      const { data: aiUsage } = await supabase
        .from('ai_usage_logs')
        .select('tokens_used')
        .gte('created_at', new Date(new Date().setDate(1)).toISOString()); // 이번 달

      const monthlyTokens = aiUsage?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        studentCount,
        teacherCount,
        adminCount,
        totalCourses: totalCourses || 0,
        activeCourses,
        pendingCourses,
        archivedCourses,
        totalEnrollments: totalEnrollments || 0,
        recentUsers: recentUsers || [],
        recentCourses: recentCourses || [],
        monthlyTokens,
      };
    },
    staleTime: 30 * 1000,
  });
};
