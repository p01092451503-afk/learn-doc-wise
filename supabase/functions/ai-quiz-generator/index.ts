import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('ai-quiz-generator', identifier, 20, 60);

    const { topic, difficulty, questionCount } = await parseBodyWithLimit(req) as any;
    console.log('AI Quiz Generator Request:', { topic, difficulty, questionCount });

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
            content: '당신은 교육용 퀴즈를 생성하는 전문가입니다. 주어진 주제와 난이도에 맞는 객관식 문제를 생성하세요.'
          },
          {
            role: 'user',
            content: `다음 조건으로 퀴즈를 생성해주세요:\n- 주제: ${topic}\n- 난이도: ${difficulty}\n- 문제 수: ${questionCount}개\n\n각 문제는 다음 형식으로 작성해주세요:\n문제 1: [질문]\n1) [선택지 1]\n2) [선택지 2]\n3) [선택지 3]\n4) [선택지 4]\n정답: [번호]\n해설: [간단한 설명]`
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
    const quiz = data.choices[0].message.content;

    return new Response(JSON.stringify({ quiz }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-quiz-generator function:', error);
    return errorResponse(error, corsHeaders);
  }
});
