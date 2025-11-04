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
    const { topic, difficulty, questionCount } = await req.json();
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
            content: '당신은 교육용 퀴즈를 생성하는 전문가입니다. 주어진 주제와 난이도에 맞는 객관식 문제를 생성하세요.\n\n**중요 제한사항:** 오직 학습 주제, 교육 콘텐츠에 대한 퀴즈만 생성하세요. 학습과 무관한 주제(연예, 스포츠, 게임 등)는 "죄송합니다. 학습 관련 퀴즈만 생성할 수 있습니다."라고 거절하세요.'
          },
          {
            role: 'user',
            content: `다음 조건으로 퀴즈를 생성해주세요:
- 주제: ${topic}
- 난이도: ${difficulty}
- 문제 수: ${questionCount}개

각 문제는 다음 형식으로 작성해주세요:
문제 1: [질문]
1) [선택지 1]
2) [선택지 2]
3) [선택지 3]
4) [선택지 4]
정답: [번호]
해설: [간단한 설명]`
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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
