import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import introVideo from '@/assets/arabia-intro.mp4';

interface ArabiaIntroProps {
  onComplete: () => void;
}

export const ArabiaIntro = ({ onComplete }: ArabiaIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showTapPrompt, setShowTapPrompt] = useState(false);
  const hasTriedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Failsafe timeout - never block app startup
    const hardTimeout = window.setTimeout(() => {
      onComplete();
    }, 12000);

    const handleEnded = () => onComplete();
    const handleError = () => onComplete();

    const tryPlayWithSound = async () => {
      if (hasTriedRef.current) return;
      hasTriedRef.current = true;

      try {
        // Try unmuted first
        video.muted = false;
        await video.play();
        // Success! Video is playing with sound
      } catch {
        // Browser blocked unmuted autoplay - show tap prompt
        video.pause();
        video.currentTime = 0;
        setShowTapPrompt(true);
      }
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // Try to play with sound after a short delay
    const playTimer = setTimeout(tryPlayWithSound, 100);

    return () => {
      clearTimeout(hardTimeout);
      clearTimeout(playTimer);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onComplete]);

  const handleTap = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = false;
      video.currentTime = 0;
      await video.play();
      setShowTapPrompt(false);
    } catch {
      // Still blocked, just continue to app
      onComplete();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={showTapPrompt ? handleTap : undefined}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-accent/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-accent/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-primary/30" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="auto"
      >
        <source src={introVideo} type="video/mp4" />
      </video>

      {/* Tap to play overlay */}
      {showTapPrompt && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <motion.div
              className="w-20 h-20 rounded-full bg-primary/80 flex items-center justify-center mx-auto mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.div>
            <p className="text-white/80 text-lg font-medium">Tap to play with sound</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
