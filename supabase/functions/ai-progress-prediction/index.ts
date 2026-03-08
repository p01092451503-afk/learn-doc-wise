import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('ai-progress-prediction', identifier, 20, 60);

    const { currentProgress, studyPattern, targetCompletion } = await parseBodyWithLimit(req) as any;
    console.log('AI Progress Prediction Request:', { currentProgress, studyPattern, targetCompletion });

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
            content: '당신은 학습 데이터를 분석하여 진도를 예측하는 데이터 분석 전문가입니다. 학습 패턴을 분석하고 실현 가능한 목표를 제시하세요.'
          },
          {
            role: 'user',
            content: `학습자의 진도를 분석하고 예측해주세요:\n\n현재 상황:\n- 현재 진도: ${currentProgress}%\n- 학습 패턴: ${studyPattern}\n- 목표 완료일: ${targetCompletion}\n\n다음 내용을 포함하여 분석해주세요:\n1. 현재 학습 속도 분석\n2. 예상 완료일 예측\n3. 목표 달성을 위한 권장 학습 계획\n4. 주의사항 및 개선 포인트`
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
    const prediction = data.choices[0].message.content;

    return new Response(JSON.stringify({ prediction }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-progress-prediction function:', error);
    return errorResponse(error, corsHeaders);
  }
});
