import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlanLimits {
  starter: { maxStudents: number; maxStorageGB: number };
  professional: { maxStudents: number; maxStorageGB: number };
  enterprise: { maxStudents: number; maxStorageGB: number };
}

const PLAN_LIMITS: PlanLimits = {
  starter: { maxStudents: 50, maxStorageGB: 10 },
  professional: { maxStudents: 200, maxStorageGB: 50 },
  enterprise: { maxStudents: 1000, maxStorageGB: 200 },
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting usage limit checks...');

    // Get all active tenants with their plans
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, plan, max_students, max_storage_gb')
      .eq('is_active', true);

    if (tenantsError) {
      console.error('Error fetching tenants:', tenantsError);
      throw tenantsError;
    }

    const violations = [];

    // Check usage for each tenant
    for (const tenant of tenants || []) {
      console.log(`Checking limits for tenant: ${tenant.name}`);

      // Get latest usage metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (metricsError && metricsError.code !== 'PGRST116') {
        console.error(`Error fetching metrics for tenant ${tenant.id}:`, metricsError);
        continue;
      }

      if (!metrics) {
        console.log(`No metrics found for tenant ${tenant.name}`);
        continue;
      }

      const limits = PLAN_LIMITS[tenant.plan as keyof PlanLimits] || PLAN_LIMITS.starter;
      const maxStudents = tenant.max_students || limits.maxStudents;
      const maxStorage = tenant.max_storage_gb || limits.maxStorageGB;

      // Check student count
      if (metrics.student_count > maxStudents) {
        violations.push({
          tenant_id: tenant.id,
          tenant_name: tenant.name,
          type: 'student_count',
          current: metrics.student_count,
          limit: maxStudents,
          overage: metrics.student_count - maxStudents,
        });

        console.log(`⚠️ Student limit exceeded for ${tenant.name}: ${metrics.student_count}/${maxStudents}`);
      }

      // Check storage usage
      if (metrics.storage_used_gb > maxStorage) {
        violations.push({
          tenant_id: tenant.id,
          tenant_name: tenant.name,
          type: 'storage',
          current: metrics.storage_used_gb,
          limit: maxStorage,
          overage: metrics.storage_used_gb - maxStorage,
        });

        console.log(`⚠️ Storage limit exceeded for ${tenant.name}: ${metrics.storage_used_gb.toFixed(2)}GB/${maxStorage}GB`);
      }

      // Log violations to system_logs
      if (violations.length > 0) {
        for (const violation of violations) {
          await supabase.from('system_logs').insert({
            tenant_id: tenant.id,
            log_level: 'warn',
            message: `Usage limit exceeded: ${violation.type}`,
            error_details: violation,
          });
        }
      }
    }

    console.log(`Usage limit checks completed. Found ${violations.length} violations.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usage limit checks completed',
        violations,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in check-usage-limits:', error);
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
