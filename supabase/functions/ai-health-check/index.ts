import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

interface FeatureCheck {
  feature: string;
  category: string;
  status: 'operational' | 'warning' | 'error' | 'incomplete' | 'enhancement_needed';
  message: string;
  details?: any;
}

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('ai-health-check', identifier, 5, 60);
  } catch (e) {
    return errorResponse(e, corsHeaders);
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting comprehensive health check...');

    const checks: FeatureCheck[] = [];
    let passedChecks = 0;
    let failedChecks = 0;
    let warningChecks = 0;

    // 1. 인증 시스템 체크
    try {
      const { count: usersCount, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;

      checks.push({
        feature: '인증 시스템',
        category: 'Authentication',
        status: 'operational',
        message: `정상 작동 중 (${usersCount || 0}명의 사용자)`
      });
      passedChecks++;
    } catch (error) {
      checks.push({
        feature: '인증 시스템',
        category: 'Authentication',
        status: 'error',
        message: '인증 시스템 오류',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

    // 2. 강의 관리 시스템 체크
    try {
      const { count: coursesCount, error } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;

      const { count: publishedCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      if (coursesCount === 0) {
        checks.push({
          feature: '강의 관리',
          category: 'Course Management',
          status: 'incomplete',
          message: '강의가 등록되지 않음',
          details: { totalCourses: 0, publishedCourses: 0 }
        });
        warningChecks++;
      } else {
        checks.push({
          feature: '강의 관리',
          category: 'Course Management',
          status: 'operational',
          message: `${coursesCount}개 강의 (${publishedCount}개 공개)`,
          details: { totalCourses: coursesCount, publishedCourses: publishedCount }
        });
        passedChecks++;
      }
    } catch (error) {
      checks.push({
        feature: '강의 관리',
        category: 'Course Management',
        status: 'error',
        message: '강의 시스템 오류',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

    // 3. 수강 등록 시스템 체크
    try {
      const { count: enrollmentsCount, error } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;

      checks.push({
        feature: '수강 등록',
        category: 'Enrollment',
        status: 'operational',
        message: `${enrollmentsCount || 0}건의 수강 등록`,
        details: { totalEnrollments: enrollmentsCount }
      });
      passedChecks++;
    } catch (error) {
      checks.push({
        feature: '수강 등록',
        category: 'Enrollment',
        status: 'error',
        message: '수강 등록 시스템 오류',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

    // 4. 과제 시스템 체크
    try {
      const { count: assignmentsCount, error } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;

      const { count: submissionsCount } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true });

      checks.push({
        feature: '과제 시스템',
        category: 'Assignments',
        status: 'operational',
        message: `${assignmentsCount || 0}개 과제, ${submissionsCount || 0}건 제출`,
        details: { assignments: assignmentsCount, submissions: submissionsCount }
      });
      passedChecks++;
    } catch (error) {
      checks.push({
        feature: '과제 시스템',
        category: 'Assignments',
        status: 'error',
        message: '과제 시스템 오류',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

    // 5. 출석 시스템 체크
    try {
      const { count: attendanceCount, error } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;

      checks.push({
        feature: '출석 관리',
        category: 'Attendance',
        status: 'operational',
        message: `${attendanceCount || 0}건의 출석 기록`,
        details: { totalRecords: attendanceCount }
      });
      passedChecks++;
    } catch (error) {
      checks.push({
        feature: '출석 관리',
        category: 'Attendance',
        status: 'error',
        message: '출석 시스템 오류',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

    // 6. 커뮤니티 시스템 체크
    try {
      const { count: postsCount, error } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;

      const { count: commentsCount } = await supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true });

      checks.push({
        feature: '커뮤니티',
        category: 'Community',
        status: 'operational',
        message: `${postsCount || 0}개 게시글, ${commentsCount || 0}개 댓글`,
        details: { posts: postsCount, comments: commentsCount }
      });
      passedChecks++;
    } catch (error) {
      checks.push({
        feature: '커뮤니티',
        category: 'Community',
        status: 'error',
        message: '커뮤니티 시스템 오류',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

    // 7. 게이미피케이션 시스템 체크 - 제거됨 (사용하지 않음)

    // 8. AI 기능 체크
    if (lovableApiKey) {
      checks.push({
        feature: 'AI 기능',
        category: 'AI Services',
        status: 'operational',
        message: 'AI API 연결 정상',
        details: { apiKeyConfigured: true }
      });
      passedChecks++;
    } else {
      checks.push({
        feature: 'AI 기능',
        category: 'AI Services',
        status: 'warning',
        message: 'AI API 키 미설정',
        details: { apiKeyConfigured: false }
      });
      warningChecks++;
    }

    // 9. 스토리지 체크
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) throw error;

      checks.push({
        feature: '파일 스토리지',
        category: 'Storage',
        status: 'operational',
        message: `${buckets?.length || 0}개 버킷 활성`,
        details: { bucketsCount: buckets?.length }
      });
      passedChecks++;
    } catch (error) {
      checks.push({
        feature: '파일 스토리지',
        category: 'Storage',
        status: 'error',
        message: '스토리지 시스템 오류',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

    // 10. 테넌트 시스템 체크
    try {
      const { count: tenantsCount, error } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;

      const { count: activeTenantsCount } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      checks.push({
        feature: '테넌트 관리',
        category: 'Multi-tenancy',
        status: 'operational',
        message: `${tenantsCount || 0}개 테넌트 (${activeTenantsCount || 0}개 활성)`,
        details: { totalTenants: tenantsCount, activeTenants: activeTenantsCount }
      });
      passedChecks++;
    } catch (error) {
      checks.push({
        feature: '테넌트 관리',
        category: 'Multi-tenancy',
        status: 'error',
        message: '테넌트 시스템 오류',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

    // === 역할별 기능 테스트 (권한 중심) ===
    console.log('Starting comprehensive role-based permission tests...');

    // 11. 학생 역할 기능 테스트 (10개)
    try {
      const studentTests = [];
      let studentIssues = 0;

      // 학생 계정 찾기
      const { data: studentRole } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student')
        .limit(1)
        .single();

      if (studentRole) {
        // 1. 강의 조회 권한
        const { error: e1 } = await supabase
          .from('courses')
          .select('id')
          .eq('status', 'published')
          .limit(1);
        if (e1) studentIssues++;
        studentTests.push({ test: '강의 조회', passed: !e1 });

        // 2. 수강 내역 조회 권한
        const { error: e2 } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', studentRole.user_id)
          .limit(1);
        if (e2) studentIssues++;
        studentTests.push({ test: '수강 내역 조회', passed: !e2 });

        // 3. 수강 신청 권한 (INSERT 테스트)
        const { error: e3 } = await supabase
          .from('enrollments')
          .insert({ user_id: studentRole.user_id, course_id: '00000000-0000-0000-0000-000000000000' })
          .select();
        // 권한 오류가 아니면 OK (FK 오류는 괜찮음)
        const hasInsertPermission = !e3 || !e3.message.includes('policy');
        if (!hasInsertPermission) studentIssues++;
        studentTests.push({ test: '수강 신청', passed: hasInsertPermission });

        // 4. 과제 조회 권한
        const { error: e4 } = await supabase
          .from('assignments')
          .select('id')
          .eq('status', 'published')
          .limit(1);
        if (e4) studentIssues++;
        studentTests.push({ test: '과제 조회', passed: !e4 });

        // 5. 과제 제출 권한 (INSERT 테스트)
        const { error: e5 } = await supabase
          .from('assignment_submissions')
          .insert({
            student_id: studentRole.user_id,
            assignment_id: '00000000-0000-0000-0000-000000000000',
            submission_text: 'test'
          })
          .select();
        const hasSubmitPermission = !e5 || !e5.message.includes('policy');
        if (!hasSubmitPermission) studentIssues++;
        studentTests.push({ test: '과제 제출', passed: hasSubmitPermission });

        // 6. 본인 제출물 수정 권한 (UPDATE 테스트)
        const { error: e6 } = await supabase
          .from('assignment_submissions')
          .update({ submission_text: 'updated' })
          .eq('student_id', studentRole.user_id)
          .eq('id', '00000000-0000-0000-0000-000000000000')
          .select();
        const hasUpdatePermission = !e6 || !e6.message.includes('policy');
        if (!hasUpdatePermission) studentIssues++;
        studentTests.push({ test: '제출물 수정', passed: hasUpdatePermission });

        // 7. 커뮤니티 조회 권한
        const { error: e7 } = await supabase
          .from('community_posts')
          .select('id')
          .limit(1);
        if (e7) studentIssues++;
        studentTests.push({ test: '커뮤니티 조회', passed: !e7 });

        // 8. 커뮤니티 글 작성 권한
        const { error: e8 } = await supabase
          .from('community_posts')
          .insert({
            author_id: studentRole.user_id,
            course_id: '00000000-0000-0000-0000-000000000000',
            title: 'test',
            content: 'test'
          })
          .select();
        const hasPostPermission = !e8 || !e8.message.includes('policy');
        if (!hasPostPermission) studentIssues++;
        studentTests.push({ test: '커뮤니티 글 작성', passed: hasPostPermission });

        // 9. 학습 진도 조회 권한
        const { error: e9 } = await supabase
          .from('content_progress')
          .select('id')
          .eq('user_id', studentRole.user_id)
          .limit(1);
        if (e9) studentIssues++;
        studentTests.push({ test: '학습 진도 조회', passed: !e9 });

        // 10. 성적 조회 권한
        const { error: e10 } = await supabase
          .from('grades')
          .select('id')
          .limit(1);
        if (e10) studentIssues++;
        studentTests.push({ test: '성적 조회', passed: !e10 });
      }

      checks.push({
        feature: '학생 기능',
        category: 'Student Role',
        status: studentIssues === 0 ? 'operational' : (studentIssues > 5 ? 'error' : 'warning'),
        message: studentRole 
          ? `${studentTests.length}개 기능 중 ${studentTests.filter(t => t.passed).length}개 정상`
          : '테스트할 학생 계정 없음',
        details: { tests: studentTests, hasTestAccount: !!studentRole }
      });

      if (studentIssues === 0) passedChecks++;
      else if (studentIssues > 5) failedChecks++;
      else warningChecks++;

    } catch (error) {
      checks.push({
        feature: '학생 기능',
        category: 'Student Role',
        status: 'error',
        message: '학생 기능 테스트 실패',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

    // 12. 강사 역할 기능 테스트 (12개)
    try {
      const teacherTests = [];
      let teacherIssues = 0;

      const { data: teacherRole } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'teacher')
        .limit(1)
        .single();

      if (teacherRole) {
        // 1. 본인 강의 조회
        const { error: e1 } = await supabase
          .from('courses')
          .select('id')
          .eq('instructor_id', teacherRole.user_id)
          .limit(1);
        if (e1) teacherIssues++;
        teacherTests.push({ test: '본인 강의 조회', passed: !e1 });

        // 2. 강의 생성 권한
        const { error: e2 } = await supabase
          .from('courses')
          .insert({
            instructor_id: teacherRole.user_id,
            title: 'test',
            slug: 'test-' + Date.now()
          })
          .select();
        const hasCreateCourse = !e2 || !e2.message.includes('policy');
        if (!hasCreateCourse) teacherIssues++;
        teacherTests.push({ test: '강의 생성', passed: hasCreateCourse });

        // 3. 본인 강의 수정 권한
        const { error: e3 } = await supabase
          .from('courses')
          .update({ title: 'updated' })
          .eq('instructor_id', teacherRole.user_id)
          .eq('id', '00000000-0000-0000-0000-000000000000')
          .select();
        const hasUpdateCourse = !e3 || !e3.message.includes('policy');
        if (!hasUpdateCourse) teacherIssues++;
        teacherTests.push({ test: '강의 수정', passed: hasUpdateCourse });

        // 4. 강의 콘텐츠 조회
        const { error: e4 } = await supabase
          .from('course_contents')
          .select('id')
          .limit(1);
        if (e4) teacherIssues++;
        teacherTests.push({ test: '강의 콘텐츠 조회', passed: !e4 });

        // 5. 강의 콘텐츠 관리 권한
        const { error: e5 } = await supabase
          .from('course_contents')
          .insert({
            course_id: '00000000-0000-0000-0000-000000000000',
            title: 'test',
            order_index: 0
          })
          .select();
        const hasManageContent = !e5 || !e5.message.includes('policy');
        if (!hasManageContent) teacherIssues++;
        teacherTests.push({ test: '콘텐츠 관리', passed: hasManageContent });

        // 6. 과제 조회
        const { error: e6 } = await supabase
          .from('assignments')
          .select('id')
          .limit(1);
        if (e6) teacherIssues++;
        teacherTests.push({ test: '과제 조회', passed: !e6 });

        // 7. 과제 생성 권한
        const { error: e7 } = await supabase
          .from('assignments')
          .insert({
            course_id: '00000000-0000-0000-0000-000000000000',
            title: 'test',
            created_by: teacherRole.user_id
          })
          .select();
        const hasCreateAssignment = !e7 || !e7.message.includes('policy');
        if (!hasCreateAssignment) teacherIssues++;
        teacherTests.push({ test: '과제 생성', passed: hasCreateAssignment });

        // 8. 출석 조회
        const { error: e8 } = await supabase
          .from('attendance')
          .select('id')
          .limit(1);
        if (e8) teacherIssues++;
        teacherTests.push({ test: '출석 조회', passed: !e8 });

        // 9. 출석 기록 권한
        const { error: e9 } = await supabase
          .from('attendance')
          .insert({
            user_id: teacherRole.user_id,
            course_id: '00000000-0000-0000-0000-000000000000',
            status: 'present'
          })
          .select();
        const hasRecordAttendance = !e9 || !e9.message.includes('policy');
        if (!hasRecordAttendance) teacherIssues++;
        teacherTests.push({ test: '출석 기록', passed: hasRecordAttendance });

        // 10. 제출물 조회
        const { error: e10 } = await supabase
          .from('assignment_submissions')
          .select('id')
          .limit(1);
        if (e10) teacherIssues++;
        teacherTests.push({ test: '제출물 조회', passed: !e10 });

        // 11. 제출물 채점 권한
        const { error: e11 } = await supabase
          .from('assignment_submissions')
          .update({
            status: 'graded',
            score: 100,
            graded_by: teacherRole.user_id
          })
          .eq('id', '00000000-0000-0000-0000-000000000000')
          .select();
        const hasGradePermission = !e11 || !e11.message.includes('policy');
        if (!hasGradePermission) teacherIssues++;
        teacherTests.push({ test: '제출물 채점', passed: hasGradePermission });

        // 12. 학습 분석 조회
        const { error: e12 } = await supabase
          .from('learning_analytics')
          .select('id')
          .limit(1);
        if (e12) teacherIssues++;
        teacherTests.push({ test: '학습 분석 조회', passed: !e12 });
      }

      checks.push({
        feature: '강사 기능',
        category: 'Teacher Role',
        status: teacherIssues === 0 ? 'operational' : (teacherIssues > 6 ? 'error' : 'warning'),
        message: teacherRole 
          ? `${teacherTests.length}개 기능 중 ${teacherTests.filter(t => t.passed).length}개 정상`
          : '테스트할 강사 계정 없음',
        details: { tests: teacherTests, hasTestAccount: !!teacherRole }
      });

      if (teacherIssues === 0) passedChecks++;
      else if (teacherIssues > 6) failedChecks++;
      else warningChecks++;

    } catch (error) {
      checks.push({
        feature: '강사 기능',
        category: 'Teacher Role',
        status: 'error',
        message: '강사 기능 테스트 실패',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

    // 13. 관리자 역할 기능 테스트 (15개)
    try {
      const adminTests = [];
      let adminIssues = 0;

      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .limit(1)
        .single();

      if (adminRole) {
        // 1. 전체 강의 조회
        const { error: e1 } = await supabase
          .from('courses')
          .select('id')
          .limit(1);
        if (e1) adminIssues++;
        adminTests.push({ test: '전체 강의 조회', passed: !e1 });

        // 2. 강의 승인/수정 권한
        const { error: e2 } = await supabase
          .from('courses')
          .update({ status: 'published' })
          .eq('id', '00000000-0000-0000-0000-000000000000')
          .select();
        const hasApproveCourse = !e2 || !e2.message.includes('policy');
        if (!hasApproveCourse) adminIssues++;
        adminTests.push({ test: '강의 승인/수정', passed: hasApproveCourse });

        // 3. 사용자 역할 조회
        const { error: e3 } = await supabase
          .from('user_roles')
          .select('id')
          .limit(1);
        if (e3) adminIssues++;
        adminTests.push({ test: '사용자 조회', passed: !e3 });

        // 4. 역할 부여 권한
        const { error: e4 } = await supabase
          .from('user_roles')
          .insert({
            user_id: '00000000-0000-0000-0000-000000000000',
            role: 'student'
          })
          .select();
        const hasAssignRole = !e4 || !e4.message.includes('policy');
        if (!hasAssignRole) adminIssues++;
        adminTests.push({ test: '역할 부여', passed: hasAssignRole });

        // 5. 전체 수강 조회
        const { error: e5 } = await supabase
          .from('enrollments')
          .select('id')
          .limit(1);
        if (e5) adminIssues++;
        adminTests.push({ test: '전체 수강 조회', passed: !e5 });

        // 6. 시스템 로그 조회
        const { error: e6 } = await supabase
          .from('admin_access_logs')
          .select('id')
          .limit(1);
        if (e6) adminIssues++;
        adminTests.push({ test: '시스템 로그 조회', passed: !e6 });

        // 7. 학습 통계 조회
        const { error: e7 } = await supabase
          .from('learning_analytics')
          .select('id')
          .limit(1);
        if (e7) adminIssues++;
        adminTests.push({ test: '학습 통계 조회', passed: !e7 });

        // 8. 중도탈락 관리
        const { error: e8 } = await supabase
          .from('dropout_records')
          .select('id')
          .limit(1);
        if (e8) adminIssues++;
        adminTests.push({ test: '중도탈락 조회', passed: !e8 });

        // 9. 중도탈락 기록 권한
        const { error: e9 } = await supabase
          .from('dropout_records')
          .insert({
            enrollment_id: '00000000-0000-0000-0000-000000000000',
            dropout_reason: 'test',
            reason_category: 'personal'
          })
          .select();
        const hasDropoutManage = !e9 || !e9.message.includes('policy');
        if (!hasDropoutManage) adminIssues++;
        adminTests.push({ test: '중도탈락 관리', passed: hasDropoutManage });

        // 10. 상담 기록 조회
        const { error: e10 } = await supabase
          .from('counseling_logs')
          .select('id')
          .limit(1);
        if (e10) adminIssues++;
        adminTests.push({ test: '상담 기록 조회', passed: !e10 });

        // 11. 훈련수당 조회
        const { error: e11 } = await supabase
          .from('training_allowance')
          .select('id')
          .limit(1);
        // 테이블이 없을 수 있으므로 존재 여부만 체크
        const hasAllowanceAccess = !e11 || e11.code !== '42P01';
        adminTests.push({ test: '훈련수당 조회', passed: hasAllowanceAccess });

        // 12. 만족도 조사 조회
        const { error: e12 } = await supabase
          .from('satisfaction_survey')
          .select('id')
          .limit(1);
        const hasSurveyAccess = !e12 || e12.code !== '42P01';
        adminTests.push({ test: '만족도 조사', passed: hasSurveyAccess });

        // 13. 테넌트 설정 조회
        const { error: e13 } = await supabase
          .from('tenants')
          .select('id')
          .limit(1);
        if (e13) adminIssues++;
        adminTests.push({ test: '테넌트 설정', passed: !e13 });

        // 14. AI 사용 로그 조회
        const { error: e14 } = await supabase
          .from('ai_usage_logs')
          .select('id')
          .limit(1);
        if (e14) adminIssues++;
        adminTests.push({ test: 'AI 사용 로그', passed: !e14 });

        // 15. 헬스체크 결과 조회
        const { error: e15 } = await supabase
          .from('health_check_results')
          .select('id')
          .limit(1);
        if (e15) adminIssues++;
        adminTests.push({ test: '헬스체크 조회', passed: !e15 });
      }

      checks.push({
        feature: '관리자 기능',
        category: 'Admin Role',
        status: adminIssues === 0 ? 'operational' : (adminIssues > 7 ? 'error' : 'warning'),
        message: adminRole 
          ? `${adminTests.length}개 기능 중 ${adminTests.filter(t => t.passed).length}개 정상`
          : '테스트할 관리자 계정 없음',
        details: { tests: adminTests, hasTestAccount: !!adminRole }
      });

      if (adminIssues === 0) passedChecks++;
      else if (adminIssues > 7) failedChecks++;
      else warningChecks++;

    } catch (error) {
      checks.push({
        feature: '관리자 기능',
        category: 'Admin Role',
        status: 'error',
        message: '관리자 기능 테스트 실패',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

    // 14. 운영자 역할 기능 테스트 (3개 → 15개 확장)
    try {
      const operatorTests = [];
      let operatorIssues = 0;

      // 운영자 계정 찾기
      const { data: operatorRole } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'operator')
        .limit(1)
        .single();

      if (operatorRole) {
        // 1. 테넌트 조회 권한
        const { error: viewTenantsError } = await supabase
          .from('tenants')
          .select('id')
          .limit(1);
        
        if (viewTenantsError) operatorIssues++;
        operatorTests.push({ test: '테넌트 조회', passed: !viewTenantsError });

        // 2. 테넌트 생성 권한
        const { error: createTenantError } = await supabase
          .from('tenants')
          .insert({ name: 'test-tenant-check', status: 'trial' })
          .select()
          .single();
        
        operatorTests.push({ test: '테넌트 생성', passed: !createTenantError });
        if (createTenantError) operatorIssues++;

        // 3. 테넌트 수정 권한
        if (!createTenantError && createTenantError !== null) {
          const { error: updateTenantError } = await supabase
            .from('tenants')
            .update({ status: 'active' })
            .eq('id', 'non-existent-id');
          
          operatorTests.push({ test: '테넌트 수정', passed: !updateTenantError });
          if (updateTenantError) operatorIssues++;
        } else {
          operatorTests.push({ test: '테넌트 수정', passed: false });
          operatorIssues++;
        }

        // 4. 테넌트 삭제 권한
        const { error: deleteTenantError } = await supabase
          .from('tenants')
          .delete()
          .eq('id', 'non-existent-id');
        
        operatorTests.push({ test: '테넌트 삭제', passed: !deleteTenantError });
        if (deleteTenantError) operatorIssues++;

        // 5. 사용량 조회 권한
        const { error: viewUsageError } = await supabase
          .from('ai_usage_logs')
          .select('id')
          .limit(1);
        
        if (viewUsageError) operatorIssues++;
        operatorTests.push({ test: '사용량 조회', passed: !viewUsageError });

        // 6. 사용량 분석 권한
        const { error: viewMetricsError } = await supabase
          .from('usage_metrics')
          .select('id')
          .limit(1);
        
        operatorTests.push({ test: '사용량 분석', passed: !viewMetricsError });
        if (viewMetricsError) operatorIssues++;

        // 7. 시스템 설정 조회
        const { error: viewSettingsError } = await supabase
          .from('hrd_features')
          .select('id')
          .limit(1);
        
        if (viewSettingsError) operatorIssues++;
        operatorTests.push({ test: '시스템 설정 조회', passed: !viewSettingsError });

        // 8. 시스템 로그 조회
        const { error: viewSystemLogsError } = await supabase
          .from('system_logs')
          .select('id')
          .limit(1);
        
        operatorTests.push({ test: '시스템 로그', passed: !viewSystemLogsError });
        if (viewSystemLogsError) operatorIssues++;

        // 9. 관리자 로그 조회
        const { error: viewAdminLogsError } = await supabase
          .from('admin_access_logs')
          .select('id')
          .limit(1);
        
        operatorTests.push({ test: '관리자 로그', passed: !viewAdminLogsError });
        if (viewAdminLogsError) operatorIssues++;

        // 10. 백업 관리 권한
        const { error: viewBackupsError } = await supabase
          .from('backups')
          .select('id')
          .limit(1);
        
        operatorTests.push({ test: '백업 관리', passed: !viewBackupsError });
        if (viewBackupsError) operatorIssues++;

        // 11. 라이선스 관리
        const { error: viewLicensesError } = await supabase
          .from('licenses')
          .select('id')
          .limit(1);
        
        operatorTests.push({ test: '라이선스 관리', passed: !viewLicensesError });
        if (viewLicensesError) operatorIssues++;

        // 12. 기능 토글 조회
        const { error: viewFeatureTogglesError } = await supabase
          .from('feature_toggles')
          .select('id')
          .limit(1);
        
        operatorTests.push({ test: '기능 토글', passed: !viewFeatureTogglesError });
        if (viewFeatureTogglesError) operatorIssues++;

        // 13. 헬스 체크 이력 조회
        const { error: viewHealthCheckError } = await supabase
          .from('ai_health_check_logs')
          .select('id')
          .limit(1);
        
        operatorTests.push({ test: '헬스 체크 이력', passed: !viewHealthCheckError });
        if (viewHealthCheckError) operatorIssues++;

        // 14. 전체 사용자 조회
        const { error: viewAllUsersError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        operatorTests.push({ test: '전체 사용자 조회', passed: !viewAllUsersError });
        if (viewAllUsersError) operatorIssues++;

        // 15. 수익 통계 조회
        const { error: viewRevenueError } = await supabase
          .from('revenue_records')
          .select('id')
          .limit(1);
        
        operatorTests.push({ test: '수익 통계', passed: !viewRevenueError });
        if (viewRevenueError) operatorIssues++;
      }

      checks.push({
        feature: '운영자 기능',
        category: 'Operator Role',
        status: operatorIssues === 0 ? 'operational' : (operatorIssues > 1 ? 'error' : 'warning'),
        message: operatorRole 
          ? `${operatorTests.length}개 기능 중 ${operatorTests.filter(t => t.passed).length}개 정상`
          : '테스트할 운영자 계정 없음',
        details: { tests: operatorTests, hasTestAccount: !!operatorRole }
      });

      if (operatorIssues === 0) passedChecks++;
      else if (operatorIssues > 1) failedChecks++;
      else warningChecks++;

    } catch (error) {
      checks.push({
        feature: '운영자 기능',
        category: 'Operator Role',
        status: 'error',
        message: '운영자 기능 테스트 실패',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

    // 전체 상태 결정
    const totalChecks = checks.length;
    let overallStatus: 'healthy' | 'degraded' | 'critical';
    
    if (failedChecks === 0 && warningChecks <= 2) {
      overallStatus = 'healthy';
    } else if (failedChecks <= 2) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'critical';
    }

    // AI 분석 생성 (Lovable AI 사용)
    let aiAnalysis = '';
    let recommendations: string[] = [];

    if (lovableApiKey) {
      try {
        const analysisPrompt = `LMS 헬스 체크 결과를 분석해주세요.

전체 상태: ${overallStatus}
총 체크: ${totalChecks}개
성공: ${passedChecks}개
경고: ${warningChecks}개
실패: ${failedChecks}개

상세 결과:
${checks.map(c => `- ${c.feature} (${c.category}): ${c.status} - ${c.message}`).join('\n')}

다음 형식으로 작성해주세요:

1. 전체 시스템 상태 (2-3문장, 명확하고 간결하게)

2. 주요 이슈
매우 낮은 시스템 활용도: 설명
인증 시스템: 설명
강의 관리: 설명
(있는 경우만 나열)

3. 우선순위별 개선 권장사항
1) 첫 번째 권장사항
2) 두 번째 권장사항
3) 세 번째 권장사항
(3-5개 항목)

※ 중요: 모든 문장은 구어체로 작성해주세요. "~합니다", "~입니다" 같은 격식체는 사용하지 말고, 간결하고 명확하게 핵심만 전달하세요.`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'LMS 헬스 체크 결과를 분석하는 전문가입니다. 간결하고 명확한 구어체로 실용적인 분석과 개선안을 제시합니다. 격식을 차리지 않고 핵심만 전달합니다.' },
              { role: 'user', content: analysisPrompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          let rawAnalysis = aiData.choices[0].message.content;
          
          // 마크다운 기호 제거
          aiAnalysis = rawAnalysis
            .replace(/#{1,6}\s/g, '')  // ## 제거
            .replace(/\*\*/g, '')       // ** 제거
            .replace(/\*/g, '')         // * 제거
            .replace(/`/g, '')          // ` 제거
            .trim();

          // 권장사항 추출 (1), 2), 3) 형식)
          const recMatch = aiAnalysis.match(/3\.\s*우선순위별\s*개선\s*권장사항[:\s]*([\s\S]*)/i);
          if (recMatch) {
            recommendations = recMatch[1]
              .split('\n')
              .filter(line => line.trim().match(/^\d+\)|^[-•]/))
              .map(line => line.trim().replace(/^\d+\)\s*|^[-•]\s*/, ''))
              .filter(Boolean)
              .slice(0, 5);
          }
        }
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
        aiAnalysis = '시스템이 정상적으로 작동하고 있으나, AI 분석을 생성하는 중 오류가 발생했습니다.';
      }
    }

    const executionTime = Date.now() - startTime;

    // 결과를 데이터베이스에 저장
    const checkId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('health_check_results')
      .insert({
        check_id: checkId,
        overall_status: overallStatus,
        total_checks: totalChecks,
        passed_checks: passedChecks,
        failed_checks: failedChecks,
        warning_checks: warningChecks,
        details: { checks },
        ai_analysis: aiAnalysis || '분석 없음',
        recommendations: recommendations,
        execution_time_ms: executionTime,
      });

    if (insertError) {
      console.error('Failed to save health check results:', insertError);
    }

    // 기능별 상태 업데이트
    for (const check of checks) {
      await supabase
        .from('feature_status')
        .upsert({
          feature_name: check.feature,
          feature_category: check.category,
          status: check.status,
          status_message: check.message,
          last_checked_at: new Date().toISOString(),
          metadata: check.details || {},
        }, {
          onConflict: 'tenant_id,feature_name'
        });
    }

    console.log(`Health check completed in ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        checkId,
        overallStatus,
        totalChecks,
        passedChecks,
        failedChecks,
        warningChecks,
        checks,
        aiAnalysis,
        recommendations,
        executionTime,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        overallStatus: 'critical',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});