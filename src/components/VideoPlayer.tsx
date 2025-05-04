
import React, { useState } from 'react';
import { Loader2, Play, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  poster, 
  autoPlay = false,
  className,
  onError
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented, show play button
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className={cn("relative bg-black rounded-lg overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}
      
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto"
        playsInline
        controls={false}
        onLoadedData={handleLoadedData}
        onError={onError}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity flex items-center justify-center",
        isPlaying && !isLoading ? "opacity-0 hover:opacity-100" : "opacity-100"
      )}>
        <button
          onClick={handlePlayPause}
          className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-all"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <Play className={cn(
            "h-10 w-10 text-white",
            isPlaying ? "opacity-80" : "opacity-100"
          )} />
        </button>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-center bg-gradient-to-t from-black/70 to-transparent">
        <button
          onClick={handlePlayPause}
          className="text-white hover:text-white/80"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        
        <button
          onClick={toggleMute}
          className="text-white hover:text-white/80"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
