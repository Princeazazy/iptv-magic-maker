import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackgroundMusicProps {
  src: string;
  autoPlay?: boolean;
  defaultVolume?: number;
}

export const BackgroundMusic = ({ 
  src, 
  autoPlay = true, 
  defaultVolume = 0.3 
}: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.loop = true;

    // Handle autoPlay changes - pause when content is playing, resume when it stops
    if (!autoPlay && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else if (autoPlay && hasInteracted && !isPlaying) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, [autoPlay, volume, hasInteracted, isPlaying]);

  // Listen for first user interaction on the page
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      if (audioRef.current && autoPlay) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    };

    // Add listeners for first interaction
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [autoPlay]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        setHasInteracted(true);
      }).catch(() => {});
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) {
        audioRef.current.muted = false;
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} preload="auto" />
      
      {/* Floating music control button */}
      <div 
        className="fixed bottom-6 left-6 z-50"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.9 }}
              className="absolute bottom-full left-0 mb-3 bg-card/90 backdrop-blur-md rounded-xl p-4 border border-border/30 shadow-xl min-w-[180px]"
            >
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-1.5 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {isPlaying ? 'Playing' : 'Paused'} • {Math.round(volume * 100)}%
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isPlaying 
              ? 'bg-primary/90 text-primary-foreground' 
              : 'bg-card/90 text-muted-foreground border border-border/30'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={isPlaying ? { 
            boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.4)', '0 0 0 8px hsl(var(--primary) / 0)', '0 0 0 0 hsl(var(--primary) / 0.4)']
          } : {}}
          transition={isPlaying ? { 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
        >
          <Music className="w-5 h-5" />
        </motion.button>
        
        {/* Hint text for first-time users */}
        {!hasInteracted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute left-full ml-3 whitespace-nowrap text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded"
          >
            Click to play music
          </motion.p>
        )}
      </div>
    </>
  );
};
