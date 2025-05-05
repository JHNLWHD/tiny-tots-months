
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Play, Volume2, VolumeX, AlertCircle } from 'lucide-react';
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
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("VideoPlayer mounted with source:", src);
  }, [src]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play()
          .catch(error => {
            console.error("Error playing video:", error);
            setHasError(true);
          });
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
    console.log("Video loaded successfully");
    setIsLoading(false);
    setHasError(false);
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch((error) => {
        // Autoplay was prevented
        console.error("Autoplay prevented:", error);
        setIsPlaying(false);
      });
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error occurred:", e);
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  return (
    <div className={cn("relative bg-black rounded-lg overflow-hidden", className)}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <p className="text-white text-center">Failed to load video. Please try again.</p>
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
        onError={handleVideoError}
        onEnded={() => setIsPlaying(false)}
      />
      
      {!hasError && (
        <>
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
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
