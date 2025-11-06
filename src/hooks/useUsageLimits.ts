import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UsageLimits {
  studentCount: number;
  maxStudents: number;
  storageUsedGB: number;
  maxStorageGB: number;
  aiTokensUsed: number;
  maxAITokens: number;
  isStudentLimitExceeded: boolean;
  isStorageLimitExceeded: boolean;
  isAITokenLimitExceeded: boolean;
  isAnyLimitExceeded: boolean;
  studentUsagePercent: number;
  storageUsagePercent: number;
  aiTokenUsagePercent: number;
}

const PLAN_LIMITS = {
  starter: { maxStudents: 50, maxStorageGB: 10, maxAITokens: 100000 },
  professional: { maxStudents: 200, maxStorageGB: 50, maxAITokens: 500000 },
  enterprise: { maxStudents: 1000, maxStorageGB: 200, maxAITokens: 2000000 },
};

export const useUsageLimits = (tenantId?: string) => {
  const [limits, setLimits] = useState<UsageLimits>({
    studentCount: 0,
    maxStudents: 0,
    storageUsedGB: 0,
    maxStorageGB: 0,
    aiTokensUsed: 0,
    maxAITokens: 0,
    isStudentLimitExceeded: false,
    isStorageLimitExceeded: false,
    isAITokenLimitExceeded: false,
    isAnyLimitExceeded: false,
    studentUsagePercent: 0,
    storageUsagePercent: 0,
    aiTokenUsagePercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsageLimits = async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    try {
      // Get tenant info
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("plan, max_students, max_storage_gb")
        .eq("id", tenantId)
        .single();

      if (tenantError) throw tenantError;

      // Get latest usage metrics
      const { data: usage, error: usageError } = await supabase
        .from("usage_metrics")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (usageError && usageError.code !== 'PGRST116') throw usageError;

      const planLimits = PLAN_LIMITS[tenant.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.starter;
      const maxStudents = tenant.max_students || planLimits.maxStudents;
      const maxStorageGB = tenant.max_storage_gb || planLimits.maxStorageGB;
      const maxAITokens = planLimits.maxAITokens;

      const studentCount = usage?.student_count || 0;
      const storageUsedGB = usage?.storage_used_gb || 0;
      const aiTokensUsed = usage?.ai_tokens_used || 0;

      const studentUsagePercent = (studentCount / maxStudents) * 100;
      const storageUsagePercent = (storageUsedGB / maxStorageGB) * 100;
      const aiTokenUsagePercent = (aiTokensUsed / maxAITokens) * 100;

      const isStudentLimitExceeded = studentCount >= maxStudents;
      const isStorageLimitExceeded = storageUsedGB >= maxStorageGB;
      const isAITokenLimitExceeded = aiTokensUsed >= maxAITokens;
      const isAnyLimitExceeded = isStudentLimitExceeded || isStorageLimitExceeded || isAITokenLimitExceeded;

      setLimits({
        studentCount,
        maxStudents,
        storageUsedGB,
        maxStorageGB,
        aiTokensUsed,
        maxAITokens,
        isStudentLimitExceeded,
        isStorageLimitExceeded,
        isAITokenLimitExceeded,
        isAnyLimitExceeded,
        studentUsagePercent,
        storageUsagePercent,
        aiTokenUsagePercent,
      });
    } catch (error: any) {
      console.error("Error fetching usage limits:", error);
      toast({
        title: "오류",
        description: "사용량 제한 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageLimits();

    // Refresh every 30 seconds for real-time monitoring
    const interval = setInterval(fetchUsageLimits, 30000);

    return () => clearInterval(interval);
  }, [tenantId]);

  return { limits, loading, refresh: fetchUsageLimits };
};
