import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

interface InvitationRequest {
  email: string;
  tenantName: string;
  tenantSubdomain: string;
  contractNumber: string;
  temporaryPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('send-admin-invitation', identifier, 10, 60);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { email, tenantName, tenantSubdomain, contractNumber, temporaryPassword } = await parseBodyWithLimit(req) as unknown as InvitationRequest;

    console.log('Sending admin invitation to:', email);

    const loginUrl = tenantSubdomain 
      ? `https://${tenantSubdomain}.yourdomain.com/auth`
      : `https://yourdomain.com/auth`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "atomLMS <onboarding@resend.dev>",
        to: [email],
        subject: `${tenantName} 관리자 계정이 생성되었습니다`,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">환영합니다! ${tenantName} 관리자님</h1>
          <p>귀하의 atomLMS 관리자 계정이 생성되었습니다.</p>
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0;">로그인 정보</h3>
            <p><strong>이메일:</strong> ${email}</p>
            <p><strong>임시 비밀번호:</strong> ${temporaryPassword}</p>
            <p><strong>계약 번호:</strong> ${contractNumber}</p>
          </div>
          <p style="color: #d32f2f; font-weight: bold;">⚠️ 보안을 위해 첫 로그인 후 반드시 비밀번호를 변경해주세요.</p>
          <div style="margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">로그인하기</a>
          </div>
        </div>`,
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
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-admin-invitation:", error);
    return errorResponse(error, corsHeaders);
  }
};

serve(handler);
