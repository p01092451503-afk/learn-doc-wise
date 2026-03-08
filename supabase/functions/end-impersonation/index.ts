import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('end-impersonation', identifier, 10, 60);

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

    const { session_id } = await parseBodyWithLimit(req) as any;

    if (!session_id) {
      throw new Error("Missing required field: session_id");
    }

    const { data: session, error: sessionError } = await supabaseClient
      .from("impersonation_sessions")
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq("id", session_id)
      .eq("operator_id", user.id)
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    return new Response(
      JSON.stringify({ success: true, session, message: "Impersonation session ended successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error ending impersonation:", error);
    return errorResponse(error, corsHeaders);
  }
});
