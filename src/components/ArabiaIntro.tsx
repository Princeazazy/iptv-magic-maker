import { useRef, useEffect, useMemo, useState } from 'react';
import introVideo from '@/assets/arabia-intro.mp4';

interface ArabiaIntroProps {
  onComplete: () => void;
}

type IntroState = 'loading' | 'playing' | 'blocked' | 'error';

export const ArabiaIntro = ({ onComplete }: ArabiaIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canSkip, setCanSkip] = useState(false);
  const [state, setState] = useState<IntroState>('loading');

  const skipLabel = useMemo(() => (canSkip ? 'Skip Intro' : 'Please wait…'), [canSkip]);

  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => onComplete();
    const handleError = () => setState('error');

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // Kick off loading + try autoplay right away (muted + playsInline)
    // Some browsers won't buffer until play() is attempted.
    video.load();
    video
      .play()
      .then(() => setState('playing'))
      .catch(() => setState('blocked'));

    // Safety: if still stuck on loading/blocked for too long, allow continuing
    const watchdog = setTimeout(() => {
      setState((prev) => (prev === 'playing' ? prev : 'error'));
    }, 12000);

    return () => {
      clearTimeout(watchdog);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (canSkip) onComplete();
  };

  const handleUserStart = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setState('playing');
    } catch {
      setState('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onClick={state === 'blocked' ? handleUserStart : handleSkip}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        muted
        playsInline
        preload="auto"
        autoPlay
      >
        <source src={introVideo} type="video/mp4" />
      </video>

      {(state === 'loading' || state === 'blocked' || state === 'error') && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white/80 text-sm">
            {state === 'loading' && 'Loading intro…'}
            {state === 'blocked' && 'Tap to play intro'}
            {state === 'error' && 'Intro unavailable — tap Continue'}
          </div>
        </div>
      )}

      <div
        className={`absolute bottom-8 right-8 transition-opacity duration-500 ${
          canSkip ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className={`px-6 py-3 bg-white/10 backdrop-blur-sm text-white/80 rounded-full hover:bg-white/20 transition-colors text-sm font-medium ${
            canSkip ? '' : 'pointer-events-none'
          }`}
        >
          {skipLabel}
        </button>
      </div>

      {state === 'error' && (
        <div className="absolute bottom-8 left-8">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors text-sm font-semibold"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};
