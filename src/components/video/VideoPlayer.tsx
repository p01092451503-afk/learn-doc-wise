import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Player from "@vimeo/player";

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

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
  const vimeoPlayerRef = useRef<Player | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const youtubeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract video ID from URL
  const getVideoId = (url: string, provider: string) => {
    if (provider === "youtube") {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      return match ? match[1] : null;
    } else if (provider === "vimeo") {
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
      return `https://player.vimeo.com/video/${videoId}`;
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

  // Vimeo Player SDK integration
  useEffect(() => {
    if (videoProvider !== "vimeo" || !iframeRef.current) return;

    console.log("🎬 Initializing Vimeo Player SDK");
    
    const player = new Player(iframeRef.current);
    vimeoPlayerRef.current = player;

    // Get duration
    player.getDuration().then((dur) => {
      console.log("📏 Video duration:", dur);
      setDuration(dur);
    });

    // Handle timeupdate
    player.on('timeupdate', (data) => {
      const currentTime = data.seconds;
      const videoDuration = data.duration;
      const progressPercentage = (currentTime / videoDuration) * 100;

      console.log("📹 Vimeo timeupdate:", { currentTime, videoDuration, progressPercentage });

      setDuration(videoDuration);
      setProgress(progressPercentage);
      setLastPosition(currentTime);

      // Save progress every 10 seconds
      if (Math.floor(currentTime) % 10 === 0 && currentTime > 0) {
        saveProgress(progressPercentage, currentTime);
      }
    });

    // Handle play event
    player.on('play', () => {
      console.log("▶️ Video started playing");
    });

    // Handle pause event
    player.on('pause', (data) => {
      console.log("⏸️ Video paused at:", data.seconds);
      // Save progress when paused
      const progressPercentage = (data.seconds / data.duration) * 100;
      saveProgress(progressPercentage, data.seconds);
    });

    // Handle ended event
    player.on('ended', () => {
      console.log("✅ Video ended");
      saveProgress(100, duration);
    });

    return () => {
      // Save final progress before cleanup
      if (progress > 0) {
        saveProgress(progress, lastPosition);
      }
      player.off('timeupdate');
      player.off('play');
      player.off('pause');
      player.off('ended');
    };
  }, [videoProvider, contentId]);

  // YouTube player integration with IFrame API
  useEffect(() => {
    if (videoProvider !== "youtube" || !videoId) return;

    console.log("🎬 Initializing YouTube Player");

    // Load YouTube IFrame API
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initYouTubePlayer();
        return;
      }

      // Check if script already exists
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // Set callback for when API is ready
      window.onYouTubeIframeAPIReady = () => {
        console.log("✅ YouTube API Ready");
        initYouTubePlayer();
      };
    };

    const initYouTubePlayer = () => {
      if (!containerRef.current) return;

      console.log("🎥 Creating YouTube Player instance");

      // Create a unique div for the player
      const playerDiv = document.createElement('div');
      playerDiv.id = `youtube-player-${contentId}`;
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(playerDiv);

      youtubePlayerRef.current = new window.YT.Player(playerDiv, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            console.log("▶️ YouTube player ready");
            const videoDuration = event.target.getDuration();
            setDuration(videoDuration);
            console.log("📏 Video duration:", videoDuration);

            // Start polling for progress
            startProgressTracking();
          },
          onStateChange: (event: any) => {
            console.log("🔄 Player state changed:", event.data);
            
            // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
            if (event.data === 1) {
              // Playing
              startProgressTracking();
            } else if (event.data === 2 || event.data === 0) {
              // Paused or Ended
              stopProgressTracking();
              
              // Save progress when paused or ended
              if (youtubePlayerRef.current) {
                const currentTime = youtubePlayerRef.current.getCurrentTime();
                const videoDuration = youtubePlayerRef.current.getDuration();
                const progressPercentage = event.data === 0 ? 100 : (currentTime / videoDuration) * 100;
                
                console.log("💾 Saving progress on pause/end:", { currentTime, videoDuration, progressPercentage });
                saveProgress(progressPercentage, currentTime);
              }
            }
          },
        },
      });
    };

    const startProgressTracking = () => {
      // Clear existing interval
      if (youtubeIntervalRef.current) {
        clearInterval(youtubeIntervalRef.current);
      }

      // Poll for progress every second
      youtubeIntervalRef.current = setInterval(() => {
        if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
          try {
            const currentTime = youtubePlayerRef.current.getCurrentTime();
            const videoDuration = youtubePlayerRef.current.getDuration();
            
            if (videoDuration > 0) {
              const progressPercentage = (currentTime / videoDuration) * 100;
              
              setProgress(progressPercentage);
              setLastPosition(currentTime);
              setDuration(videoDuration);

              // Save progress every 10 seconds
              if (Math.floor(currentTime) % 10 === 0 && currentTime > 0) {
                console.log("📊 Progress update:", { currentTime, progressPercentage });
                saveProgress(progressPercentage, currentTime);
              }
            }
          } catch (error) {
            console.error("Error tracking progress:", error);
          }
        }
      }, 1000);
    };

    const stopProgressTracking = () => {
      if (youtubeIntervalRef.current) {
        clearInterval(youtubeIntervalRef.current);
        youtubeIntervalRef.current = null;
      }
    };

    loadYouTubeAPI();

    return () => {
      console.log("🧹 Cleaning up YouTube player");
      stopProgressTracking();
      
      // Save final progress
      if (youtubePlayerRef.current && progress > 0) {
        try {
          const currentTime = youtubePlayerRef.current.getCurrentTime();
          saveProgress(progress, currentTime);
        } catch (error) {
          console.error("Error saving final progress:", error);
        }
      }
      
      // Destroy player
      if (youtubePlayerRef.current && youtubePlayerRef.current.destroy) {
        youtubePlayerRef.current.destroy();
      }
    };
  }, [videoProvider, videoId, contentId]);

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
        {videoProvider === "youtube" ? (
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        ) : (
          <iframe
            ref={iframeRef}
            id="vimeo-player"
            src={getEmbedUrl()}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
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
