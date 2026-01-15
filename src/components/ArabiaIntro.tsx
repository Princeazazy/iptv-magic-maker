import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import introVideo from '@/assets/arabia-intro.mp4';

interface ArabiaIntroProps {
  onComplete: () => void;
}

type IntroState = 'loading' | 'playing' | 'blocked' | 'error';

export const ArabiaIntro = ({ onComplete }: ArabiaIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<IntroState>('loading');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let stuckTimer: number | null = null;
    const clearStuckTimer = () => {
      if (stuckTimer) {
        clearTimeout(stuckTimer);
        stuckTimer = null;
      }
    };

    const hardTimeout = window.setTimeout(() => {
      // Absolute failsafe: never block app startup on the intro.
      onComplete();
    }, 12000);

    const handleEnded = () => onComplete();
    const handleError = () => {
      setState('error');
      // If the asset/codecs fail in a browser, move on.
      onComplete();
    };

    const tryPlay = () => {
      clearStuckTimer();
      video
        .play()
        .then(() => {
          setState('playing');
          // If the video doesn't advance, it's effectively "stuck" (common in some browsers/codecs).
          stuckTimer = window.setTimeout(() => {
            if (video.currentTime < 0.1) onComplete();
          }, 2500);
        })
        .catch(() => setState('blocked'));
    };

    const handleCanPlay = () => {
      // Attempt autoplay once the browser reports it can play.
      tryPlay();
    };

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);

    // Kick off load + best-effort autoplay.
    video.load();
    tryPlay();

    return () => {
      clearTimeout(hardTimeout);
      clearStuckTimer();
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onComplete]);

  const handleUserStart = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setState('playing');
    } catch {
      onComplete();
    }
  };

  const handleTap = () => {
    if (state === 'blocked' || state === 'loading') {
      handleUserStart();
    } else if (state === 'error') {
      onComplete();
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer overflow-hidden"
      onClick={handleTap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Simple corner accents - no animation */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-accent/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-accent/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-primary/30" />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted
        preload="auto"
        autoPlay
      >
        <source src={introVideo} type="video/mp4" />
      </video>

      {/* Loading state - simple spinner */}
      <AnimatePresence>
        {state === 'loading' && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap to start overlay - simplified */}
      <AnimatePresence>
        {state === 'blocked' && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full border-2 border-primary/50 flex items-center justify-center">
                <div
                  className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-[12px] border-l-primary ml-1"
                />
              </div>
              <p className="text-white/60 text-sm">Tap anywhere to start</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar at bottom - simple CSS transition */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Skip button - simple hover */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/80 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors duration-200"
      >
        Skip
      </button>
    </motion.div>
  );
};
