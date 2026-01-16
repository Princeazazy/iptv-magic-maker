import { useRef, useEffect, useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Star,
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  CloudLightning,
  ChevronDown,
  Subtitles,
  Settings,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/hooks/useIPTV';
import { useWeather } from '@/hooks/useWeather';

const WeatherIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'sun': return <Sun className="w-5 h-5" />;
    case 'rain': return <CloudRain className="w-5 h-5" />;
    case 'snow': return <Snowflake className="w-5 h-5" />;
    case 'storm': return <CloudLightning className="w-5 h-5" />;
    default: return <Cloud className="w-5 h-5" />;
  }
};

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
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  // Autoplay is typically blocked on the web unless the media is muted.
  const [isMuted, setIsMuted] = useState(() => !Capacitor.isNativePlatform());
  const [volume, setVolume] = useState(70);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [time, setTime] = useState(new Date());
  const weather = useWeather();
  const [error, setError] = useState<string | null>(null);

  const functionConfig = useMemo(() => {
    // Avoid import.meta.env usage; reuse values from the already-configured client.
    const supabaseUrl = (supabase as any).supabaseUrl as string | undefined;

    const functionsBase = supabaseUrl ? new URL('functions/v1/', supabaseUrl).toString() : '';
    const streamProxyUrl = functionsBase ? new URL('stream-proxy', functionsBase).toString() : '';

    return { streamProxyUrl };
  }, []);

  const getPlayableUrl = (rawUrl: string) => {
    const isNative = Capacitor.isNativePlatform();
    if (isNative) return rawUrl;

    // Web apps (HTTPS) cannot load http:// media directly (mixed content).
    // So even for "local" playlists, if the stream is http:// we must proxy it to https://.
    if (channel.isLocal) {
      if (rawUrl.startsWith('https://')) {
        console.log('Playing local channel directly (https)');
        return rawUrl;
      }
      // http:// local stream: try proxy to avoid mixed-content blocking
      if (functionConfig.streamProxyUrl) {
        console.log('Local channel is http://, using secure proxy for playback');
        return `${functionConfig.streamProxyUrl}?url=${encodeURIComponent(rawUrl)}`;
      }
      return rawUrl;
    }

    if (!functionConfig.streamProxyUrl) return rawUrl;

    // Web preview runs on https; most IPTV providers give http streams.
    return rawUrl.startsWith('http://')
      ? `${functionConfig.streamProxyUrl}?url=${encodeURIComponent(rawUrl)}`
      : rawUrl;
  };

  // HLS.js initialization for streaming
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel.url) return;

    setError(null);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const originalUrl = channel.url;

    // IMPORTANT (Web): Many Xtream "live/*.ts" URLs are MPEG-TS and are NOT natively playable in browsers.
    // If we detect that pattern, try an HLS variant first (same URL but .m3u8), then fall back.
    const isNative = Capacitor.isNativePlatform();
    const derivedHlsUrl = !isNative && /\/live\/.+\.ts(\?.*)?$/i.test(originalUrl)
      ? originalUrl.replace(/\.ts(\?.*)?$/i, '.m3u8$1')
      : null;

    const primaryUrl = derivedHlsUrl ?? originalUrl;
    const fallbackUrl = derivedHlsUrl ? originalUrl : null;

    const attemptPlayback = (sourceUrl: string, onFail?: () => void) => {
      // Clean up any previous HLS instance between attempts
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const playableUrl = getPlayableUrl(sourceUrl);
      const isHls = sourceUrl.includes('.m3u8');
      const isTs = sourceUrl.toLowerCase().endsWith('.ts');

      // Make sure volume/mute is applied
      video.muted = isMuted;
      video.volume = volume / 100;

      // Clear any previous src to force a clean load
      video.removeAttribute('src');
      video.load();

      // Temporary error handler for this attempt
      const onVideoErrorOnce = () => {
        video.removeEventListener('error', onVideoErrorOnce);
        onFail?.();
      };
      video.addEventListener('error', onVideoErrorOnce, { once: true });

      if (isHls && Hls.isSupported()) {
        console.log('Using HLS.js for:', playableUrl);

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(playableUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed, starting playback');
          video.play().catch((e) => {
            console.error('Playback failed:', e);
            setIsPlaying(false);
            if (e?.name === 'NotAllowedError') {
              setError('Autoplay was blocked — tap Play to start.');
            } else {
              onFail?.();
            }
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.error('HLS error:', data);

          const code = data?.response?.code as number | undefined;
          if (code === 401 || code === 403 || code === 502) {
            setIsPlaying(false);
            hls.stopLoad();
            setError(
              code === 502
                ? 'This stream was rejected by the provider (upstream blocked web playback).'
                : 'This stream is blocked or requires authentication (provider blocks web playback).'
            );
            return;
          }

          // Non-fatal stalls can happen when segments stop downloading.
          // Try to resume loading instead of letting the stream freeze.
          if (!data.fatal) {
            if (data.details === 'bufferStalledError') {
              console.log('HLS buffer stalled; attempting to resume loading');
              try {
                hls.startLoad();
              } catch {
                // ignore
              }
            }
            return;
          }

          // Fatal errors
          let msg = `Playback error: ${data.type}${code ? ` (HTTP ${code})` : ''}`;
          if (code === 401 || code === 403) {
            msg += ' — stream is blocked or requires authentication.';
          }
          if (code === 502) {
            msg += ' — upstream rejected the request.';
          }
          setError(msg);

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }

          onFail?.();
        });

        hlsRef.current = hls;
        return;
      }

      // Safari (and some WebViews) support HLS natively without HLS.js
      if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('Using native HLS for:', playableUrl);
        video.src = playableUrl;
        video.play().catch((e) => {
          console.error('Native HLS playback failed:', e);
          setIsPlaying(false);
          if (e?.name === 'NotAllowedError') {
            setError('Autoplay was blocked — tap Play to start.');
          } else {
            onFail?.();
            if (!onFail) setError('Stream failed to load.');
          }
        });
        return;
      }

      // Direct TS (or other) playback
      if (isTs) {
        console.log('Using direct TS playback for:', playableUrl);
      } else {
        console.log('Using direct playback for:', playableUrl);
      }

      video.src = playableUrl;
      video.play().catch((e) => {
        console.error('Playback failed:', e);
        setIsPlaying(false);
        if (e?.name === 'NotAllowedError') {
          setError('Autoplay was blocked — tap Play to start.');
        } else {
          onFail?.();
          if (!onFail) setError('Stream failed to load. The provider may be blocking web access.');
        }
      });
    };

    // Try HLS variant first (web), then fallback to original URL.
    if (fallbackUrl) {
      attemptPlayback(primaryUrl, () => attemptPlayback(fallbackUrl));
    } else {
      attemptPlayback(primaryUrl);
    }

    // If nothing starts within a few seconds, surface a clear message.
    const startupTimeout = window.setTimeout(() => {
      const v = videoRef.current;
      if (!v) return;
      if (v.readyState < 2 && v.paused && !error) {
        setError('Stream did not start. Tap Play, or try another channel.');
      }
    }, 8000);

    return () => {
      window.clearTimeout(startupTimeout);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.url, functionConfig.streamProxyUrl, isMuted, volume]);

  // Keep UI state in sync with the underlying <video> element and capture user interaction.
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video) return;

    const onPlaying = () => {
      setIsPlaying(true);
      setError(null);
    };
    const onPause = () => setIsPlaying(false);
    const onPointerDown = () => setHasUserInteracted(true);
    const onVideoError = () => {
      const mediaError = video.error;
      if (mediaError) {
        setError(`Playback error (media): ${mediaError.code}`);
      } else {
        setError('Playback error');
      }
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);
    video.addEventListener('error', onVideoError);
    container?.addEventListener('pointerdown', onPointerDown);

    return () => {
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('error', onVideoError);
      container?.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  // Once the user interacts, try to start playback again (helps with autoplay restrictions).
  useEffect(() => {
    if (!hasUserInteracted) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {
        // ignore; error will be surfaced elsewhere
      });
    }
  }, [hasUserInteracted]);

  // Update playback time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      const time = video.currentTime;
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = Math.floor(time % 60);
      setCurrentTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    video.addEventListener('timeupdate', updateTime);
    return () => video.removeEventListener('timeupdate', updateTime);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowControls(false);
        setShowVolumeSlider(false);
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
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    video.play()
      .then(() => {
        setIsPlaying(true);
        setError(null);
      })
      .catch((e) => {
        console.error('Playback failed:', e);
        setIsPlaying(false);
        if (e?.name === 'NotAllowedError') {
          setError('Autoplay was blocked — tap Play to start.');
        } else {
          setError('Playback failed.');
        }
      });
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      setIsMuted(newVolume === 0);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={() => {
        const v = videoRef.current;
        if (v && v.paused) {
          v.play().catch(() => {
            // ignore; error state will be shown if it fails
          });
        }
      }}
      className="fixed inset-0 z-50 bg-black cursor-pointer"
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        muted={isMuted}
        crossOrigin="anonymous"
      />

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center max-w-md px-6">
            <p className="text-white text-lg mb-3">{error}</p>
            <p className="text-white/60 text-sm mb-5">
              If this channel works in mobile apps but not here, your provider is likely blocking web/proxy playback.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Left - Channel Logo */}
        <div className="absolute top-6 left-6">
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
              <div className="w-16 h-14 rounded-lg border-2 border-accent flex items-center justify-center">
                <span className="text-accent font-bold text-xl">{channel.name.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Right - Time & Weather */}
        <div className="absolute top-6 right-6 text-right">
          <div className="flex items-center justify-end gap-3 text-white/80">
            <span className="text-lg font-medium">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-1">
              <WeatherIcon icon={weather.icon} />
              <span>{weather.displayTemp}</span>
            </div>
          </div>
        </div>

        {/* Bottom Left - Channel Info */}
        <div className="absolute bottom-6 left-6">
          {/* Favorite Star */}
          <button onClick={onToggleFavorite} className="mb-3">
            <Star
              className={`w-6 h-6 ${
                isFavorite ? 'mi-star-filled' : 'text-white/60 hover:text-white'
              }`}
            />
          </button>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded">
              Live
            </span>
            <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded">
              EPG
            </span>
          </div>

          {/* Title */}
          <h1 className="text-white text-2xl font-bold">{channel.name}</h1>
          <p className="text-white/70">{channel.group || 'Live TV'}</p>

          {/* Time */}
          <p className="text-white/60 text-2xl font-light mt-4">{currentTime}</p>
        </div>

        {/* Bottom Center - Playback Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious?.();
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <SkipBack className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center backdrop-blur-sm"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <SkipForward className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Bottom Right - Additional Controls */}
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          {/* Volume Control with Slider */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVolumeSlider(!showVolumeSlider);
              }}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="mi-player-control"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Volume Slider */}
            {showVolumeSlider && (
              <div 
                className="absolute bottom-16 left-1/2 -translate-x-1/2 w-12 h-36 bg-card/90 backdrop-blur-sm rounded-full p-3 flex flex-col items-center"
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Volume2 className="w-4 h-4 text-white/80 mb-2" />
                <div className="flex-1 w-1 bg-muted rounded-full relative">
                  <div 
                    className="absolute bottom-0 w-full bg-primary rounded-full"
                    style={{ height: `${volume}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />
                </div>
                <VolumeX className="w-4 h-4 text-white/60 mt-2" />
              </div>
            )}
          </div>

          <button className="mi-player-control">
            <span className="text-white text-sm font-bold">4K</span>
          </button>

          <button className="mi-player-control">
            <Settings className="w-5 h-5 text-white" />
          </button>

          <button className="mi-player-control">
            <Subtitles className="w-5 h-5 text-white" />
          </button>

          <button className="mi-player-control">
            <span className="text-white text-sm font-bold">1x</span>
          </button>
        </div>

        {/* Bottom Center - Back/Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 p-3 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronDown className="w-10 h-10 text-white/60 hover:text-white transition-colors" />
        </button>

        {/* Top Left - Back Button (more visible) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-6 left-28 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <ChevronDown className="w-5 h-5 text-white rotate-90" />
          <span className="text-white font-medium">Back</span>
        </button>
      </div>
    </div>
  );
};
