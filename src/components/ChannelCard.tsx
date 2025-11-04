import { Play, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Channel } from '@/hooks/useIPTV';

interface ChannelCardProps {
  channel: Channel;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
}

export const ChannelCard = ({
  channel,
  isPlaying,
  isFavorite,
  onPlay,
  onToggleFavorite,
}: ChannelCardProps) => {
  return (
    <Card
      className={`group relative overflow-hidden transition-all hover:scale-105 cursor-pointer ${
        isPlaying ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onPlay}
    >
      <div className="aspect-video w-full bg-muted flex items-center justify-center relative">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <Play className="w-12 h-12 text-muted-foreground" />
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-16 h-16 text-white" />
        </div>
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
            className={`w-5 h-5 ${isFavorite ? 'fill-accent text-accent' : 'text-white'}`}
          />
        </Button>
      </div>
      <div className="p-3 bg-card">
        <h3 className="font-medium text-sm text-foreground truncate">
          {channel.name}
        </h3>
        {channel.group && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {channel.group}
          </p>
        )}
      </div>
    </Card>
  );
};
