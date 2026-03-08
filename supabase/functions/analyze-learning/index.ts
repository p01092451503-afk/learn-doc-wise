import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

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
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('analyze-learning', identifier, 20, 60);

    const { learningData } = await parseBodyWithLimit(req) as { learningData: LearningData };
    
    console.log('📊 Analyzing learning data:', learningData);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const analysisPrompt = `당신은 교육 데이터 분석 전문가입니다. 다음 학습 데이터를 분석하여 JSON 형식으로 결과를 제공하세요.

학습 데이터:
- 총 학습 시간: ${learningData.total_time_minutes}분
- 완료한 레슨 수: ${learningData.lessons_completed}개
- 마지막 활동: ${learningData.last_activity_days_ago}일 전
- 현재 진도율: ${learningData.progress_percentage}%
- 수강 기간: ${learningData.enrollment_days}일

다음 형식의 JSON으로 응답하세요:
{
  "at_risk_score": 0-100 사이의 숫자,
  "engagement_score": 0-100 사이의 숫자,
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
          { role: "system", content: "당신은 교육 데이터 분석 전문가입니다. 항상 정확한 JSON 형식으로만 응답하세요." },
          { role: "user", content: analysisPrompt }
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
      throw new Error("AI analysis failed");
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0]?.message?.content;
    
    console.log('🤖 AI Response:', analysisText);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let jsonText = analysisText;
    const jsonMatch = analysisText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    jsonText = jsonText
      .replace(/""(\w)/g, '"$1')
      .replace(/(\w)""/g, '$1"')
      .trim();

    let analysis;
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON 파싱 실패, 기본값 사용:', parseError);
      analysis = {
        at_risk_score: 50,
        engagement_score: 50,
        learning_pattern: { consistency: "분석 불가", pace: "분석 불가", completion_rate: "분석 불가" },
        recommendations: ["학습 데이터를 더 수집한 후 다시 분석해주세요."]
      };
    }

    try {
      await supabase.from("ai_usage_logs").insert({
        tenant_id: "00000000-0000-0000-0000-000000000000",
        user_id: learningData.user_id,
        prompt_text: analysisPrompt,
        response_text: analysisText,
        tokens_used: aiResponse.usage?.total_tokens || 0,
        model_name: "google/gemini-2.5-flash",
      });
    } catch (logError) {
      console.error("Failed to log AI usage:", logError);
    }

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
      }, { onConflict: 'user_id,course_id' });

    if (updateError) {
      console.error('Error saving analytics:', updateError);
    } else {
      console.log('✅ Analytics saved successfully');
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("❌ Analysis error:", error);
    return errorResponse(error, corsHeaders);
  }
});
