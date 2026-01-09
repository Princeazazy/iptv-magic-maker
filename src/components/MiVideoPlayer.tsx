import { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Settings,
  X
} from 'lucide-react';
import { Channel } from '@/hooks/useIPTV';

interface MiVideoPlayerProps {
  channel: Channel;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const MiVideoPlayer = ({ 
  channel, 
  onClose,
  onNext,
  onPrevious 
}: MiVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState('00:00:00');

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [channel.url]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
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

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
      >
        <source src={channel.url} type="application/x-mpegURL" />
        <source src={channel.url} type="video/mp4" />
      </video>

      {/* Overlay Controls */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
                HD
              </span>
              <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-bold rounded">
                LIVE
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Channel Info */}
        <div className="absolute bottom-20 left-4">
          <h2 className="text-white text-2xl font-bold">{channel.name}</h2>
          {channel.group && (
            <p className="text-white/60 text-sm">{channel.group}</p>
          )}
          <p className="text-white/40 text-sm mt-1">{currentTime}</p>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Volume */}
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Center Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={onPrevious}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <SkipBack className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={togglePlay}
                className="p-3 rounded-full bg-primary hover:bg-primary/80 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-primary-foreground" />
                ) : (
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                )}
              </button>
              <button
                onClick={onNext}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <SkipForward className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <Settings className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <Maximize className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
