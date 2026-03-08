import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('ai-summarize', identifier, 30, 60);

    const { content, summaryLength } = await parseBodyWithLimit(req) as any;
    console.log('AI Summarize Request:', { contentLength: content?.length, summaryLength });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: '당신은 내용을 간결하고 명확하게 요약하는 전문가입니다. 핵심 내용만을 추출하여 이해하기 쉽게 정리하세요.'
          },
          {
            role: 'user',
            content: `다음 내용을 ${summaryLength === 'short' ? '3-5문장' : summaryLength === 'medium' ? '한 단락' : '여러 단락'}으로 요약해주세요:\n\n${content}\n\n핵심 포인트:\n1. 주요 개념과 아이디어\n2. 중요한 세부 사항\n3. 결론 또는 시사점`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      throw new Error(`AI API returned ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-summarize function:', error);
    return errorResponse(error, corsHeaders);
  }
});
