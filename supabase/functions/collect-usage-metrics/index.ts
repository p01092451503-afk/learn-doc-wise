import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UsageData {
  tenant_id: string;
  student_count: number;
  storage_used_gb: number;
  bandwidth_gb: number;
  ai_tokens_used: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting usage metrics collection...');

    // Get all active tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id')
      .eq('is_active', true);

    if (tenantsError) {
      console.error('Error fetching tenants:', tenantsError);
      throw tenantsError;
    }

    console.log(`Found ${tenants?.length || 0} active tenants`);

    const usageResults: UsageData[] = [];

    // Collect usage for each tenant
    for (const tenant of tenants || []) {
      console.log(`Collecting usage for tenant: ${tenant.id}`);

      // Count students (users with student role)
      const { count: studentCount, error: studentError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      if (studentError) {
        console.error(`Error counting students for tenant ${tenant.id}:`, studentError);
      }

      // Get AI token usage from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: aiLogs, error: aiError } = await supabase
        .from('ai_usage_logs')
        .select('tokens_used')
        .eq('tenant_id', tenant.id)
        .gte('created_at', today.toISOString());

      if (aiError) {
        console.error(`Error fetching AI logs for tenant ${tenant.id}:`, aiError);
      }

      const totalAiTokens = aiLogs?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;

      // Get storage usage (from avatars bucket)
      const { data: files, error: storageError } = await supabase
        .storage
        .from('avatars')
        .list();

      let storageUsedBytes = 0;
      if (!storageError && files) {
        // This is a simplified approach - in production you'd want to track this more accurately
        storageUsedBytes = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
      }

      const storageUsedGB = storageUsedBytes / (1024 * 1024 * 1024);

      const usageData: UsageData = {
        tenant_id: tenant.id,
        student_count: studentCount || 0,
        storage_used_gb: storageUsedGB,
        bandwidth_gb: 0, // Would need additional tracking
        ai_tokens_used: totalAiTokens,
      };

      usageResults.push(usageData);

      // Insert usage metrics
      const { error: insertError } = await supabase
        .from('usage_metrics')
        .insert({
          tenant_id: tenant.id,
          metric_date: new Date().toISOString().split('T')[0],
          student_count: usageData.student_count,
          storage_used_gb: usageData.storage_used_gb,
          bandwidth_gb: usageData.bandwidth_gb,
          ai_tokens_used: usageData.ai_tokens_used,
        });

      if (insertError) {
        console.error(`Error inserting metrics for tenant ${tenant.id}:`, insertError);
      } else {
        console.log(`Successfully recorded metrics for tenant ${tenant.id}`);
      }
    }

    console.log('Usage metrics collection completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usage metrics collected successfully',
        metrics: usageResults,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in collect-usage-metrics:', error);
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
