import { useRef, useEffect } from 'react';

interface TransparentVideoLogoProps {
  src: string;
  className?: string;
  threshold?: number; // 0-255, pixels darker than this become transparent
}

export const TransparentVideoLogo = ({ 
  src, 
  className = '',
  threshold = 30 // Default: remove very dark pixels
}: TransparentVideoLogoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const processFrame = () => {
      if (video.paused || video.ended) {
        animationRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // Match canvas size to video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 300;
        canvas.height = video.videoHeight || 200;
      }

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Process each pixel - make dark pixels transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate brightness
        const brightness = (r + g + b) / 3;
        
        // If pixel is dark (close to black), make it transparent
        if (brightness < threshold) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        } else if (brightness < threshold * 2) {
          // Gradual fade for smoother edges
          data[i + 3] = Math.floor((brightness - threshold) / threshold * 255);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationRef.current = requestAnimationFrame(processFrame);
    };

    const handlePlay = () => {
      processFrame();
    };

    video.addEventListener('play', handlePlay);
    
    // Start processing if video is already playing
    if (!video.paused) {
      processFrame();
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [threshold]);

  return (
    <div className={`relative ${className}`}>
      {/* Hidden video source */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute opacity-0 pointer-events-none"
        crossOrigin="anonymous"
      />
      {/* Visible canvas with transparency */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
