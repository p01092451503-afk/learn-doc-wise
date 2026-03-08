import { useEffect, useRef } from "react";

interface PageTimingResult {
  /** 페이지 로딩 시간 (ms) */
  loadTime: number | null;
  /** 페이지 경로 */
  path: string;
}

/**
 * 페이지별 로딩 시간을 측정하는 훅
 * 컴포넌트 마운트부터 렌더링 완료까지의 시간을 측정합니다.
 */
export function usePageTiming(pageName: string): void {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const elapsed = performance.now() - startTime.current;
    const isDev = import.meta.env.DEV;

    if (isDev) {
      console.log(`[PageTiming] ${pageName}: ${elapsed.toFixed(0)}ms`);
    }

    // Report via Performance API mark
    try {
      performance.mark(`page-${pageName}-loaded`);
      performance.measure(`page-${pageName}-render`, {
        start: startTime.current,
        end: performance.now(),
      });
    } catch {
      // Performance API not fully supported
    }
  }, [pageName]);
}
