import { Tv, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Channel } from '@/hooks/useIPTV';

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
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="flex flex-col items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg><span class="text-xs text-muted-foreground mt-2 text-center px-2">${channel.name}</span></div>`;
              }
            }}
          />
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
