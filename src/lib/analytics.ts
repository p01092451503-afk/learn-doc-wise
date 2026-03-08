/**
 * Web Vitals Analytics - Core Web Vitals 측정 및 추적
 * LCP, FID, CLS, TTFB, FCP 측정
 */
import { onLCP, onFID, onCLS, onTTFB, onFCP, type Metric } from "web-vitals";
import { supabase } from "@/integrations/supabase/client";

const isDev = import.meta.env.DEV;

async function sendMetric(metric: Metric) {
  const payload = {
    metric_name: metric.name,
    metric_value: Math.round(metric.value * 100) / 100,
    page_url: window.location.pathname,
    user_agent: navigator.userAgent,
  };

  if (isDev) {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value.toFixed(2), metric.rating);
    return;
  }

  try {
    await supabase.from("performance_logs").insert(payload);
  } catch (error) {
    console.error("[Web Vitals] Failed to send metric:", error);
  }
}

/**
 * Web Vitals 측정을 시작합니다.
 * 앱 초기화 시 한 번 호출하세요.
 */
export function initWebVitals() {
  onLCP(sendMetric);
  onFID(sendMetric);
  onCLS(sendMetric);
  onTTFB(sendMetric);
  onFCP(sendMetric);

  if (isDev) {
    console.log("[Web Vitals] Measurement initialized (dev mode - console only)");
  }
}
