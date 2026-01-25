import { motion } from 'framer-motion';
import { Play, Clock, Tv, Film, Clapperboard, ArrowLeft, Trophy } from 'lucide-react';
import { WatchProgress, getRecentByType } from '@/hooks/useWatchProgress';

interface MiCatchUpPageProps {
  onSelect: (item: WatchProgress) => void;
  onBack: () => void;
}

export const MiCatchUpPage = ({ onSelect, onBack }: MiCatchUpPageProps) => {
  const liveChannels = getRecentByType('live', 5);
  const movies = getRecentByType('movie', 5);
  const series = getRecentByType('series', 5);
  const sports = getRecentByType('sports', 5);

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

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  const Section = ({ 
    title, 
    icon: Icon, 
    items, 
    showProgress = false 
  }: { 
    title: string; 
    icon: typeof Tv; 
    items: WatchProgress[];
    showProgress?: boolean;
  }) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Icon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item, index) => (
            <motion.button
              key={item.channelId}
              onClick={() => onSelect(item)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative rounded-xl overflow-hidden bg-card border border-border/30 hover:border-primary/50 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video">
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={item.channelName}
                    className="w-full h-full object-contain p-4 bg-muted"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
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

                {/* Progress bar for VOD */}
                {showProgress && item.duration > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${getProgressPercentage(item)}%` }}
                    />
                  </div>
                )}

                {/* Time ago badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white/80">
                  {formatTimeAgo(item.timestamp)}
                </div>
              </div>

              {/* Info */}
              <div className="p-3 text-left">
                <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {item.channelName}
                </h3>
                {showProgress && item.duration > 0 ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(item.duration - item.position)} left
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.group || 'Live TV'}
                  </p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  const isEmpty = liveChannels.length === 0 && movies.length === 0 && series.length === 0 && sports.length === 0;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-card hover:bg-card/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catch Up</h1>
          <p className="text-sm text-muted-foreground">Resume where you left off</p>
        </div>
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Clock className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Watch History Yet</h2>
          <p className="text-muted-foreground max-w-md">
            Start watching Live TV, Movies, Series, or Sports and they'll appear here for quick access.
          </p>
        </motion.div>
      ) : (
        <>
          <Section title="Recent Live TV" icon={Tv} items={liveChannels} />
          <Section title="Continue Movies" icon={Film} items={movies} showProgress />
          <Section title="Continue Series" icon={Clapperboard} items={series} showProgress />
          <Section title="Recent Sports" icon={Trophy} items={sports} />
        </>
      )}
    </div>
  );
};
