import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface BrowserGuardOptions {
  enabled?: boolean;
  maxTabSwitches?: number;
  onTabSwitch?: (count: number) => void;
  onForceEnd?: () => void;
  onWarning?: (message: string) => void;
}

export const useBrowserGuard = (options: BrowserGuardOptions = {}) => {
  const {
    enabled = true,
    maxTabSwitches = 3,
    onTabSwitch,
    onForceEnd,
    onWarning,
  } = options;

  const { toast } = useToast();
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const warningShownRef = useRef(false);

  // 풀스크린 모드 요청
  const requestFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.warn("Fullscreen request denied:", error);
    }
  }, []);

  // 풀스크린 모드 종료
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn("Exit fullscreen failed:", error);
    }
  }, []);

  // 탭 이탈 경고
  const showTabSwitchWarning = useCallback((count: number) => {
    const remaining = maxTabSwitches - count;
    
    if (remaining <= 0) {
      toast({
        title: "⚠️ 시험 강제 종료",
        description: "탭 이탈 횟수 초과로 시험이 강제 종료됩니다.",
        variant: "destructive",
      });
      onWarning?.("탭 이탈 횟수 초과로 시험이 강제 종료됩니다.");
      onForceEnd?.();
    } else {
      toast({
        title: "⚠️ 탭 이탈 감지",
        description: `시험 중 다른 탭으로 이동하지 마세요. 남은 경고: ${remaining}회`,
        variant: "destructive",
      });
      onWarning?.(`탭 이탈이 감지되었습니다. 남은 경고: ${remaining}회`);
    }
  }, [maxTabSwitches, toast, onForceEnd, onWarning]);

  // 가시성 변경 핸들러
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false);
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          onTabSwitch?.(newCount);
          showTabSwitchWarning(newCount);
          return newCount;
        });
      } else {
        setIsActive(true);
      }
    };

    const handleBlur = () => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        setIsActive(false);
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          onTabSwitch?.(newCount);
          showTabSwitchWarning(newCount);
          return newCount;
        });
        
        setTimeout(() => {
          warningShownRef.current = false;
        }, 1000);
      }
    };

    const handleFocus = () => {
      setIsActive(true);
    };

    // 컨텍스트 메뉴 차단
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: "우클릭 차단됨",
        description: "시험 중에는 우클릭이 차단됩니다.",
        variant: "destructive",
      });
    };

    // 복사/붙여넣기 차단
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({
        title: "복사 차단됨",
        description: "시험 중에는 복사가 차단됩니다.",
        variant: "destructive",
      });
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({
        title: "붙여넣기 차단됨",
        description: "시험 중에는 붙여넣기가 차단됩니다.",
        variant: "destructive",
      });
    };

    // 특정 키보드 단축키 차단
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C, Ctrl+V, Ctrl+P, F12, Ctrl+Shift+I 차단
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        toast({
          title: "단축키 차단됨",
          description: "시험 중에는 해당 단축키가 차단됩니다.",
          variant: "destructive",
        });
      }
    };

    // 풀스크린 종료 감지
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      if (!document.fullscreenElement && isFullscreen) {
        toast({
          title: "⚠️ 전체화면 모드 종료",
          description: "시험 중에는 전체화면 모드를 유지해주세요.",
          variant: "destructive",
        });
        onWarning?.("전체화면 모드가 종료되었습니다.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [enabled, toast, onTabSwitch, showTabSwitchWarning, isFullscreen, onWarning]);

  // 브라우저 뒤로가기 차단
  useEffect(() => {
    if (!enabled) return;

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      toast({
        title: "⚠️ 뒤로가기 차단",
        description: "시험 중에는 뒤로가기가 차단됩니다.",
        variant: "destructive",
      });
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled, toast]);

  // 카운터 리셋
  const resetGuard = useCallback(() => {
    setTabSwitchCount(0);
    setIsActive(true);
  }, []);

  return {
    tabSwitchCount,
    isActive,
    isFullscreen,
    requestFullscreen,
    exitFullscreen,
    resetGuard,
    remainingWarnings: maxTabSwitches - tabSwitchCount,
  };
};
