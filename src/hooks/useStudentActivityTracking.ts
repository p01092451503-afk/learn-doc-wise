import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseStudentActivityTrackingOptions {
  courseId: string;
  cohortId?: string;
  contentId?: string;
  enabled?: boolean;
}

export function useStudentActivityTracking({
  courseId,
  cohortId,
  contentId,
  enabled = true,
}: UseStudentActivityTrackingOptions) {
  const { toast } = useToast();
  const activityIdRef = useRef<string | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMouseMoveRef = useRef<Date>(new Date());
  const isOnlineRef = useRef<boolean>(true);
  const isFocusedRef = useRef<boolean>(true);

  // 활동 레코드 초기화 또는 업데이트
  const initializeActivity = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 기존 활동 레코드 확인
      const { data: existingActivity, error: fetchError } = await supabase
        .from("student_activity_tracking")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching activity:", fetchError);
        return;
      }

      const activityData = {
        user_id: user.id,
        course_id: courseId,
        cohort_id: cohortId || null,
        current_content_id: contentId || null,
        is_online: true,
        is_focused: true,
        last_activity_at: new Date().toISOString(),
        last_mouse_movement_at: new Date().toISOString(),
        session_start_at: new Date().toISOString(),
      };

      if (existingActivity) {
        // 기존 레코드 업데이트
        const { error: updateError } = await supabase
          .from("student_activity_tracking")
          .update({
            ...activityData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingActivity.id);

        if (updateError) {
          console.error("Error updating activity:", updateError);
        } else {
          activityIdRef.current = existingActivity.id;
        }
      } else {
        // 새 레코드 생성
        const { data: newActivity, error: insertError } = await supabase
          .from("student_activity_tracking")
          .insert(activityData)
          .select("id")
          .single();

        if (insertError) {
          console.error("Error inserting activity:", insertError);
        } else if (newActivity) {
          activityIdRef.current = newActivity.id;
        }
      }
    } catch (error) {
      console.error("Error initializing activity:", error);
    }
  }, [courseId, cohortId, contentId]);

  // 활동 상태 업데이트
  const updateActivity = useCallback(async () => {
    if (!activityIdRef.current) return;

    try {
      const { error } = await supabase
        .from("student_activity_tracking")
        .update({
          is_online: isOnlineRef.current,
          is_focused: isFocusedRef.current,
          last_activity_at: new Date().toISOString(),
          last_mouse_movement_at: lastMouseMoveRef.current.toISOString(),
          current_content_id: contentId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activityIdRef.current);

      if (error) {
        console.error("Error updating activity:", error);
      }
    } catch (error) {
      console.error("Error in updateActivity:", error);
    }
  }, [contentId]);

  // 오프라인 상태로 전환
  const setOffline = useCallback(async () => {
    if (!activityIdRef.current) return;

    try {
      isOnlineRef.current = false;
      await supabase
        .from("student_activity_tracking")
        .update({
          is_online: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activityIdRef.current);
    } catch (error) {
      console.error("Error setting offline:", error);
    }
  }, []);

  // 마우스 이동 추적
  const handleMouseMove = useCallback(() => {
    lastMouseMoveRef.current = new Date();
  }, []);

  // 화면 포커스 추적
  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
    isOnlineRef.current = true;
    updateActivity();
  }, [updateActivity]);

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    updateActivity();
  }, [updateActivity]);

  // 페이지 가시성 추적
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      isFocusedRef.current = false;
    } else {
      isFocusedRef.current = true;
      isOnlineRef.current = true;
    }
    updateActivity();
  }, [updateActivity]);

  useEffect(() => {
    if (!enabled) return;

    // 초기화
    initializeActivity();

    // 이벤트 리스너 등록
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 주기적 업데이트 (30초마다)
    updateIntervalRef.current = setInterval(() => {
      updateActivity();
    }, 30000);

    // 언마운트 시 오프라인 처리
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }

      setOffline();
    };
  }, [
    enabled,
    initializeActivity,
    updateActivity,
    setOffline,
    handleMouseMove,
    handleFocus,
    handleBlur,
    handleVisibilityChange,
  ]);

  return {
    updateActivity,
    setOffline,
  };
}
