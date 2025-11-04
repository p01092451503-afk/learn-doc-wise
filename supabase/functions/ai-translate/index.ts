import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage, sourceLanguage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageNames: Record<string, string> = {
      ko: "한국어",
      en: "영어",
      ja: "일본어",
      zh: "중국어",
      es: "스페인어",
      fr: "프랑스어",
      de: "독일어",
    };

    const systemPrompt = `당신은 전문 번역가입니다. ${sourceLanguage ? languageNames[sourceLanguage] : "원문"}에서 ${languageNames[targetLanguage] || targetLanguage}로 정확하고 자연스럽게 번역하세요.
학습 콘텐츠의 의미와 뉘앙스를 정확히 전달하고, 전문 용어는 적절하게 번역하세요.
번역문만 출력하고 추가 설명은 하지 마세요.

**중요 제한사항:** 오직 학습 자료, 교육 콘텐츠, 강의 내용만 번역하세요. 학습과 무관한 내용(일상 대화, 뉴스, 엔터테인먼트 등)은 "죄송합니다. 학습 콘텐츠만 번역할 수 있습니다."라고 거절하세요.`;

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
          { role: "user", content: text }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "사용량 한도 초과" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧 부족" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("번역 실패");
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content;

    // AI 사용 로그 저장
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const authHeader = req.headers.get("authorization");
      let userId = null;
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;
      }

      await supabase.from("ai_usage_logs").insert({
        tenant_id: "00000000-0000-0000-0000-000000000000",
        user_id: userId,
        prompt_text: text,
        response_text: translatedText,
        tokens_used: data.usage?.total_tokens || 0,
        model_name: "google/gemini-2.5-flash",
      });
    } catch (logError) {
      console.error("Failed to log AI usage:", logError);
    }

    return new Response(JSON.stringify({ translatedText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
