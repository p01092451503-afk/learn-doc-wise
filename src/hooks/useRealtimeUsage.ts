import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RealtimeUsage {
  student_count: number;
  storage_used_gb: number;
  ai_tokens_used: number;
  last_updated: string;
}

export const useRealtimeUsage = (tenantId?: string) => {
  const [usage, setUsage] = useState<RealtimeUsage>({
    student_count: 0,
    storage_used_gb: 0,
    ai_tokens_used: 0,
    last_updated: new Date().toISOString(),
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!tenantId) return;

    // Initial fetch
    fetchLatestUsage();

    // Set up realtime subscription
    const channel = supabase
      .channel(`usage-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usage_metrics',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          console.log('Usage metrics updated:', payload);
          if (payload.new && typeof payload.new === 'object') {
            const newUsage = payload.new as any;
            setUsage({
              student_count: newUsage.student_count || 0,
              storage_used_gb: newUsage.storage_used_gb || 0,
              ai_tokens_used: newUsage.ai_tokens_used || 0,
              last_updated: new Date().toISOString(),
            });

            // Show notification for significant changes
            toast({
              title: "사용량 업데이트",
              description: "실시간 사용량이 업데이트되었습니다.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  const fetchLatestUsage = async () => {
    if (!tenantId) return;

    const { data, error } = await supabase
      .from("usage_metrics")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching usage:", error);
      return;
    }

    if (data) {
      setUsage({
        student_count: data.student_count || 0,
        storage_used_gb: data.storage_used_gb || 0,
        ai_tokens_used: data.ai_tokens_used || 0,
        last_updated: data.created_at || new Date().toISOString(),
      });
    }
  };

  return { usage, refresh: fetchLatestUsage };
};
