import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, criteria } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    
    if (type === "assignment") {
      systemPrompt = `당신은 과제 평가 전문가입니다. 제출된 과제를 다음 기준으로 평가하세요:
${criteria || "내용의 완성도, 논리성, 창의성, 표현력"}

다음 형식으로 피드백을 제공하세요:
1. 전체 평가 (0-100점)
2. 잘한 점 (최소 2가지)
3. 개선이 필요한 점 (최소 2가지)
4. 구체적인 개선 제안
5. 추가 학습 권장사항`;
    } else if (type === "grammar") {
      systemPrompt = `당신은 문장 교정 전문가입니다. 제출된 텍스트의 맞춤법, 문법, 표현을 검토하고 
개선된 버전을 제공하세요. 다음 형식으로 답변하세요:

**교정된 텍스트:**
[교정된 전체 텍스트]

**주요 수정 사항:**
1. [수정 내용과 이유]
2. [수정 내용과 이유]

**표현 개선 제안:**
[더 나은 표현 방법 제안]`;
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
          { role: "user", content }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "사용량 한도 초과. 잠시 후 다시 시도해주세요." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI 피드백 생성 실패");
    }

    const data = await response.json();
    const feedback = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ feedback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Feedback error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
