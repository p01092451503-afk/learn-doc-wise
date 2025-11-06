import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    // Verify the user is an operator
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is an operator
    const { data: isOp, error: opError } = await supabaseClient.rpc("is_operator", {
      _user_id: user.id,
    });

    if (opError || !isOp) {
      throw new Error("Unauthorized: Not an operator");
    }

    const { tenant_id, user_id, reason, duration_hours = 2 } = await req.json();

    if (!tenant_id || !reason) {
      throw new Error("Missing required fields: tenant_id, reason");
    }

    // Generate session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + duration_hours);

    // Create impersonation session
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

    return new Response(
      JSON.stringify({
        success: true,
        session,
        message: "Impersonation session started successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error starting impersonation:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
