import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, orderName, amount, customerEmail, customerName } = await req.json();

    if (!orderId || !orderName || !amount) {
      throw new Error("Required fields missing: orderId, orderName, amount");
    }

    // 토스페이먼츠 결제 준비
    const paymentData = {
      orderId,
      orderName,
      amount,
      customerEmail,
      customerName,
      successUrl: `${req.headers.get('origin')}/payment/success`,
      failUrl: `${req.headers.get('origin')}/payment/fail`,
    };

    console.log('Payment request prepared:', paymentData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: paymentData,
        message: 'Payment request prepared' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in payment request:', error);
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
