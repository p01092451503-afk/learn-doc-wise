import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('toss-payment-webhook', identifier, 60, 60);

    const webhookData = await parseBodyWithLimit(req) as any;
    
    console.log('Received webhook from Toss Payments:', webhookData);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    switch (webhookData.eventType) {
      case 'PAYMENT_STATUS_CHANGED':
        const { error: updateError } = await supabaseClient
          .from('payment_transactions')
          .update({
            status: webhookData.data.status,
            metadata: webhookData.data,
            updated_at: new Date().toISOString(),
          })
          .eq('payment_key', webhookData.data.paymentKey);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
        }

        if (webhookData.data.status === 'DONE') {
          const orderId = webhookData.data.orderId;
          const tenantId = orderId.split('-')[1];

          if (tenantId) {
            const { error: tenantError } = await supabaseClient
              .from('tenants')
              .update({
                billing_status: 'active',
                last_payment_date: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', tenantId);

            if (tenantError) {
              console.error('Error updating tenant billing status:', tenantError);
            }
          }
        }
        break;

      default:
        console.log('Unhandled webhook event type:', webhookData.eventType);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return errorResponse(error, corsHeaders);
  }
});
