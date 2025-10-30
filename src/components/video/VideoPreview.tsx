interface VideoPreviewProps {
  videoUrl: string;
  videoProvider: "youtube" | "vimeo" | "direct";
}

const VideoPreview = ({ videoUrl, videoProvider }: VideoPreviewProps) => {
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
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (videoProvider === "vimeo") {
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return videoUrl;
  };

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground text-sm">유효하지 않은 비디오 URL입니다</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={getEmbedUrl()}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPreview;
