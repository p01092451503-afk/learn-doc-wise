import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const ALLOWED_ORIGINS = [
  'https://atomlms.lovable.app',
  'https://id-preview--5af2c9b8-9cdd-42ac-9ec6-f1a0ba0a74c8.lovable.app',
  Deno.env.get('ALLOWED_ORIGIN') || 'http://localhost:5173',
].filter(Boolean);

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const isAllowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o!));
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0]!,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

export function handleCorsOptions(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  return null;
}

const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB

export async function parseBodyWithLimit(req: Request): Promise<Record<string, unknown>> {
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    throw new SizeLimitError('Request body too large (max 1MB)');
  }
  const body = await req.text();
  if (body.length > MAX_BODY_SIZE) {
    throw new SizeLimitError('Request body too large (max 1MB)');
  }
  return JSON.parse(body);
}

export class SizeLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SizeLimitError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export async function checkRateLimit(
  functionName: string,
  identifier: string,
  maxRequests = 60,
  windowSeconds = 60,
): Promise<void> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_function_name: functionName,
    p_identifier: identifier,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error('Rate limit check error:', error);
    return; // fail open
  }

  if (data === false) {
    throw new RateLimitError('Too many requests');
  }
}

export function getClientIdentifier(req: Request): string {
  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    // Use a hash-like short identifier from the token
    const token = authHeader.replace('Bearer ', '');
    return token.slice(-16);
  }
  return req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
}

export function errorResponse(
  error: unknown,
  corsHeaders: Record<string, string>,
): Response {
  if (error instanceof SizeLimitError) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
  if (error instanceof RateLimitError) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      },
    );
  }
  return new Response(
    JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}
