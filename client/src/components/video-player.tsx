import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  autoplay?: boolean;
  className?: string;
  onExpand?: () => void;
}

export default function VideoPlayer({ 
  videoUrl, 
  poster, 
  autoplay = true, 
  className = "",
  onExpand 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVideoClick = () => {
    if (onExpand) {
      onExpand();
    }
  };

  return (
    <div 
      className={`relative overflow-hidden bg-black ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        autoPlay={autoplay}
        muted={isMuted}
        loop
        playsInline
        className="w-full h-full object-cover"
        onLoadedData={() => {
          if (autoplay && videoRef.current) {
            videoRef.current.play();
          }
        }}
      />
      
      {/* Controls overlay */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative flex items-center space-x-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={togglePlay}
            className="bg-black/60 hover:bg-black/80 text-white border-0"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleMute}
            className="bg-black/60 hover:bg-black/80 text-white border-0"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
        </div>
      </div>

      {/* Tap to expand hint */}
      {onExpand && (
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          Tap to expand
        </div>
      )}
    </div>
  );
}