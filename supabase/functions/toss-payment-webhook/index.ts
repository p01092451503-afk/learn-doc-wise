import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookData = await req.json();
    
    console.log('Received webhook from Toss Payments:', webhookData);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // 웹훅 이벤트 타입에 따라 처리
    switch (webhookData.eventType) {
      case 'PAYMENT_STATUS_CHANGED':
        // 결제 상태 업데이트
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

        // 결제 완료 시 테넌트 구독 업데이트
        if (webhookData.data.status === 'DONE') {
          const orderId = webhookData.data.orderId;
          // orderId에서 tenant_id 추출 (format: "ORDER-{tenant_id}-{timestamp}")
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
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
