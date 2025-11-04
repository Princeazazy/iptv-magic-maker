import { Card } from '@/components/ui/card';
import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  url: string;
  title: string;
}

export const VideoPlayer = ({ url, title }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked
      });
    }
  }, [url]);

  return (
    <Card className="overflow-hidden border-border bg-card">
      <div className="aspect-video w-full bg-black">
        <video
          ref={videoRef}
          controls
          className="w-full h-full"
          controlsList="nodownload"
        >
          <source src={url} type="application/x-mpegURL" />
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
    </Card>
  );
};
