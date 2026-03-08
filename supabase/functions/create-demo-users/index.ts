import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { getCorsHeaders, handleCorsOptions, checkRateLimit, getClientIdentifier, errorResponse } from "../_shared/cors.ts";

interface DemoUser {
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
}

const demoUsers: DemoUser[] = [
  { email: 'student@test.com', password: 'test123', role: 'student', name: '데모 학생' },
  { email: 'teacher@test.com', password: 'test123', role: 'teacher', name: '데모 강사' },
  { email: 'admin@test.com', password: 'test123', role: 'admin', name: '데모 관리자' },
];

Deno.serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const identifier = getClientIdentifier(req);
    await checkRateLimit('create-demo-users', identifier, 3, 60);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = [];

    for (const demoUser of demoUsers) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUsers?.users.some(u => u.email === demoUser.email);

      if (userExists) {
        results.push({ email: demoUser.email, status: 'already_exists' });
        continue;
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: demoUser.email, password: demoUser.password, email_confirm: true,
        user_metadata: { name: demoUser.name },
      });

      if (createError) {
        console.error(`Error creating user ${demoUser.email}:`, createError);
        results.push({ email: demoUser.email, status: 'error', error: createError.message });
        continue;
      }

      if (!newUser.user) {
        results.push({ email: demoUser.email, status: 'error', error: 'User creation failed' });
        continue;
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles').insert({ user_id: newUser.user.id, full_name: demoUser.name });
      if (profileError) { console.error(`Error creating profile for ${demoUser.email}:`, profileError); }

      const { error: roleError } = await supabaseAdmin
        .from('user_roles').insert({ user_id: newUser.user.id, role: demoUser.role });

      if (roleError) {
        console.error(`Error assigning role for ${demoUser.email}:`, roleError);
        results.push({ email: demoUser.email, status: 'partial', error: 'Role assignment failed' });
        continue;
      }

      results.push({ email: demoUser.email, status: 'created', role: demoUser.role });
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in create-demo-users function:', error);
    return errorResponse(error, corsHeaders);
  }
});
