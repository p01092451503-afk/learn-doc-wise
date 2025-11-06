import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  role: string;
  tenantName: string;
  inviterName: string;
  temporaryPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { email, role, tenantName, inviterName, temporaryPassword }: InvitationRequest = await req.json();

    console.log('Sending user invitation to:', email);

    const roleNames: Record<string, string> = {
      instructor: '강사',
      student: '학생',
      admin: '관리자',
    };

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "atomLMS <onboarding@resend.dev>",
        to: [email],
        subject: `${tenantName}에서 ${roleNames[role]} 초대를 보냈습니다`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">환영합니다!</h1>
            
            <p><strong>${inviterName}</strong>님이 귀하를 <strong>${tenantName}</strong>의 ${roleNames[role]}(으)로 초대했습니다.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="margin-top: 0;">로그인 정보</h3>
              <p><strong>이메일:</strong> ${email}</p>
              <p><strong>임시 비밀번호:</strong> ${temporaryPassword}</p>
              <p><strong>역할:</strong> ${roleNames[role]}</p>
            </div>
            
            <p style="color: #d32f2f; font-weight: bold;">⚠️ 보안을 위해 첫 로그인 후 반드시 비밀번호를 변경해주세요.</p>
            
            <div style="margin: 30px 0;">
              <a href="https://yourdomain.com/auth" 
                 style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                로그인하기
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            ${role === 'instructor' ? `
              <h3>강사 권한 안내</h3>
              <ul>
                <li>강의 생성 및 관리</li>
                <li>학생 관리</li>
                <li>과제 및 평가</li>
                <li>출석 관리</li>
              </ul>
            ` : role === 'student' ? `
              <h3>학습 안내</h3>
              <ul>
                <li>강의 수강</li>
                <li>과제 제출</li>
                <li>커뮤니티 참여</li>
                <li>학습 진도 확인</li>
              </ul>
            ` : ''}
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              문의사항이 있으시면 언제든지 고객 지원팀으로 연락주세요.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    const data = await emailResponse.json();
    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-user-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
