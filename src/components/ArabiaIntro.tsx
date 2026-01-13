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

    const handleEnded = () => onComplete();
    const handleError = () => setState('error');
    const handleCanPlay = () => {
      video
        .play()
        .then(() => setState('playing'))
        .catch(() => setState('blocked'));
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

    video.load();

    const watchdog = setTimeout(() => {
      if (state !== 'playing') {
        onComplete();
      }
    }, 5000);

    return () => {
      clearTimeout(watchdog);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onComplete, state]);

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
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated corner accents */}
      <motion.div
        className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-primary/30"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
      <motion.div
        className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-accent/30"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-accent/30"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-primary/30"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      />

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

      {/* Animated loading state */}
      <AnimatePresence>
        {state === 'loading' && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap to start overlay */}
      <AnimatePresence>
        {state === 'blocked' && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full border-2 border-primary/50 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  borderColor: ['hsl(var(--primary) / 0.5)', 'hsl(var(--accent) / 0.5)', 'hsl(var(--primary) / 0.5)'],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-12 border-l-primary ml-1"
                  style={{ borderLeftWidth: 12 }}
                />
              </motion.div>
              <p className="text-white/60 text-sm">Tap anywhere to start</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar at bottom */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </motion.div>

      {/* Enhanced skip button */}
      <motion.button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative px-6 py-2.5 rounded-full overflow-hidden">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          />
          
          {/* Glass effect */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full" />
          
          {/* Hover glow */}
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          />
          
          <span className="relative z-10 text-white/80 group-hover:text-white text-sm font-medium transition-colors">
            Skip
          </span>
        </div>
      </motion.button>

      {/* Floating particles effect */}
      {state === 'playing' && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                opacity: 0,
              }}
              animate={{ 
                y: -10,
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'linear',
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};
