import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentProgress, studyPattern, targetCompletion } = await req.json();
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
            content: `학습자의 진도를 분석하고 예측해주세요:

현재 상황:
- 현재 진도: ${currentProgress}%
- 학습 패턴: ${studyPattern}
- 목표 완료일: ${targetCompletion}

다음 내용을 포함하여 분석해주세요:
1. 현재 학습 속도 분석
2. 예상 완료일 예측
3. 목표 달성을 위한 권장 학습 계획
4. 주의사항 및 개선 포인트`
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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
