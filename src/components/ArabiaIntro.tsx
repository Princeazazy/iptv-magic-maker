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
      // Video is playing, update handled internally
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
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
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
        preload="auto"
        autoPlay
        muted
      >
        <source src={introVideo} type="video/mp4" />
      </video>
    </motion.div>
  );
};
