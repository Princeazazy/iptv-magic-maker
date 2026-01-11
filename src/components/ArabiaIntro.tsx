import { useRef, useEffect, useState } from 'react';
import introVideo from '@/assets/arabia-intro.mp4';
import arabiaLogo from '@/assets/arabia-logo-new.png';

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

    const handleEnded = () => onComplete();
    const handleError = () => setState('error');
    const handleCanPlay = () => {
      // Try to play once video is ready
      video
        .play()
        .then(() => setState('playing'))
        .catch(() => setState('blocked'));
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    // Load video
    video.load();

    // Safety: if still stuck for too long, skip intro
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
    };
  }, [onComplete, state]);

  const handleUserStart = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setState('playing');
    } catch {
      // If still can't play, just skip the intro
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
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer"
      onClick={handleTap}
    >
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

      {/* Overlay for blocked/loading states */}
      {(state === 'blocked' || state === 'loading') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <img 
            src={arabiaLogo} 
            alt="Arabia" 
            className="h-24 w-auto mb-8 animate-pulse" 
          />
          <p className="text-white/80 text-lg font-medium mb-2">
            {state === 'loading' ? 'Loading...' : 'Tap anywhere to start'}
          </p>
          <p className="text-white/50 text-sm">
            Welcome to Mi Player Pro
          </p>
        </div>
      )}

      {/* Skip button - always visible */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-full text-sm font-medium transition-all backdrop-blur-sm border border-white/10"
      >
        Skip
      </button>
    </div>
  );
};
