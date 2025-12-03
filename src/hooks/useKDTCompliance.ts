import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KDTComplianceOptions {
  courseId?: string;
  contentId?: string;
  onViolation?: (type: string, data: any) => void;
  onForceLogout?: () => void;
}

export const useKDTCompliance = (options: KDTComplianceOptions = {}) => {
  const { toast } = useToast();
  const [isDualMonitor, setIsDualMonitor] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);

  // 세션 토큰 생성
  const generateSessionToken = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  // 컴플라이언스 로그 기록
  const logComplianceEvent = useCallback(async (eventType: string, eventData: any = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("kdt_compliance_logs").insert({
        user_id: user.id,
        content_id: options.contentId || null,
        course_id: options.courseId || null,
        event_type: eventType,
        event_data: eventData,
      });

      options.onViolation?.(eventType, eventData);
    } catch (error) {
      console.error("Failed to log compliance event:", error);
    }
  }, [options.contentId, options.courseId, options.onViolation]);

  // 동시 접속 체크 및 세션 관리
  const initSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newToken = generateSessionToken();
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        timestamp: new Date().toISOString(),
      };

      // 기존 활성 세션 비활성화
      await supabase
        .from("user_sessions")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);

      // 새 세션 생성
      const { error } = await supabase.from("user_sessions").insert({
        user_id: user.id,
        session_token: newToken,
        device_info: deviceInfo,
        is_active: true,
      });

      if (!error) {
        setSessionToken(newToken);
      }
    } catch (error) {
      console.error("Failed to init session:", error);
    }
  }, []);

  // 하트비트 업데이트
  const updateHeartbeat = useCallback(async () => {
    if (!sessionToken) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_sessions")
        .update({ last_heartbeat_at: new Date().toISOString() })
        .eq("session_token", sessionToken)
        .eq("is_active", true)
        .select()
        .single();

      // 세션이 비활성화된 경우 (다른 기기에서 로그인)
      if (error || !data) {
        toast({
          title: "다른 기기에서 로그인됨",
          description: "동시 접속이 감지되어 로그아웃됩니다.",
          variant: "destructive",
        });
        logComplianceEvent("concurrent_login", { sessionToken });
        options.onForceLogout?.();
      }
    } catch (error) {
      console.error("Heartbeat update failed:", error);
    }
  }, [sessionToken, toast, logComplianceEvent, options.onForceLogout]);

  // 듀얼 모니터 감지
  const checkDualMonitor = useCallback(() => {
    const screenWidth = window.screen.width;
    const screenAvailWidth = window.screen.availWidth;
    const screenLeft = window.screenLeft || window.screenX;
    
    // 화면이 왼쪽이나 오른쪽에 있으면 듀얼 모니터로 감지
    const isDual = screenLeft < 0 || screenLeft > screenWidth || 
                   window.screen.width !== window.screen.availWidth;
    
    if (isDual && !isDualMonitor) {
      setIsDualMonitor(true);
      toast({
        title: "듀얼 모니터 감지",
        description: "학습 무결성을 위해 단일 모니터 사용을 권장합니다.",
        variant: "destructive",
      });
      logComplianceEvent("dual_monitor", {
        screenWidth,
        screenAvailWidth,
        screenLeft,
      });
    }
    
    return isDual;
  }, [isDualMonitor, toast, logComplianceEvent]);

  // 창 포커스 추적
  useEffect(() => {
    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      logComplianceEvent("focus_out", {
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [logComplianceEvent]);

  // 세션 초기화 및 하트비트
  useEffect(() => {
    initSession();

    // 10초마다 하트비트
    heartbeatRef.current = setInterval(updateHeartbeat, 10000);

    // 30초마다 듀얼 모니터 체크
    sessionCheckRef.current = setInterval(checkDualMonitor, 30000);

    // 초기 듀얼 모니터 체크
    checkDualMonitor();

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (sessionCheckRef.current) clearInterval(sessionCheckRef.current);
    };
  }, [initSession, updateHeartbeat, checkDualMonitor]);

  // 세션 종료
  const endSession = useCallback(async () => {
    if (!sessionToken) return;

    try {
      await supabase
        .from("user_sessions")
        .update({ is_active: false })
        .eq("session_token", sessionToken);
    } catch (error) {
      console.error("Failed to end session:", error);
    }
  }, [sessionToken]);

  // 진도 스킵 시도 로깅
  const logProgressSkipAttempt = useCallback((currentIndex: number, targetIndex: number) => {
    logComplianceEvent("progress_skip_attempt", {
      currentIndex,
      targetIndex,
      timestamp: new Date().toISOString(),
    });
  }, [logComplianceEvent]);

  // 배속 위반 로깅
  const logSpeedViolation = useCallback((attemptedSpeed: number) => {
    logComplianceEvent("speed_violation", {
      attemptedSpeed,
      timestamp: new Date().toISOString(),
    });
  }, [logComplianceEvent]);

  return {
    isDualMonitor,
    isFocused,
    sessionToken,
    endSession,
    logProgressSkipAttempt,
    logSpeedViolation,
    logComplianceEvent,
  };
};
