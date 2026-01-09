import { Star, Play } from 'lucide-react';
import { Channel } from '@/hooks/useIPTV';

interface MiChannelCardProps {
  channel: Channel;
  isPlaying: boolean;
  isFavorite: boolean;
  isFocused: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
}

export const MiChannelCard = ({
  channel,
  isPlaying,
  isFavorite,
  isFocused,
  onPlay,
  onToggleFavorite,
}: MiChannelCardProps) => {
  return (
    <div
      className={`group relative bg-card rounded-xl overflow-hidden cursor-pointer mi-card-hover ${
        isPlaying ? 'ring-2 ring-primary mi-glow' : ''
      } ${
        isFocused ? 'ring-2 ring-primary/50' : ''
      }`}
      onClick={onPlay}
    >
      {/* Channel Logo/Image */}
      <div className="aspect-video w-full bg-muted flex items-center justify-center relative overflow-hidden">
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
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-muted to-secondary">
            <span className="text-2xl font-bold text-muted-foreground">
              {channel.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
          </div>
        </div>

        {/* HD Badge */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
            HD
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <Star
            className={`w-4 h-4 ${
              isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Channel Info */}
      <div className="p-3">
        <h3 className="font-medium text-foreground text-sm truncate">
          {channel.name}
        </h3>
        {channel.group && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {channel.group}
          </p>
        )}
      </div>
    </div>
  );
};
