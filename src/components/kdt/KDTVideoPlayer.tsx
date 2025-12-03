import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import Player from "@vimeo/player";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Maximize2, AlertTriangle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface KDTVideoPlayerProps {
  contentId: string;
  videoUrl: string;
  videoProvider: "youtube" | "vimeo" | "direct";
  onProgressUpdate?: (progress: number, position: number) => void;
  onSpeedViolation?: (speed: number) => void;
  minimumWatchPercent?: number; // 기본 80%
}

const KDTVideoPlayer = ({
  contentId,
  videoUrl,
  videoProvider,
  onProgressUpdate,
  onSpeedViolation,
  minimumWatchPercent = 80,
}: KDTVideoPlayerProps) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [lastPosition, setLastPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [savedPosition, setSavedPosition] = useState<number | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [showFocusWarning, setShowFocusWarning] = useState(false);
  const [actualWatchTime, setActualWatchTime] = useState(0);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const youtubeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasResumedRef = useRef(false);
  const watchTimeRef = useRef<NodeJS.Timeout | null>(null);

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

  // 창 포커스 추적
  useEffect(() => {
    const handleBlur = () => {
      setIsFocused(false);
      setShowFocusWarning(true);
      
      // 영상 일시정지
      if (videoProvider === "youtube" && youtubePlayerRef.current) {
        youtubePlayerRef.current.pauseVideo();
      } else if (videoProvider === "vimeo" && vimeoPlayerRef.current) {
        vimeoPlayerRef.current.pause();
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [videoProvider]);

  // 실제 시청 시간 추적
  useEffect(() => {
    if (isPlayerReady && isFocused && !showFocusWarning) {
      watchTimeRef.current = setInterval(() => {
        setActualWatchTime(prev => prev + 1);
      }, 1000);
    } else {
      if (watchTimeRef.current) {
        clearInterval(watchTimeRef.current);
      }
    }

    return () => {
      if (watchTimeRef.current) {
        clearInterval(watchTimeRef.current);
      }
    };
  }, [isPlayerReady, isFocused, showFocusWarning]);

  // 배속 감지 및 강제 1배속 (YouTube)
  const enforcePlaybackSpeed = useCallback(() => {
    if (videoProvider === "youtube" && youtubePlayerRef.current) {
      const currentSpeed = youtubePlayerRef.current.getPlaybackRate();
      if (currentSpeed !== 1) {
        youtubePlayerRef.current.setPlaybackRate(1);
        toast({
          title: "배속 제한",
          description: "KDT 규정에 따라 1배속으로 시청해야 합니다.",
          variant: "destructive",
        });
        onSpeedViolation?.(currentSpeed);
      }
    }
  }, [videoProvider, toast, onSpeedViolation]);

  // 이어보기 옵션 처리
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("content_progress")
          .select("last_position_seconds, progress_percentage")
          .eq("user_id", user.id)
          .eq("content_id", contentId)
          .maybeSingle();

        if (data && data.last_position_seconds > 10) {
          const resumePosition = Math.max(0, data.last_position_seconds - 10);
          setSavedPosition(resumePosition);
          setShowResumePrompt(true);
        }
      } catch (error) {
        console.error("Error loading saved progress:", error);
      }
    };

    loadSavedProgress();
    hasResumedRef.current = false;
  }, [contentId]);

  const handleResume = () => {
    if (savedPosition === null) return;

    if (videoProvider === "youtube" && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(savedPosition, true);
    } else if (videoProvider === "vimeo" && vimeoPlayerRef.current) {
      vimeoPlayerRef.current.setCurrentTime(savedPosition);
    }

    setShowResumePrompt(false);
    hasResumedRef.current = true;
  };

  const handleStartFromBeginning = () => {
    setShowResumePrompt(false);
    setSavedPosition(null);
    hasResumedRef.current = true;
  };

  const handleDismissFocusWarning = () => {
    setShowFocusWarning(false);
    // 재생 재개
    if (videoProvider === "youtube" && youtubePlayerRef.current) {
      youtubePlayerRef.current.playVideo();
    } else if (videoProvider === "vimeo" && vimeoPlayerRef.current) {
      vimeoPlayerRef.current.play();
    }
  };

  const getEmbedUrl = () => {
    if (!videoId) return "";
    
    if (videoProvider === "youtube") {
      // 배속 컨트롤 비활성화 파라미터 추가
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&rel=0&modestbranding=1`;
    } else if (videoProvider === "vimeo") {
      return `https://player.vimeo.com/video/${videoId}?speed=0`; // 배속 컨트롤 비활성화
    }
    return videoUrl;
  };

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

  // Vimeo Player
  useEffect(() => {
    if (videoProvider !== "vimeo" || !iframeRef.current) return;

    const player = new Player(iframeRef.current);
    vimeoPlayerRef.current = player;

    player.getDuration().then((dur) => {
      setDuration(dur);
      setIsPlayerReady(true);
    });

    player.on('timeupdate', (data) => {
      const progressPercentage = (data.seconds / data.duration) * 100;
      setDuration(data.duration);
      setProgress(progressPercentage);
      setLastPosition(data.seconds);

      if (Math.floor(data.seconds) % 10 === 0 && data.seconds > 0) {
        saveProgress(progressPercentage, data.seconds);
      }
    });

    player.on('pause', (data) => {
      const progressPercentage = (data.seconds / data.duration) * 100;
      saveProgress(progressPercentage, data.seconds);
    });

    player.on('ended', () => {
      saveProgress(100, duration);
    });

    return () => {
      if (progress > 0) saveProgress(progress, lastPosition);
      player.off('timeupdate');
      player.off('pause');
      player.off('ended');
    };
  }, [videoProvider, contentId]);

  // YouTube Player
  useEffect(() => {
    if (videoProvider !== "youtube" || !videoId) return;

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initYouTubePlayer();
        return;
      }

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.getElementsByTagName('script')[0].parentNode?.insertBefore(tag, document.getElementsByTagName('script')[0]);
      }

      window.onYouTubeIframeAPIReady = initYouTubePlayer;
    };

    const initYouTubePlayer = () => {
      if (!containerRef.current) return;

      const playerDiv = document.createElement('div');
      playerDiv.id = `youtube-player-kdt-${contentId}`;
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(playerDiv);

      youtubePlayerRef.current = new window.YT.Player(playerDiv, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          disablekb: 0,
        },
        events: {
          onReady: (event: any) => {
            const videoDuration = event.target.getDuration();
            setDuration(videoDuration);
            setIsPlayerReady(true);
            
            // 강제 1배속
            event.target.setPlaybackRate(1);

            const iframe = event.target.getIframe();
            if (iframe) {
              iframe.style.width = '100%';
              iframe.style.height = '100%';
              iframe.style.position = 'absolute';
              iframe.style.top = '0';
              iframe.style.left = '0';
            }

            startProgressTracking();
          },
          onStateChange: (event: any) => {
            // 배속 강제
            enforcePlaybackSpeed();
            
            if (event.data === 1) {
              startProgressTracking();
            } else if (event.data === 2 || event.data === 0) {
              stopProgressTracking();
              
              if (youtubePlayerRef.current) {
                const currentTime = youtubePlayerRef.current.getCurrentTime();
                const videoDuration = youtubePlayerRef.current.getDuration();
                const progressPercentage = event.data === 0 ? 100 : (currentTime / videoDuration) * 100;
                saveProgress(progressPercentage, currentTime);
              }
            }
          },
          onPlaybackRateChange: () => {
            // 배속 변경 시 강제 1배속
            enforcePlaybackSpeed();
          },
        },
      });
    };

    const startProgressTracking = () => {
      if (youtubeIntervalRef.current) clearInterval(youtubeIntervalRef.current);

      youtubeIntervalRef.current = setInterval(() => {
        if (youtubePlayerRef.current?.getCurrentTime) {
          try {
            const currentTime = youtubePlayerRef.current.getCurrentTime();
            const videoDuration = youtubePlayerRef.current.getDuration();
            
            // 배속 체크
            enforcePlaybackSpeed();
            
            if (videoDuration > 0) {
              const progressPercentage = (currentTime / videoDuration) * 100;
              setProgress(progressPercentage);
              setLastPosition(currentTime);
              setDuration(videoDuration);

              if (Math.floor(currentTime) % 10 === 0 && currentTime > 0) {
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
      stopProgressTracking();
      if (youtubePlayerRef.current?.destroy) {
        youtubePlayerRef.current.destroy();
      }
    };
  }, [videoProvider, videoId, contentId, enforcePlaybackSpeed]);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-muted rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">유효하지 않은 비디오 URL입니다</p>
      </div>
    );
  }

  const watchProgress = duration > 0 ? (actualWatchTime / duration) * 100 : 0;
  const meetsMinimum = watchProgress >= minimumWatchPercent;

  return (
    <div className="space-y-4">
      {/* KDT 규정 안내 배지 */}
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" />
          KDT 규정 적용
        </Badge>
        <span className="text-muted-foreground">1배속 고정 | 최소 {minimumWatchPercent}% 시청 필요</span>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group">
        {videoProvider === "youtube" ? (
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        ) : (
          <iframe
            ref={iframeRef}
            src={getEmbedUrl()}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {/* 최대화 버튼 */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          onClick={() => setIsPopupOpen(true)}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        {/* 이어보기 프롬프트 */}
        {showResumePrompt && savedPosition !== null && isPlayerReady && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-card rounded-xl p-6 shadow-elegant max-w-md mx-4 border">
              <div className="text-center space-y-4">
                <Play className="h-12 w-12 mx-auto text-primary" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">이어보기</h3>
                  <p className="text-sm text-muted-foreground">
                    마지막 위치({Math.floor(savedPosition / 60)}분 {Math.floor(savedPosition % 60)}초)부터 이어볼까요?
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleStartFromBeginning} className="flex-1">
                    처음부터
                  </Button>
                  <Button variant="default" onClick={handleResume} className="flex-1">
                    이어보기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 창 이탈 경고 오버레이 */}
        {showFocusWarning && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="bg-destructive/10 border border-destructive rounded-xl p-6 max-w-md mx-4">
              <div className="text-center space-y-4">
                <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
                <div>
                  <h3 className="text-xl font-bold text-destructive mb-2">학습 창을 벗어났습니다</h3>
                  <p className="text-sm text-muted-foreground">
                    KDT 규정에 따라 학습 중 다른 창으로 이동 시 영상이 자동 정지됩니다.
                    계속 시청하시려면 아래 버튼을 클릭해주세요.
                  </p>
                </div>
                <Button onClick={handleDismissFocusWarning} className="w-full">
                  학습 계속하기
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 진도 정보 */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">영상 진도율</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">실제 시청 시간</span>
          <span className={`font-medium ${meetsMinimum ? 'text-green-600' : 'text-orange-500'}`}>
            {Math.floor(actualWatchTime / 60)}분 {actualWatchTime % 60}초 
            ({Math.round(watchProgress)}% / {minimumWatchPercent}% 필요)
          </span>
        </div>
        <Progress value={Math.min(watchProgress, 100)} className={`h-2 ${meetsMinimum ? '[&>div]:bg-green-500' : '[&>div]:bg-orange-500'}`} />
      </div>

      {/* 팝업 다이얼로그 */}
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="max-w-6xl w-[95vw] p-0">
          <div className="relative w-full aspect-video bg-black">
            {videoProvider === "youtube" ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&start=${Math.floor(lastPosition)}&rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe
                src={`${getEmbedUrl()}#t=${Math.floor(lastPosition)}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KDTVideoPlayer;
