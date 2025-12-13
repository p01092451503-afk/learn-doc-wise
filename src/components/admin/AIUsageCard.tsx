import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface AIUsageStats {
  todayTokens: number;
  monthlyTokens: number;
  maxTokens: number;
  todayRequests: number;
  monthlyRequests: number;
}

const PLAN_TOKEN_LIMITS: Record<string, number> = {
  starter: 0,
  standard: 0,
  pro: 100000,
  professional: 500000,
  enterprise: 1000000,
  enterprise_hrd: 2000000,
};

export const AIUsageCard = () => {
  const { tenant } = useTenant();
  const [stats, setStats] = useState<AIUsageStats>({
    todayTokens: 0,
    monthlyTokens: 0,
    maxTokens: 100000,
    todayRequests: 0,
    monthlyRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIUsage = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

        // Get tenant plan for token limit
        let maxTokens = 100000;
        if (tenant?.id) {
          const { data: tenantData } = await supabase
            .from("tenants")
            .select("plan")
            .eq("id", tenant.id)
            .single();
          
          if (tenantData?.plan) {
            maxTokens = PLAN_TOKEN_LIMITS[tenantData.plan] || 100000;
          }
        }

        // Get today's usage
        const { data: todayData } = await supabase
          .from("ai_usage_logs")
          .select("tokens_used")
          .gte("created_at", startOfDay);

        // Get monthly usage
        const { data: monthlyData } = await supabase
          .from("ai_usage_logs")
          .select("tokens_used")
          .gte("created_at", startOfMonth);

        const todayTokens = todayData?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;
        const monthlyTokens = monthlyData?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;

        setStats({
          todayTokens,
          monthlyTokens,
          maxTokens,
          todayRequests: todayData?.length || 0,
          monthlyRequests: monthlyData?.length || 0,
        });
      } catch (error) {
        console.error("Error fetching AI usage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAIUsage();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAIUsage, 30000);
    return () => clearInterval(interval);
  }, [tenant?.id]);

  const usagePercent = stats.maxTokens > 0 ? (stats.monthlyTokens / stats.maxTokens) * 100 : 0;
  const isWarning = usagePercent >= 80;
  const isCritical = usagePercent >= 95;

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 ${isCritical ? 'border-destructive/50' : isWarning ? 'border-yellow-500/50' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            AI 사용량
          </div>
          <Badge variant="default" className="text-[10px] px-1.5">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Monthly Token Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">이번 달 토큰</span>
            <span className="font-bold text-foreground">
              {stats.monthlyTokens.toLocaleString()} / {stats.maxTokens.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={Math.min(usagePercent, 100)} 
            className={`h-2 ${isCritical ? '[&>div]:bg-destructive' : isWarning ? '[&>div]:bg-yellow-500' : ''}`}
          />
          {(isWarning || isCritical) && (
            <div className={`flex items-center gap-1 text-xs ${isCritical ? 'text-destructive' : 'text-yellow-600'}`}>
              <AlertTriangle className="h-3 w-3" />
              <span>{isCritical ? '토큰 한도에 거의 도달했습니다' : '토큰 사용량이 80%를 초과했습니다'}</span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{stats.todayRequests.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">오늘 요청</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{stats.monthlyRequests.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">이번 달 요청</div>
          </div>
        </div>

        {/* Today's tokens */}
        <div className="flex items-center justify-between text-xs pt-2 border-t">
          <span className="text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            오늘 사용 토큰
          </span>
          <span className="font-medium">{stats.todayTokens.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};
