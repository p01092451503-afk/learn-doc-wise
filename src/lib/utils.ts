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
