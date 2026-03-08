import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('start-impersonation', identifier, 5, 60);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: isOp, error: opError } = await supabaseClient.rpc("is_operator", { _user_id: user.id });

    if (opError || !isOp) {
      throw new Error("Unauthorized: Not an operator");
    }

    const { tenant_id, user_id, reason, duration_hours = 2 } = await parseBodyWithLimit(req) as any;

    if (!tenant_id || !reason) {
      throw new Error("Missing required fields: tenant_id, reason");
    }

    const { data: hasAccess, error: accessError } = await supabaseClient.rpc(
      "operator_has_tenant_access",
      { _operator_id: user.id, _tenant_id: tenant_id }
    );

    if (accessError) {
      console.error("Error checking tenant access:", accessError);
      throw new Error("Failed to verify tenant access");
    }

    if (!hasAccess) {
      throw new Error("Unauthorized: You do not have access to this tenant");
    }

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + duration_hours);

    const { data: session, error: sessionError } = await supabaseClient
      .from("impersonation_sessions")
      .insert({
        operator_id: user.id,
        target_tenant_id: tenant_id,
        target_user_id: user_id || null,
        reason,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        user_agent: req.headers.get("user-agent"),
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    const { data: tenant } = await supabaseClient
      .from("tenants")
      .select("name")
      .eq("id", tenant_id)
      .single();

    const { data: adminMemberships } = await supabaseClient
      .from("memberships")
      .select("user_id")
      .eq("tenant_id", tenant_id)
      .eq("role", "admin")
      .eq("is_active", true);

    if (adminMemberships && adminMemberships.length > 0) {
      const notifications = adminMemberships.map((membership) => ({
        user_id: membership.user_id,
        tenant_id: tenant_id,
        title: "대리 로그인 세션 시작",
        message: `운영자가 ${tenant?.name || "귀하의 테넌트"}에 대리 로그인하였습니다. 사유: ${reason}`,
        type: "system",
        priority: "high",
        metadata: { impersonation_session_id: session.id, operator_id: user.id, reason },
      }));

      await supabaseClient.from("notifications").insert(notifications);
    }

    return new Response(
      JSON.stringify({ success: true, session, message: "Impersonation session started successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error starting impersonation:", error);
    return errorResponse(error, corsHeaders);
  }
});
