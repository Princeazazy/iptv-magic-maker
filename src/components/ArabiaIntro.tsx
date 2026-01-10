import { useRef, useEffect, useState } from 'react';
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

  const handleTap = () => {
    if (state === 'blocked') {
      handleUserStart();
    } else if (state === 'error') {
      onComplete();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onClick={handleTap}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="auto"
        autoPlay
      >
        <source src={introVideo} type="video/mp4" />
      </video>

    </div>
  );
};
