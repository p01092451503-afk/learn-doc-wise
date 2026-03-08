import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('trigger-auto-billing', identifier, 5, 60);

    const { tenantId, limitType } = await parseBodyWithLimit(req) as any;

    if (!tenantId || !limitType) {
      throw new Error("Required fields missing: tenantId, limitType");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: tenant, error: tenantError } = await supabaseClient
      .from('tenants').select('*, auto_billing_settings(*)').eq('id', tenantId).single();

    if (tenantError || !tenant) {
      throw new Error('Tenant not found');
    }

    const settings = tenant.auto_billing_settings?.[0];
    if (!settings?.auto_charge_on_limit) {
      return new Response(
        JSON.stringify({ success: false, message: 'Auto billing not enabled', requiresManualAction: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let transactionType: string;
    let amount: number;
    let quantity: number = 1;
    let description: string;

    switch (limitType) {
      case 'student':
        transactionType = 'addon_student'; amount = settings.student_addon_price; quantity = 10; description = '학생 10명 추가'; break;
      case 'storage':
        transactionType = 'addon_storage'; amount = settings.storage_addon_price; quantity = 10; description = '스토리지 10GB 추가'; break;
      case 'ai_token':
        transactionType = 'addon_ai_token'; amount = settings.ai_token_addon_price; quantity = 10000; description = 'AI 토큰 10,000개 추가'; break;
      default:
        throw new Error('Invalid limit type');
    }

    const orderId = `AUTO-${tenantId}-${Date.now()}`;

    const { data: transaction, error: transactionError } = await supabaseClient
      .from('billing_transactions')
      .insert({
        tenant_id: tenantId, order_id: orderId, transaction_type: transactionType,
        amount, quantity, status: 'pending',
        metadata: { limit_type: limitType, description, auto_triggered: true }
      })
      .select().single();

    if (transactionError) { console.error('Error creating transaction:', transactionError); throw transactionError; }

    const paymentData = {
      orderId, orderName: description, amount,
      customerEmail: settings.billing_email || tenant.representative_email,
      customerName: settings.billing_name || tenant.customer_name,
      successUrl: `${req.headers.get('origin')}/payment/success`,
      failUrl: `${req.headers.get('origin')}/payment/fail`,
    };

    await supabaseClient.from('system_logs').insert({
      tenant_id: tenantId, level: 'info', message: `Auto billing triggered for ${limitType}`,
      metadata: { transaction_id: transaction.id, order_id: orderId, amount }
    });

    return new Response(
      JSON.stringify({ success: true, transaction, paymentData, message: 'Auto billing transaction created' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in auto billing:', error);
    return errorResponse(error, corsHeaders);
  }
});
