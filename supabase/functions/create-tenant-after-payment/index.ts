import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('create-tenant-after-payment', identifier, 5, 60);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { user_id, plan, organizationName, subdomain, description, payment_id } = await parseBodyWithLimit(req) as any;

    console.log("Creating tenant after payment:", { user_id, plan, organizationName, subdomain });

    if (!user_id || !plan || !organizationName || !subdomain) {
      throw new Error("Missing required fields");
    }

    const { data: existingTenant } = await supabaseClient
      .from("tenants").select("id").eq("subdomain", subdomain).single();

    if (existingTenant) {
      throw new Error("Subdomain already exists");
    }

    const planLimits = {
      starter: { max_students: 50, max_storage_gb: 10, max_bandwidth_gb: 100, features: { ai: true, analytics: true, community: true, gamification: true, certificates: true } },
      standard: { max_students: 200, max_storage_gb: 50, max_bandwidth_gb: 500, features: { ai: true, analytics: true, community: true, gamification: true, certificates: true } },
      professional: { max_students: 1000, max_storage_gb: 200, max_bandwidth_gb: 2000, features: { ai: true, analytics: true, community: true, gamification: true, certificates: true } },
    };

    const limits = planLimits[plan as keyof typeof planLimits] || planLimits.starter;

    const { data: tenant, error: tenantError } = await supabaseClient
      .from("tenants")
      .insert({
        name: organizationName, subdomain, plan, status: "active", is_active: true,
        max_students: limits.max_students, max_storage_gb: limits.max_storage_gb,
        max_bandwidth_gb: limits.max_bandwidth_gb, features_enabled: limits.features,
        description: description || null, contract_end_date: null,
      })
      .select().single();

    if (tenantError) { console.error("Error creating tenant:", tenantError); throw tenantError; }

    const { error: membershipError } = await supabaseClient
      .from("memberships").insert({ user_id, tenant_id: tenant.id, role: "admin", is_active: true });

    if (membershipError) { console.error("Error creating membership:", membershipError); throw membershipError; }

    const { error: usageError } = await supabaseClient
      .from("usage_metrics").insert({ tenant_id: tenant.id, student_count: 0, storage_used_gb: 0, bandwidth_gb: 0, ai_tokens_used: 0 });

    if (usageError) { console.error("Error initializing usage metrics:", usageError); }

    await supabaseClient.from("audit_logs_v2").insert({
      actor_user_id: user_id, action: "tenant_created", entity_type: "tenant",
      entity_id: tenant.id, tenant_id: tenant.id,
      metadata: { plan, payment_id, subdomain },
    });

    return new Response(
      JSON.stringify({ success: true, tenant, message: "Tenant created successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in create-tenant-after-payment:", error);
    return errorResponse(error, corsHeaders);
  }
});
