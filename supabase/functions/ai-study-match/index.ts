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
    const { userProfile, preferences } = await req.json();
    console.log('AI Study Match Request:', { userProfile, preferences });

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
            content: '당신은 학습자들을 매칭하는 전문가입니다. 학습 수준, 관심사, 목표가 비슷한 학습 동료를 찾아 효과적인 스터디 그룹을 구성하세요.\n\n**중요 제한사항:** 오직 학습 목적의 스터디 메이트만 추천하세요. 학습과 무관한 모임이나 활동은 "죄송합니다. 학습 목적의 스터디 메이트만 추천할 수 있습니다."라고 거절하세요.'
          },
          {
            role: 'user',
            content: `다음 학습자에게 적합한 스터디 메이트 프로필을 추천해주세요:

학습자 정보:
${JSON.stringify(userProfile, null, 2)}

선호 사항:
${JSON.stringify(preferences, null, 2)}

다음을 포함하여 추천해주세요:
1. 이상적인 스터디 메이트 특성 (3-5가지)
2. 효과적인 스터디 방법 제안
3. 주의해야 할 점
4. 스터디 그룹 구성 방안`
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
    const recommendation = data.choices[0].message.content;

    return new Response(JSON.stringify({ recommendation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-study-match function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
