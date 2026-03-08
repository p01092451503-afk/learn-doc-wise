import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Gauge, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VitalMetric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  label: string;
}

const THRESHOLDS = {
  LCP: { good: 2500, unit: "ms", label: "Largest Contentful Paint" },
  CLS: { good: 0.1, unit: "", label: "Cumulative Layout Shift" },
  FID: { good: 100, unit: "ms", label: "First Input Delay" },
  FCP: { good: 1800, unit: "ms", label: "First Contentful Paint" },
  TTFB: { good: 800, unit: "ms", label: "Time to First Byte" },
};

export const WebVitalsCard = ({ theme = "dark" }: { theme?: "dark" | "light" }) => {
  const [metrics, setMetrics] = useState<VitalMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("performance_logs")
        .select("metric_name, metric_value")
        .gte("created_at", sevenDaysAgo.toISOString());

      if (error) throw error;

      // Calculate averages per metric
      const grouped: Record<string, number[]> = {};
      (data || []).forEach((row: any) => {
        if (!grouped[row.metric_name]) grouped[row.metric_name] = [];
        grouped[row.metric_name].push(Number(row.metric_value));
      });

      const vitals: VitalMetric[] = Object.entries(THRESHOLDS).map(([name, config]) => {
        const values = grouped[name] || [];
        const avg = values.length > 0
          ? values.reduce((a, b) => a + b, 0) / values.length
          : 0;
        return {
          name,
          value: Math.round(avg * 100) / 100,
          threshold: config.good,
          unit: config.unit,
          label: config.label,
        };
      });

      setMetrics(vitals);
    } catch (error) {
      console.error("Error fetching web vitals:", error);
    } finally {
      setLoading(false);
    }
  };

  const isExceeded = (metric: VitalMetric) => metric.value > metric.threshold && metric.value > 0;

  return (
    <Card className={cn(
      "transition-colors",
      theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
    )}>
      <CardHeader>
        <CardTitle className={cn(
          "flex items-center gap-2 transition-colors",
          theme === "dark" ? "text-white" : "text-slate-900"
        )}>
          <Gauge className="h-5 w-5 text-violet-500" />
          Web Vitals 현황 (7일 평균)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className={cn(
            "text-center py-4",
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          )}>로딩 중...</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {metrics.map((metric) => {
              const exceeded = isExceeded(metric);
              const hasData = metric.value > 0;
              return (
                <div
                  key={metric.name}
                  className={cn(
                    "rounded-lg p-3 border transition-colors",
                    theme === "dark"
                      ? exceeded
                        ? "border-red-500/50 bg-red-500/10"
                        : "border-slate-700 bg-slate-800/50"
                      : exceeded
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-xs font-medium",
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    )}>{metric.label}</span>
                    {hasData && (exceeded ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    ))}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-xl font-bold",
                      theme === "dark" ? "text-white" : "text-slate-900",
                      exceeded && "text-red-400"
                    )}>
                      {hasData ? metric.value : "—"}
                    </span>
                    {hasData && (
                      <span className={cn(
                        "text-xs",
                        theme === "dark" ? "text-slate-500" : "text-slate-400"
                      )}>{metric.unit}</span>
                    )}
                  </div>
                  <div className={cn(
                    "text-xs mt-1",
                    theme === "dark" ? "text-slate-500" : "text-slate-400"
                  )}>
                    기준: {metric.threshold}{metric.unit} 이하
                  </div>
                  {exceeded && (
                    <Badge className="mt-1.5 bg-red-500/20 text-red-400 border-red-500/50 text-[10px] px-1.5 py-0">
                      기준 초과
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
