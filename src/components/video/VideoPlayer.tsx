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
  const [duration, setDuration] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Extract video ID from URL
  const getVideoId = (url: string, provider: string) => {
    if (provider === "youtube") {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      return match ? match[1] : null;
    } else if (provider === "vimeo") {
      // Support both vimeo.com/VIDEO_ID and player.vimeo.com/video/VIDEO_ID formats
      const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
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
      console.log("💾 Saving progress:", { contentId, progressPercentage, positionSeconds });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("❌ No user found");
        return;
      }

      const result = await supabase.rpc("update_content_progress", {
        p_user_id: user.id,
        p_content_id: contentId,
        p_progress_percentage: progressPercentage,
        p_last_position_seconds: Math.floor(positionSeconds),
      });

      if (result.error) {
        console.error("❌ Failed to save progress:", result.error);
      } else {
        console.log("✅ Progress saved successfully");
      }

      onProgressUpdate?.(progressPercentage, positionSeconds);
    } catch (error) {
      console.error("❌ Failed to save progress:", error);
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
          const videoDuration = data.info.duration;
          const progressPercentage = (currentTime / videoDuration) * 100;

          setDuration(videoDuration);
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

    let isReady = false;

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("vimeo.com")) return;

      try {
        const data = JSON.parse(event.data);
        
        // Handle ready event
        if (data.event === "ready") {
          console.log("✅ Vimeo player ready");
          isReady = true;
          
          // Subscribe to timeupdate event after ready
          if (iframeRef.current) {
            console.log("📡 Subscribing to timeupdate");
            iframeRef.current.contentWindow?.postMessage(
              JSON.stringify({ method: "addEventListener", value: "timeupdate" }),
              "*"
            );
          }
        }
        
        // Handle timeupdate event
        if (data.event === "timeupdate" && data.data) {
          const currentTime = data.data.seconds;
          const videoDuration = data.data.duration;
          const progressPercentage = (currentTime / videoDuration) * 100;

          console.log("📹 Vimeo timeupdate:", { currentTime, videoDuration, progressPercentage });

          setDuration(videoDuration);
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

    // Wait for iframe to load, then request ready event
    const initializePlayer = () => {
      if (iframeRef.current) {
        console.log("🎬 Initializing Vimeo player");
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ method: "addEventListener", value: "ready" }),
          "*"
        );
      }
    };

    // Try to initialize after a short delay to ensure iframe is loaded
    const timeout = setTimeout(initializePlayer, 500);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("message", handleMessage);
    };
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
        {duration > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>재생 시간</span>
            <span>
              {Math.floor(lastPosition / 60)}:{String(Math.floor(lastPosition % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
