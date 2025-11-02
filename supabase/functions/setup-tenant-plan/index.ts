import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlanConfig {
  max_students: number | null;
  max_storage_gb: number | null;
  ai_tokens_monthly: number;
  features: string[];
  price: number;
}

const PLAN_CONFIGS: Record<string, PlanConfig> = {
  starter: {
    max_students: null, // 제한 없음
    max_storage_gb: 5,
    ai_tokens_monthly: 0,
    features: ['basic_courses', 'attendance', 'assignments', 'community'],
    price: 0,
  },
  standard: {
    max_students: 200,
    max_storage_gb: 50,
    ai_tokens_monthly: 0,
    features: [
      'basic_courses',
      'unlimited_courses',
      'attendance',
      'assignments',
      'auto_grading',
      'learning_progress',
      'certificates',
      'community'
    ],
    price: 150000,
  },
  pro: {
    max_students: 500,
    max_storage_gb: 100,
    ai_tokens_monthly: 100000,
    features: [
      'basic_courses',
      'unlimited_courses',
      'attendance',
      'assignments',
      'auto_grading',
      'learning_progress',
      'certificates',
      'community',
      'ai_grading',
      'ai_feedback',
      'ai_translate',
      'ai_summary',
      'ai_quiz',
      'gamification',
      'leaderboard'
    ],
    price: 300000,
  },
  professional: {
    max_students: 2000,
    max_storage_gb: 300,
    ai_tokens_monthly: 500000,
    features: [
      'basic_courses',
      'unlimited_courses',
      'attendance',
      'assignments',
      'auto_grading',
      'learning_progress',
      'certificates',
      'community',
      'ai_grading',
      'ai_feedback',
      'ai_translate',
      'ai_summary',
      'ai_quiz',
      'ai_learning_path',
      'ai_progress_prediction',
      'ai_analytics',
      'ai_report',
      'ai_study_match',
      'ai_tutor',
      'gamification',
      'leaderboard',
      'mobile_app',
      'dedicated_manager',
      'priority_support'
    ],
    price: 600000,
  },
  enterprise: {
    max_students: null, // 무제한
    max_storage_gb: null, // 무제한
    ai_tokens_monthly: 1000000,
    features: [
      'basic_courses',
      'unlimited_courses',
      'attendance',
      'assignments',
      'auto_grading',
      'learning_progress',
      'certificates',
      'community',
      'ai_grading',
      'ai_feedback',
      'ai_translate',
      'ai_summary',
      'ai_quiz',
      'ai_learning_path',
      'ai_progress_prediction',
      'ai_analytics',
      'ai_report',
      'ai_study_match',
      'ai_tutor',
      'gamification',
      'leaderboard',
      'mobile_app',
      'dedicated_manager',
      'priority_support',
      'on_premise',
      'customization',
      'dev_team_support',
      'sso',
      'api_integration'
    ],
    price: 1200000,
  },
  enterprise_hrd: {
    max_students: null, // 무제한
    max_storage_gb: null, // 무제한
    ai_tokens_monthly: 2000000,
    features: [
      'basic_courses',
      'unlimited_courses',
      'attendance',
      'assignments',
      'auto_grading',
      'learning_progress',
      'certificates',
      'community',
      'ai_grading',
      'ai_feedback',
      'ai_translate',
      'ai_summary',
      'ai_quiz',
      'ai_learning_path',
      'ai_progress_prediction',
      'ai_analytics',
      'ai_report',
      'ai_study_match',
      'ai_tutor',
      'gamification',
      'leaderboard',
      'mobile_app',
      'dedicated_manager',
      'priority_support',
      'on_premise',
      'customization',
      'dev_team_support',
      'sso',
      'api_integration',
      'hrd_attendance',
      'hrd_allowance',
      'hrd_training_log',
      'hrd_dropout',
      'hrd_counseling',
      'hrd_satisfaction',
      'hrd_completion',
      'hrd_report',
      'hrd_net_integration',
      'hrd_consulting'
    ],
    price: 2000000,
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { tenantId, plan } = await req.json();

    if (!tenantId || !plan) {
      return new Response(
        JSON.stringify({ error: 'tenantId and plan are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const planConfig = PLAN_CONFIGS[plan];
    if (!planConfig) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Setting up plan ${plan} for tenant ${tenantId}`);

    // 테넌트 업데이트
    const { error: tenantError } = await supabaseClient
      .from('tenants')
      .update({
        plan: plan,
        max_students: planConfig.max_students,
        max_storage_gb: planConfig.max_storage_gb,
        enabled_features: planConfig.features,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tenantId);

    if (tenantError) {
      console.error('Error updating tenant:', tenantError);
      throw tenantError;
    }

    // AI 사용량 제한 초기화 (월별)
    if (planConfig.ai_tokens_monthly > 0) {
      const { error: aiQuotaError } = await supabaseClient
        .from('ai_usage_logs')
        .insert({
          tenant_id: tenantId,
          user_id: null,
          tokens_used: 0,
          model_name: 'quota_reset',
          prompt_text: `Monthly quota set to ${planConfig.ai_tokens_monthly} tokens`,
          response_text: `Plan: ${plan}`,
        });

      if (aiQuotaError) {
        console.error('Error setting AI quota:', aiQuotaError);
      }
    }

    // 플랜 변경 로그 기록
    const { error: logError } = await supabaseClient
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        log_level: 'info',
        log_type: 'plan_change',
        message: `Tenant plan changed to ${plan}`,
        metadata: {
          plan: plan,
          max_students: planConfig.max_students,
          max_storage_gb: planConfig.max_storage_gb,
          ai_tokens_monthly: planConfig.ai_tokens_monthly,
          features: planConfig.features,
          price: planConfig.price,
        },
      });

    if (logError) {
      console.error('Error logging plan change:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully configured ${plan} plan for tenant`,
        config: {
          plan: plan,
          max_students: planConfig.max_students,
          max_storage_gb: planConfig.max_storage_gb,
          ai_tokens_monthly: planConfig.ai_tokens_monthly,
          features_count: planConfig.features.length,
          monthly_price: planConfig.price,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in setup-tenant-plan:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
