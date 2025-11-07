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
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      throw new Error("Required fields missing: paymentKey, orderId, amount");
    }

    const tossSecretKey = Deno.env.get('TOSS_PAYMENTS_SECRET_KEY');
    
    if (!tossSecretKey) {
      console.warn('TOSS_PAYMENTS_SECRET_KEY not configured');
      // 시크릿 키가 없어도 일단 진행 (테스트용)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment confirmation pending - Secret key not configured',
          orderId,
          amount,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(tossSecretKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Payment confirmation failed');
    }

    // Supabase에 결제 정보 저장
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update billing_transactions table
    const { error: updateError } = await supabaseClient
      .from('billing_transactions')
      .update({
        payment_key: paymentKey,
        status: result.status === 'DONE' ? 'completed' : result.status.toLowerCase(),
        payment_method: result.method,
        approved_at: result.approvedAt,
        metadata: result,
      })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Error updating billing transaction:', updateError);
    }

    // If payment is completed, update tenant limits based on transaction type
    if (result.status === 'DONE') {
      const { data: transaction } = await supabaseClient
        .from('billing_transactions')
        .select('*, tenants(*)')
        .eq('order_id', orderId)
        .single();

      if (transaction) {
        const tenant = transaction.tenants;
        let updateData = {};

        switch (transaction.transaction_type) {
          case 'addon_student':
            updateData = {
              max_students: tenant.max_students + transaction.quantity
            };
            break;
          case 'addon_storage':
            updateData = {
              max_storage_gb: tenant.max_storage_gb + transaction.quantity
            };
            break;
          case 'addon_ai_token':
            // Update AI token limit - this would need a separate field in tenants table
            console.log('AI token addon purchased:', transaction.quantity);
            break;
        }

        if (Object.keys(updateData).length > 0) {
          await supabaseClient
            .from('tenants')
            .update(updateData)
            .eq('id', transaction.tenant_id);
        }

        // Log the addon purchase
        await supabaseClient.from('system_logs').insert({
          tenant_id: transaction.tenant_id,
          level: 'info',
          message: `Addon purchased: ${transaction.transaction_type}`,
          metadata: {
            order_id: orderId,
            quantity: transaction.quantity,
            amount: transaction.amount
          }
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        message: 'Payment confirmed successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in payment confirmation:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
