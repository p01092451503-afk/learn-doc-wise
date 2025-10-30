import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LearningData {
  user_id: string;
  course_id: string;
  total_time_minutes: number;
  lessons_completed: number;
  last_activity_days_ago: number;
  progress_percentage: number;
  enrollment_days: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { learningData } = await req.json() as { learningData: LearningData };
    
    console.log('📊 Analyzing learning data:', learningData);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // AI 분석 요청
    const analysisPrompt = `당신은 교육 데이터 분석 전문가입니다. 다음 학습 데이터를 분석하여 JSON 형식으로 결과를 제공하세요.

학습 데이터:
- 총 학습 시간: ${learningData.total_time_minutes}분
- 완료한 레슨 수: ${learningData.lessons_completed}개
- 마지막 활동: ${learningData.last_activity_days_ago}일 전
- 현재 진도율: ${learningData.progress_percentage}%
- 수강 기간: ${learningData.enrollment_days}일

다음 형식의 JSON으로 응답하세요:
{
  "at_risk_score": 0-100 사이의 숫자 (높을수록 이탈 위험 높음),
  "engagement_score": 0-100 사이의 숫자 (높을수록 참여도 높음),
  "learning_pattern": {
    "consistency": "높음/중간/낮음",
    "pace": "빠름/적정/느림",
    "completion_rate": "높음/중간/낮음"
  },
  "recommendations": ["추천사항1", "추천사항2", "추천사항3"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "당신은 교육 데이터 분석 전문가입니다. 항상 정확한 JSON 형식으로만 응답하세요." 
          },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.3,
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
      throw new Error("AI analysis failed");
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0]?.message?.content;
    
    console.log('🤖 AI Response:', analysisText);

    // JSON 추출 (마크다운 코드 블록 제거)
    let jsonText = analysisText;
    const jsonMatch = analysisText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const analysis = JSON.parse(jsonText);

    // Supabase에 분석 결과 저장
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('learning_analytics')
      .upsert({
        user_id: learningData.user_id,
        course_id: learningData.course_id,
        total_time_minutes: learningData.total_time_minutes,
        lessons_completed: learningData.lessons_completed,
        engagement_score: analysis.engagement_score,
        at_risk_score: analysis.at_risk_score,
        learning_pattern: analysis.learning_pattern,
        last_activity_at: new Date(Date.now() - learningData.last_activity_days_ago * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,course_id'
      });

    if (updateError) {
      console.error('Error saving analytics:', updateError);
    } else {
      console.log('✅ Analytics saved successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("❌ Analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
