import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('ai-grading', identifier, 20, 60);

    const { submissionId, submissionText, maxScore, rubric } = await parseBodyWithLimit(req) as any;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const systemPrompt = `당신은 공정하고 전문적인 과제 채점자입니다. 
다음 기준으로 학생의 과제를 평가하고 점수와 상세한 피드백을 제공하세요:

채점 기준:
${rubric || `
- 내용의 정확성 (40%)
- 논리적 구성 (30%)
- 창의성 및 독창성 (20%)
- 작성 품질 (10%)
`}

총점: ${maxScore}점

평가 결과는 다음 JSON 형식으로 반환하세요:
{
  "score": 점수 (숫자),
  "feedback": "상세한 피드백 (한글)",
  "strengths": ["강점1", "강점2"],
  "improvements": ["개선점1", "개선점2"]
}`;

    const userPrompt = `다음 학생의 제출물을 평가해주세요:\n\n${submissionText}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const resultText = aiData.choices[0]?.message?.content;
    
    if (!resultText) {
      throw new Error("No response from AI");
    }

    const gradingResult = JSON.parse(resultText);

    const { error: updateError } = await supabase
      .from("assignment_submissions")
      .update({
        score: gradingResult.score,
        feedback: `${gradingResult.feedback}\n\n강점:\n${gradingResult.strengths.map((s: string) => `- ${s}`).join("\n")}\n\n개선점:\n${gradingResult.improvements.map((i: string) => `- ${i}`).join("\n")}`,
        status: "graded",
        graded_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (updateError) {
      throw updateError;
    }

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        await supabase.from("ai_usage_logs").insert({
          user_id: user.id,
          tenant_id: null,
          model_name: "google/gemini-2.5-flash",
          prompt_text: userPrompt.substring(0, 500),
          response_text: resultText.substring(0, 500),
          tokens_used: aiData.usage?.total_tokens || 0,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, result: gradingResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI grading error:", error);
    return errorResponse(error, corsHeaders);
  }
});
