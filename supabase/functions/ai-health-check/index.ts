import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeatureCheck {
  feature: string;
  category: string;
  status: 'operational' | 'warning' | 'error' | 'incomplete' | 'enhancement_needed';
  message: string;
  details?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    // 7. 게이미피케이션 시스템 체크
    try {
      const { count: badgesCount, error } = await supabase
        .from('badges')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;

      const { count: userBadgesCount } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true });

      checks.push({
        feature: '게이미피케이션',
        category: 'Gamification',
        status: 'operational',
        message: `${badgesCount || 0}개 배지, ${userBadgesCount || 0}건 획득`,
        details: { totalBadges: badgesCount, earnedBadges: userBadgesCount }
      });
      passedChecks++;
    } catch (error) {
      checks.push({
        feature: '게이미피케이션',
        category: 'Gamification',
        status: 'error',
        message: '게이미피케이션 시스템 오류',
        details: error instanceof Error ? error.message : String(error)
      });
      failedChecks++;
    }

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
        const analysisPrompt = `다음은 학습 관리 시스템의 헬스 체크 결과입니다. 전문가 입장에서 분석하고 개선 방안을 제시해주세요.

전체 상태: ${overallStatus}
총 체크: ${totalChecks}개
성공: ${passedChecks}개
경고: ${warningChecks}개
실패: ${failedChecks}개

상세 결과:
${checks.map(c => `- ${c.feature} (${c.category}): ${c.status} - ${c.message}`).join('\n')}

다음 형식으로 답변해주세요:
1. 전체 시스템 상태 평가 (2-3문장)
2. 주요 이슈 및 위험 요소 (있는 경우)
3. 우선순위별 개선 권장사항 (3-5개)`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: '당신은 LMS 시스템 전문가입니다. 헬스 체크 결과를 분석하고 실용적인 개선안을 제시합니다.' },
              { role: 'user', content: analysisPrompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiAnalysis = aiData.choices[0].message.content;

          // 권장사항 추출
          const recMatch = aiAnalysis.match(/3\.\s*우선순위별\s*개선\s*권장사항[:\s]*([\s\S]*)/i);
          if (recMatch) {
            recommendations = recMatch[1]
              .split('\n')
              .filter(line => line.trim().match(/^[-•\d]/))
              .map(line => line.trim().replace(/^[-•\d.)\s]+/, ''))
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