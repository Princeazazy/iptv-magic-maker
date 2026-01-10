import { useState } from 'react';
import { Tv, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Channel } from '@/hooks/useIPTV';

// Safe fallback component that uses React's JSX escaping instead of innerHTML
const ChannelLogoWithFallback = ({ channel }: { channel: Channel }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Tv className="w-16 h-16 text-muted-foreground" />
        <span className="text-xs text-muted-foreground mt-2 text-center px-2">
          {channel.name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={channel.logo}
      alt={channel.name}
      className="w-full h-full object-contain"
      onError={() => setHasError(true)}
    />
  );
};

interface ChannelCardProps {
  channel: Channel;
  isPlaying: boolean;
  isFavorite: boolean;
  isFocused: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
}

export const ChannelCard = ({
  channel,
  isPlaying,
  isFavorite,
  isFocused,
  onPlay,
  onToggleFavorite,
}: ChannelCardProps) => {
  return (
    <Card
      className={`group relative overflow-hidden transition-all cursor-pointer ${
        isPlaying ? 'ring-4 ring-primary shadow-xl scale-105' : ''
      } ${
        isFocused ? 'ring-2 ring-accent' : ''
      }`}
      onClick={onPlay}
    >
      <div className="aspect-square w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative p-6">
        {channel.logo ? (
          <ChannelLogoWithFallback channel={channel} />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <Tv className="w-16 h-16 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mt-2 text-center">
              {channel.name}
            </span>
          </div>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
        </Button>
      </div>
      <div className="p-2 bg-card/80 backdrop-blur-sm absolute bottom-0 left-0 right-0">
        <h3 className="font-medium text-xs text-foreground truncate text-center">
          {channel.name}
        </h3>
      </div>
    </Card>
  );
};
