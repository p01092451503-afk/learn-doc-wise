import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsOptions, parseBodyWithLimit, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('toss-payment-request', identifier, 10, 60);

    const { orderId, orderName, amount, customerEmail, customerName } = await parseBodyWithLimit(req) as any;

    if (!orderId || !orderName || !amount) {
      throw new Error("Required fields missing: orderId, orderName, amount");
    }

    const paymentData = {
      orderId, orderName, amount, customerEmail, customerName,
      successUrl: `${req.headers.get('origin')}/payment/success`,
      failUrl: `${req.headers.get('origin')}/payment/fail`,
    };

    console.log('Payment request prepared:', paymentData);

    return new Response(
      JSON.stringify({ success: true, data: paymentData, message: 'Payment request prepared' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in payment request:', error);
    return errorResponse(error, corsHeaders);
  }
});
