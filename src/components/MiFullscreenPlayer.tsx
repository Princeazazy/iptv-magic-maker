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
  ChevronDown,
  Subtitles,
  RectangleHorizontal,
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
        {/* Top Left - Channel Logo & Info */}
        <div className="absolute top-6 left-6 flex items-start gap-4">
          <div className="w-20 h-16 bg-black/50 rounded-lg flex items-center justify-center p-2">
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
              <span className="text-white font-bold text-lg">{channel.name.charAt(0)}</span>
            )}
          </div>
        </div>

        {/* Top Right - Time & Weather */}
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <span className="text-white font-medium text-lg">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-1 text-white/80">
            <Cloud className="w-5 h-5" />
            <span>24°</span>
          </div>
        </div>

        {/* Left Side - Channel Info */}
        <div className="absolute bottom-32 left-6">
          {/* Favorite Star */}
          <button onClick={onToggleFavorite} className="mb-4">
            <Star
              className={`w-8 h-8 ${
                isFavorite ? 'fill-primary text-primary' : 'text-white/50'
              }`}
            />
          </button>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded">
              Live
            </span>
            <span className="px-3 py-1 bg-white/20 text-white text-sm font-semibold rounded">
              EPG
            </span>
          </div>

          {/* Program Title */}
          <h1 className="text-white text-3xl font-bold mb-1">{channel.name}</h1>
          <p className="text-white/60">{channel.group || 'Live TV'}</p>

          {/* Elapsed Time */}
          <p className="text-white text-2xl font-light mt-4">{currentTime}</p>
        </div>

        {/* Bottom Center - Playback Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious?.();
            }}
            className="p-3 rounded-full hover:bg-white/10 transition-colors"
          >
            <SkipBack className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
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
            <SkipForward className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Bottom Right - Additional Controls */}
        <div className="absolute bottom-8 right-6 flex items-center gap-3">
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

          <button className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <span className="text-white text-xs font-bold">4K</span>
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
              <div className="absolute bottom-14 right-0 bg-card rounded-xl overflow-hidden shadow-xl min-w-[120px]">
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

          <button className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <Subtitles className="w-6 h-6 text-white" />
          </button>

          <button className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <span className="text-white text-xs font-bold">1x</span>
          </button>
        </div>

        {/* Bottom Center - Collapse Arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-white/50 hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
};
