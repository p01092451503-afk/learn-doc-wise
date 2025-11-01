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
    const { userLevel, interests, learningGoal } = await req.json();
    console.log('AI Learning Path Request:', { userLevel, interests, learningGoal });

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
            content: '당신은 학습 경로를 추천하는 교육 전문가입니다. 학습자의 수준, 관심사, 목표를 분석하여 단계별 학습 경로를 제안하세요.'
          },
          {
            role: 'user',
            content: `학습자 정보:
- 현재 수준: ${userLevel}
- 관심 분야: ${interests}
- 학습 목표: ${learningGoal}

위 정보를 바탕으로 3-5단계의 맞춤형 학습 경로를 추천해주세요. 각 단계마다:
1. 단계명
2. 학습 내용
3. 예상 소요 시간
4. 추천 학습 자료 유형
을 포함해주세요.`
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
    const learningPath = data.choices[0].message.content;

    return new Response(JSON.stringify({ learningPath }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-learning-path function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
