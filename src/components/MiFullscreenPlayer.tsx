import { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Star,
  Cloud,
  ChevronUp,
  Subtitles,
  RectangleHorizontal,
  Settings,
} from 'lucide-react';
import { Channel } from '@/hooks/useIPTV';

interface MiFullscreenPlayerProps {
  channel: Channel;
  isFavorite: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onToggleFavorite: () => void;
}

export const MiFullscreenPlayer = ({
  channel,
  isFavorite,
  onClose,
  onNext,
  onPrevious,
  onToggleFavorite,
}: MiFullscreenPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [time, setTime] = useState(new Date());
  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'fill' | 'default' | '16:9'>('default');

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
      timeout = setTimeout(() => {
        setShowControls(false);
        setShowAspectMenu(false);
      }, 4000);
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    handleMouseMove();

    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}:${secs}`);
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

  const getVideoStyle = () => {
    switch (aspectRatio) {
      case 'fill':
        return 'object-cover';
      case '16:9':
        return 'object-contain aspect-video';
      default:
        return 'object-contain';
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black cursor-pointer"
      onClick={() => setShowControls(true)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className={`w-full h-full ${getVideoStyle()}`}
        autoPlay
        playsInline
      >
        <source src={channel.url} type="application/x-mpegURL" />
        <source src={channel.url} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Center - Collapse Arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 left-1/2 -translate-x-1/2 p-2"
        >
          <ChevronUp className="w-8 h-8 text-white/60 hover:text-white transition-colors" />
        </button>

        {/* Bottom Left - Time */}
        <div className="absolute bottom-6 left-6 flex items-center gap-4">
          <span className="text-white font-medium text-lg">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-2 text-white/80">
            <Cloud className="w-5 h-5" />
            <span>24°</span>
          </div>
        </div>

        {/* Top Right - Channel Info */}
        <div className="absolute top-6 right-6 text-right">
          <p className="text-white/60 text-lg">{currentTime}</p>
          <p className="text-white/80 text-sm mt-1">{channel.group || 'Live TV'}</p>
          <h1 className="text-white text-2xl font-bold">{channel.name}</h1>
          
          {/* Badges */}
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded">
              Live
            </span>
            <span className="px-3 py-1 bg-white/20 text-white text-sm font-semibold rounded">
              EPG
            </span>
          </div>

          {/* Favorite Star */}
          <button onClick={onToggleFavorite} className="mt-4">
            <Star
              className={`w-7 h-7 ${
                isFavorite ? 'fill-accent text-accent' : 'text-white/60 hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Bottom Right - Channel Logo */}
        <div className="absolute bottom-6 right-6">
          <div className="w-20 h-16 rounded-lg flex items-center justify-center overflow-hidden">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-lg border-2 border-accent flex items-center justify-center">
                <span className="text-accent font-bold text-xl">{channel.name.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Left - Controls */}
        <div className="absolute top-6 left-6 flex items-center gap-3">
          <button className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <span className="text-white text-sm font-bold">1x</span>
          </button>
          <button className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <Subtitles className="w-6 h-6 text-white" />
          </button>
          <button className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <Settings className="w-6 h-6 text-white" />
          </button>
          <button className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <span className="text-white text-sm font-bold">4K</span>
          </button>
          
          {/* Aspect Ratio */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAspectMenu(!showAspectMenu);
              }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                showAspectMenu ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <RectangleHorizontal className="w-6 h-6 text-white" />
            </button>

            {/* Aspect Ratio Menu */}
            {showAspectMenu && (
              <div className="absolute top-14 left-0 bg-card rounded-xl overflow-hidden shadow-xl min-w-[120px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAspectRatio('fill');
                    setShowAspectMenu(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors ${
                    aspectRatio === 'fill' ? 'text-foreground bg-muted' : 'text-muted-foreground'
                  }`}
                >
                  Fill
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAspectRatio('default');
                    setShowAspectMenu(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors ${
                    aspectRatio === 'default' ? 'text-foreground bg-muted' : 'text-muted-foreground'
                  }`}
                >
                  Default
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAspectRatio('16:9');
                    setShowAspectMenu(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors ${
                    aspectRatio === '16:9' ? 'text-foreground bg-muted' : 'text-muted-foreground'
                  }`}
                >
                  16:9
                </button>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Center - Playback Controls */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious?.();
            }}
            className="p-3 rounded-full hover:bg-white/10 transition-colors"
          >
            <SkipBack className="w-10 h-10 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-20 h-20 rounded-full bg-white/30 hover:bg-white/40 transition-colors flex items-center justify-center backdrop-blur-sm"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white" />
            ) : (
              <Play className="w-10 h-10 text-white ml-1" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
            className="p-3 rounded-full hover:bg-white/10 transition-colors"
          >
            <SkipForward className="w-10 h-10 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
