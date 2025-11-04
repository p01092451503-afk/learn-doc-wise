import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoUser {
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
}

const demoUsers: DemoUser[] = [
  {
    email: 'student@test.com',
    password: 'test123',
    role: 'student',
    name: '데모 학생',
  },
  {
    email: 'teacher@test.com',
    password: 'test123',
    role: 'teacher',
    name: '데모 강사',
  },
  {
    email: 'admin@test.com',
    password: 'test123',
    role: 'admin',
    name: '데모 관리자',
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results = [];

    // Get existing users once
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    
    for (const demoUser of demoUsers) {

      // Delete existing user first if they exist
      const existingUser = existingUsers?.users.find(u => u.email === demoUser.email);
      if (existingUser) {
        await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
        console.log(`Deleted existing user: ${demoUser.email}`);
      }

      // Create user with admin API
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: demoUser.email,
        password: demoUser.password,
        email_confirm: true,
        user_metadata: {
          name: demoUser.name,
        },
      });
      
      console.log(`User creation result for ${demoUser.email}:`, { 
        success: !createError, 
        userId: newUser?.user?.id,
        error: createError 
      });

      if (createError) {
        console.error(`Error creating user ${demoUser.email}:`, createError);
        results.push({
          email: demoUser.email,
          status: 'error',
          error: createError.message,
        });
        continue;
      }

      if (!newUser.user) {
        results.push({
          email: demoUser.email,
          status: 'error',
          error: 'User creation failed',
        });
        continue;
      }

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: newUser.user.id,
          full_name: demoUser.name,
        });

      if (profileError) {
        console.error(`Error creating profile for ${demoUser.email}:`, profileError);
      }

      // Assign role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role: demoUser.role,
        });

      if (roleError) {
        console.error(`Error assigning role for ${demoUser.email}:`, roleError);
        results.push({
          email: demoUser.email,
          status: 'partial',
          error: 'Role assignment failed',
        });
        continue;
      }

      results.push({
        email: demoUser.email,
        status: 'created',
        role: demoUser.role,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-demo-users function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});