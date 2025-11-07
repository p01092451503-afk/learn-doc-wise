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
    const { tenantId, limitType } = await req.json();

    if (!tenantId || !limitType) {
      throw new Error("Required fields missing: tenantId, limitType");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get tenant info
    const { data: tenant, error: tenantError } = await supabaseClient
      .from('tenants')
      .select('*, auto_billing_settings(*)')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      throw new Error('Tenant not found');
    }

    // Check if auto billing is enabled
    const settings = tenant.auto_billing_settings?.[0];
    if (!settings?.auto_charge_on_limit) {
      console.log('Auto billing not enabled for tenant:', tenantId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Auto billing not enabled',
          requiresManualAction: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Determine addon type and amount
    let transactionType: string;
    let amount: number;
    let quantity: number = 1;
    let description: string;

    switch (limitType) {
      case 'student':
        transactionType = 'addon_student';
        amount = settings.student_addon_price;
        quantity = 10; // 10 students addon
        description = '학생 10명 추가';
        break;
      case 'storage':
        transactionType = 'addon_storage';
        amount = settings.storage_addon_price;
        quantity = 10; // 10GB addon
        description = '스토리지 10GB 추가';
        break;
      case 'ai_token':
        transactionType = 'addon_ai_token';
        amount = settings.ai_token_addon_price;
        quantity = 10000; // 10K tokens addon
        description = 'AI 토큰 10,000개 추가';
        break;
      default:
        throw new Error('Invalid limit type');
    }

    // Generate order ID
    const orderId = `AUTO-${tenantId}-${Date.now()}`;

    // Create billing transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('billing_transactions')
      .insert({
        tenant_id: tenantId,
        order_id: orderId,
        transaction_type: transactionType,
        amount: amount,
        quantity: quantity,
        status: 'pending',
        metadata: {
          limit_type: limitType,
          description: description,
          auto_triggered: true
        }
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      throw transactionError;
    }

    console.log('Auto billing transaction created:', transaction);

    // Prepare payment request
    const paymentData = {
      orderId,
      orderName: description,
      amount,
      customerEmail: settings.billing_email || tenant.representative_email,
      customerName: settings.billing_name || tenant.customer_name,
      successUrl: `${req.headers.get('origin')}/payment/success`,
      failUrl: `${req.headers.get('origin')}/payment/fail`,
    };

    // Log the auto billing trigger
    await supabaseClient.from('system_logs').insert({
      tenant_id: tenantId,
      level: 'info',
      message: `Auto billing triggered for ${limitType}`,
      metadata: {
        transaction_id: transaction.id,
        order_id: orderId,
        amount: amount
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction,
        paymentData,
        message: 'Auto billing transaction created' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in auto billing:', error);
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
