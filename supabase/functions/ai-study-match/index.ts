import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('ai-study-match', identifier, 20, 60);

    const { userProfile, preferences } = await parseBodyWithLimit(req) as any;
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
            content: '당신은 학습자들을 매칭하는 전문가입니다. 학습 수준, 관심사, 목표가 비슷한 학습 동료를 찾아 효과적인 스터디 그룹을 구성하세요.'
          },
          {
            role: 'user',
            content: `다음 학습자에게 적합한 스터디 메이트 프로필을 추천해주세요:\n\n학습자 정보:\n${JSON.stringify(userProfile, null, 2)}\n\n선호 사항:\n${JSON.stringify(preferences, null, 2)}\n\n다음을 포함하여 추천해주세요:\n1. 이상적인 스터디 메이트 특성 (3-5가지)\n2. 효과적인 스터디 방법 제안\n3. 주의해야 할 점\n4. 스터디 그룹 구성 방안`
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
    return errorResponse(error, corsHeaders);
  }
});
