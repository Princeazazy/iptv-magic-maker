import { useRef, useEffect, useState } from 'react';
import introVideo from '@/assets/arabia-intro.mp4';

interface ArabiaIntroProps {
  onComplete: () => void;
}

export const ArabiaIntro = ({ onComplete }: ArabiaIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // Allow skipping after 2 seconds
    const timer = setTimeout(() => setCanSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      onComplete();
    };

    video.addEventListener('ended', handleEnded);
    
    // Try to autoplay
    video.play().catch(() => {
      // If autoplay fails (browser policy), skip intro
      onComplete();
    });

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (canSkip) {
      onComplete();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer"
      onClick={handleSkip}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        muted
        playsInline
        autoPlay
      >
        <source src={introVideo} type="video/mp4" />
      </video>

      {/* Skip hint */}
      <div 
        className={`absolute bottom-8 right-8 transition-opacity duration-500 ${
          canSkip ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button 
          onClick={handleSkip}
          className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white/80 rounded-full hover:bg-white/20 transition-colors text-sm font-medium"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
};
