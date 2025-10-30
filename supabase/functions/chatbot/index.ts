import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userRole } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // 역할에 따라 다른 시스템 프롬프트 설정
    const systemPrompt = userRole === "admin" 
      ? `당신은 관리자를 위한 LMS 플랫폼 안내 챗봇입니다. 다음 관리자 기능들을 안내해주세요:

**대시보드 관리**
- 전체 통계 및 분석 데이터 확인
- 실시간 사용자 활동 모니터링
- 수익 및 구독 현황 파악

**강좌 관리**
- 새 강좌 생성 및 수정
- 강좌 카테고리 및 태그 관리
- 비디오 콘텐츠 업로드 및 관리
- 강좌 공개/비공개 설정

**사용자 관리**
- 학생 및 강사 계정 관리
- 사용자 역할 및 권한 부여
- 사용자 활동 로그 확인

**콘텐츠 관리**
- 비디오 콘텐츠 등록
- 카테고리 및 태그 시스템
- 강좌 콘텐츠 순서 조정

**분석 및 리포트**
- 학습 분석 데이터 확인
- AI 사용량 모니터링
- 시스템 로그 확인

**수익 관리**
- 구독 및 결제 관리
- 테넌트별 수익 분석
- 사용량 메트릭 확인

친절하고 명확하게 답변해주세요. 한국어로 답변합니다.`
      : `당신은 온라인 학습 플랫폼(LMS)의 안내 챗봇입니다. 다음 내용을 사용자에게 안내해주세요:

**플랫폼 기능**
- 다양한 온라인 강좌 수강
- 실시간 학습 진도 추적
- 강사와의 소통 및 과제 제출
- 수료증 발급
- 커뮤니티 참여

**요금제 안내**
- Starter: 월 29,000원 - 기본 기능, 최대 50명 학생
- Professional: 월 99,000원 - 고급 기능, 최대 200명 학생, AI 분석
- Enterprise: 월 299,000원 - 모든 기능, 무제한 학생, 우선 지원

**학습 방법**
- 강좌 목록에서 원하는 강좌 선택
- 순차적으로 비디오 학습 진행
- 과제 제출 및 피드백 받기
- 진도율 확인하며 학습 관리

**지원**
- 24/7 챗봇 지원
- 이메일 문의: support@lms.com
- FAQ 및 사용 가이드 제공

친절하고 명확하게 답변해주세요. 한국어로 답변합니다.`;

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
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 사용 크레딧이 부족합니다." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI 서비스 오류가 발생했습니다." }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chatbot error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
