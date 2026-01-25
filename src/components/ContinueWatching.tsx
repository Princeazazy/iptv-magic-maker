import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { WatchProgress, getRecentWatchProgress, removeWatchProgress } from '@/hooks/useWatchProgress';

interface ContinueWatchingProps {
  onSelect: (channelId: string) => void;
  onRemove?: (channelId: string) => void;
  compact?: boolean;
}

export const ContinueWatching = ({ onSelect, onRemove, compact = false }: ContinueWatchingProps) => {
  const recentItems = getRecentWatchProgress(8);

  if (recentItems.length === 0) return null;

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const getProgressPercentage = (item: WatchProgress) => {
    if (!item.duration || item.duration === 0) return 0;
    return Math.min((item.position / item.duration) * 100, 100);
  };

  const handleRemove = (e: React.MouseEvent, channelId: string) => {
    e.stopPropagation();
    removeWatchProgress(channelId);
    onRemove?.(channelId);
  };

  // Compact mode shows vertical list, normal shows horizontal scroll
  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Continue Watching</h3>
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[200px] mi-scrollbar">
          {recentItems.slice(0, 4).map((item, index) => (
            <motion.button
              key={item.channelId}
              onClick={() => onSelect(item.channelId)}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-2 rounded-lg bg-card/60 hover:bg-card transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative w-14 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={item.channelName}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <span className="text-xs font-bold text-muted-foreground">
                      {item.channelName.charAt(0)}
                    </span>
                  </div>
                )}
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/50">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${getProgressPercentage(item)}%` }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {item.channelName}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDuration(item.position)} left
                </p>
              </div>

              {/* Play icon */}
              <Play className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Continue Watching</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 mi-scrollbar">
        {recentItems.map((item, index) => (
          <motion.button
            key={item.channelId}
            onClick={() => onSelect(item.channelId)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0 w-48 group relative"
          >
            {/* Poster/Logo */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border/30 mb-2">
              {item.logo ? (
                <img
                  src={item.logo}
                  alt={item.channelName}
                  className="w-full h-full object-contain p-4 bg-muted"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-3xl font-bold text-muted-foreground">
                    {item.channelName.charAt(0)}
                  </span>
                </div>
              )}

              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => handleRemove(e, item.channelId)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X className="w-3 h-3 text-white" />
              </button>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${getProgressPercentage(item)}%` }}
                />
              </div>
            </div>

            {/* Title & Time */}
            <div className="text-left">
              <h3 className="text-foreground font-medium text-sm truncate group-hover:text-primary transition-colors">
                {item.channelName}
              </h3>
              <p className="text-muted-foreground text-xs">
                {formatDuration(item.position)} / {formatDuration(item.duration)}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
