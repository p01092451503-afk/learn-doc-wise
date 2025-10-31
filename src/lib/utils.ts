import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * YouTube 또는 Vimeo URL에서 비디오 ID를 추출하고 썸네일 URL을 반환합니다
 */
export function getVideoThumbnail(videoUrl: string, provider: string): string | null {
  if (!videoUrl) return null;

  try {
    if (provider === "youtube") {
      // YouTube URL 패턴: youtu.be/VIDEO_ID 또는 youtube.com/watch?v=VIDEO_ID
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = videoUrl.match(youtubeRegex);
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
      }
    } else if (provider === "vimeo") {
      // Vimeo URL 패턴: vimeo.com/VIDEO_ID 또는 player.vimeo.com/video/VIDEO_ID
      const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
      const match = videoUrl.match(vimeoRegex);
      if (match && match[1]) {
        // Vimeo 썸네일은 서드파티 서비스 사용
        return `https://vumbnail.com/${match[1]}.jpg`;
      }
    }
  } catch (error) {
    console.error("Error extracting video thumbnail:", error);
  }

  return null;
}

/**
 * AI 응답에서 마크다운 기호를 제거하고 깔끔한 텍스트로 변환합니다
 */
export function formatAIResponse(text: string): string {
  if (!text) return "";
  
  return text
    // ### 제목을 단순 텍스트로
    .replace(/^###\s+(.+)$/gm, '\n$1\n')
    .replace(/^##\s+(.+)$/gm, '\n$1\n')
    .replace(/^#\s+(.+)$/gm, '\n$1\n')
    // ** 볼드 제거
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // * 이탤릭 제거
    .replace(/\*(.+?)\*/g, '$1')
    // _ 이탤릭/볼드 제거
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // - 또는 * 로 시작하는 리스트를 • 로 변경
    .replace(/^[\*\-]\s+/gm, '• ')
    // 숫자 리스트 포맷 유지
    .replace(/^(\d+)\.\s+/gm, '$1. ')
    // 코드 블록 백틱 제거
    .replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```\w*\n?/g, '').replace(/```$/g, '');
    })
    // 인라인 코드 백틱 제거
    .replace(/`(.+?)`/g, '$1')
    // 링크 포맷 [텍스트](URL) -> 텍스트
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // 이미지 포맷 ![alt](URL) 제거
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    // > 인용구 제거
    .replace(/^>\s+/gm, '')
    // --- 구분선 제거
    .replace(/^[\-\*\_]{3,}$/gm, '')
    // 연속된 빈 줄을 하나로
    .replace(/\n{3,}/g, '\n\n')
    // 앞뒤 공백 제거
    .trim();
}
