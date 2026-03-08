import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('chatbot', identifier, 30, 60);

    const { messages, userRole } = await parseBodyWithLimit(req) as any;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
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
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = userRole === "admin" 
      ? `당신은 LMS 플랫폼 관리자용 AI 어시스턴트입니다. 사용자의 질문에만 간결하고 명확하게 답변하세요. 불필요한 소개나 설명은 하지 마세요. 질문받은 내용에 대해서만 직접적으로 답변하세요. 한국어로 답변합니다.`
      : `당신은 온라인 학습 플랫폼(LMS) AI 어시스턴트입니다. 사용자의 질문에만 간결하고 명확하게 답변하세요. 불필요한 소개나 설명은 하지 마세요. 질문받은 내용에 대해서만 직접적으로 답변하세요. 한국어로 답변합니다.`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 사용 크레딧이 부족합니다." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI 서비스 오류가 발생했습니다." }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    try {
      await supabase.from("ai_usage_logs").insert({
        tenant_id: "00000000-0000-0000-0000-000000000000",
        user_id: userId,
        prompt_text: lastUserMessage,
        response_text: "[Streaming Response]",
        tokens_used: 0,
        model_name: "google/gemini-2.5-flash",
      });
    } catch (logError) {
      console.error("Failed to log AI usage:", logError);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chatbot error:", error);
    return errorResponse(error, getCorsHeaders(req));
  }
});
