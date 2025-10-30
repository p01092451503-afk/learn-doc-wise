import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  contentId: string;
  videoUrl: string;
  videoProvider: "youtube" | "vimeo" | "direct";
  onProgressUpdate?: (progress: number, position: number) => void;
}

const VideoPlayer = ({
  contentId,
  videoUrl,
  videoProvider,
  onProgressUpdate,
}: VideoPlayerProps) => {
  const [progress, setProgress] = useState(0);
  const [lastPosition, setLastPosition] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Extract video ID from URL
  const getVideoId = (url: string, provider: string) => {
    if (provider === "youtube") {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      return match ? match[1] : null;
    } else if (provider === "vimeo") {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? match[1] : null;
    }
    return url;
  };

  const videoId = getVideoId(videoUrl, videoProvider);

  // Get embed URL
  const getEmbedUrl = () => {
    if (!videoId) return "";
    
    if (videoProvider === "youtube") {
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
    } else if (videoProvider === "vimeo") {
      return `https://player.vimeo.com/video/${videoId}?api=1&player_id=vimeo_player`;
    }
    return videoUrl;
  };

  // Save progress to database
  const saveProgress = async (progressPercentage: number, positionSeconds: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc("update_content_progress", {
        p_user_id: user.id,
        p_content_id: contentId,
        p_progress_percentage: progressPercentage,
        p_last_position_seconds: Math.floor(positionSeconds),
      });

      onProgressUpdate?.(progressPercentage, positionSeconds);
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  // YouTube player integration
  useEffect(() => {
    if (videoProvider !== "youtube") return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;

      try {
        const data = JSON.parse(event.data);
        
        if (data.event === "infoDelivery" && data.info?.currentTime && data.info?.duration) {
          const currentTime = data.info.currentTime;
          const duration = data.info.duration;
          const progressPercentage = (currentTime / duration) * 100;

          setProgress(progressPercentage);
          setLastPosition(currentTime);

          // Save progress every 10 seconds
          if (Math.floor(currentTime) % 10 === 0) {
            saveProgress(progressPercentage, currentTime);
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [videoProvider, contentId]);

  // Vimeo player integration
  useEffect(() => {
    if (videoProvider !== "vimeo") return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("vimeo.com")) return;

      try {
        const data = JSON.parse(event.data);
        
        if (data.event === "timeupdate") {
          const currentTime = data.data.seconds;
          const duration = data.data.duration;
          const progressPercentage = (currentTime / duration) * 100;

          setProgress(progressPercentage);
          setLastPosition(currentTime);

          // Save progress every 10 seconds
          if (Math.floor(currentTime) % 10 === 0) {
            saveProgress(progressPercentage, currentTime);
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    };

    window.addEventListener("message", handleMessage);

    // Subscribe to timeupdate event
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ method: "addEventListener", value: "timeupdate" }),
        "*"
      );
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [videoProvider, contentId]);

  // Save final progress on unmount
  useEffect(() => {
    return () => {
      if (progress > 0) {
        saveProgress(progress, lastPosition);
      }
    };
  }, [progress, lastPosition]);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-muted rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">유효하지 않은 비디오 URL입니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          ref={iframeRef}
          src={getEmbedUrl()}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>진도율</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
