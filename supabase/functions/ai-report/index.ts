import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportType, dateRange } = await req.json();
    
    console.log('📊 Generating AI Report:', { reportType, dateRange });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Supabase 클라이언트 초기화
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 학습 데이터 조회
    const { data: analytics, error: analyticsError } = await supabase
      .from('learning_analytics')
      .select('*');

    if (analyticsError) {
      throw new Error(`Failed to fetch analytics: ${analyticsError.message}`);
    }

    // 등록 데이터 조회
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('*');

    if (enrollmentsError) {
      throw new Error(`Failed to fetch enrollments: ${enrollmentsError.message}`);
    }

    // 통계 계산
    const totalStudents = enrollments?.length || 0;
    const avgProgress = enrollments?.reduce((sum, e) => sum + (e.progress || 0), 0) / totalStudents || 0;
    const completedCourses = enrollments?.filter(e => e.completed_at).length || 0;
    const atRiskStudents = analytics?.filter(a => a.at_risk_score > 70).length || 0;
    const highEngagement = analytics?.filter(a => a.engagement_score > 70).length || 0;

    // AI 리포트 생성 프롬프트
    const systemPrompt = `당신은 교육 플랫폼의 데이터 분석 전문가입니다. 제공된 학습 데이터를 분석하여 종합적인 리포트를 생성하세요.`;

    let reportPrompt = '';
    
    if (reportType === 'overview') {
      reportPrompt = `다음 교육 플랫폼의 전체 현황을 분석하여 종합 리포트를 작성하세요:

통계 데이터:
- 전체 학습자 수: ${totalStudents}명
- 평균 진도율: ${avgProgress.toFixed(1)}%
- 완료한 강좌 수: ${completedCourses}개
- 이탈 위험 학습자: ${atRiskStudents}명
- 높은 참여도 학습자: ${highEngagement}명

다음 항목을 포함하여 리포트를 작성하세요:
1. 전반적인 학습 현황 평가
2. 주요 성과 지표 분석
3. 개선이 필요한 영역
4. 구체적인 실행 권장사항 (3-5개)

한국어로 명확하고 실용적인 리포트를 작성하세요.`;
    } else if (reportType === 'engagement') {
      reportPrompt = `학습자 참여도 분석 리포트를 작성하세요:

참여도 데이터:
- 높은 참여도 (70점 이상): ${highEngagement}명 (${((highEngagement/totalStudents)*100).toFixed(1)}%)
- 전체 학습자: ${totalStudents}명
- 평균 진도율: ${avgProgress.toFixed(1)}%

분석 항목:
1. 참여도 분포 분석
2. 참여도가 높은 학습자의 특징
3. 참여도 향상을 위한 전략
4. 실행 가능한 개선 방안

한국어로 구체적이고 실용적인 분석을 제공하세요.`;
    } else if (reportType === 'risk') {
      reportPrompt = `이탈 위험 학습자 분석 리포트를 작성하세요:

위험 데이터:
- 이탈 위험 학습자 (70점 이상): ${atRiskStudents}명 (${((atRiskStudents/totalStudents)*100).toFixed(1)}%)
- 전체 학습자: ${totalStudents}명

분석 항목:
1. 이탈 위험 요인 분석
2. 우선 개입이 필요한 그룹
3. 예방 전략
4. 즉시 실행 가능한 조치사항

한국어로 긴급성을 고려한 실용적인 리포트를 작성하세요.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: reportPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI report generation failed");
    }

    const aiResponse = await response.json();
    const report = aiResponse.choices[0]?.message?.content;
    
    console.log('✅ AI Report generated successfully');

    // AI 사용 로그 저장
    try {
      await supabase.from("ai_usage_logs").insert({
        tenant_id: "00000000-0000-0000-0000-000000000000",
        user_id: null,
        prompt_text: reportPrompt,
        response_text: report,
        tokens_used: aiResponse.usage?.total_tokens || 0,
        model_name: "google/gemini-2.5-flash",
      });
    } catch (logError) {
      console.error("Failed to log AI usage:", logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        report,
        statistics: {
          totalStudents,
          avgProgress: avgProgress.toFixed(1),
          completedCourses,
          atRiskStudents,
          highEngagement
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("❌ Report generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});