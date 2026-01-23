import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tv, Film, Clapperboard, Trophy, User, RefreshCw, Clock, LogOut, Search, Settings, Mic, Cloud, Sun, CloudRain, Snowflake, CloudLightning } from 'lucide-react';
import arabiaLogo from '@/assets/arabia-logo-new.png';
import { useWeather } from '@/hooks/useWeather';
import { useIsMobile } from '@/hooks/use-mobile';
import { ContinueWatching } from './ContinueWatching';

const WeatherIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'sun': return <Sun className="w-5 h-5" />;
    case 'rain': return <CloudRain className="w-5 h-5" />;
    case 'snow': return <Snowflake className="w-5 h-5" />;
    case 'storm': return <CloudLightning className="w-5 h-5" />;
    default: return <Cloud className="w-5 h-5" />;
  }
};

interface MiHomeScreenProps {
  channelCount: number;
  movieCount: number;
  seriesCount: number;
  sportsCount: number;
  loading?: boolean;
  onNavigate: (section: 'live' | 'movies' | 'series' | 'sports' | 'settings') => void;
  onReload?: () => void;
  onCatchUp?: () => void;
  onSearchClick?: () => void;
  onVoiceSearchClick?: () => void;
  onContinueWatchingSelect?: (channelId: string) => void;
}

// Mi Player Pro style tile card
const TileCard = ({
  children,
  onClick,
  className = '',
  size = 'normal',
  delay = 0,
  bgImage,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'large' | 'normal' | 'small';
  delay?: number;
  bgImage?: string;
}) => {
  const sizeClasses = {
    large: 'col-span-1 row-span-2',
    normal: 'col-span-1 row-span-1',
    small: 'col-span-1 row-span-1',
  };

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${sizeClasses[size]} relative rounded-2xl overflow-hidden transition-all duration-300 group ${className}`}
      style={{
        background: bgImage 
          ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${bgImage}) center/cover`
          : 'linear-gradient(145deg, hsl(260 30% 18%) 0%, hsl(260 30% 12%) 100%)',
      }}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col p-5 text-left">
        {children}
      </div>
    </motion.button>
  );
};

// Action button for right panel
const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  spinning,
}: {
  icon: typeof User;
  label: string;
  onClick?: () => void;
  spinning?: boolean;
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02, x: 4 }}
    whileTap={{ scale: 0.98 }}
    className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-card/80 hover:bg-card transition-all border border-border/30"
  >
    <Icon className={`w-5 h-5 text-muted-foreground ${spinning ? 'animate-spin' : ''}`} />
    <span className="text-foreground font-medium">{label}</span>
  </motion.button>
);

export const MiHomeScreen = ({
  channelCount,
  movieCount,
  seriesCount,
  sportsCount,
  loading,
  onNavigate,
  onReload,
  onCatchUp,
  onSearchClick,
  onVoiceSearchClick,
  onContinueWatchingSelect,
}: MiHomeScreenProps) => {
  const [time, setTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, forceUpdate] = useState(0);
  const weather = useWeather();
  const isMobile = useIsMobile();

  const handleCatchUp = () => {
    if (onCatchUp) {
      setIsRefreshing(true);
      onCatchUp();
      setTimeout(() => setIsRefreshing(false), 2000);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = () => time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const handleContinueWatchingRemove = useCallback(() => {
    forceUpdate((n) => n + 1);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
      {/* Header - Mi Player Pro style */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 md:py-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={arabiaLogo} alt="Mi Player Pro" className="h-14 md:h-20 w-auto" />
        </div>

        {/* Search Bar */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            <button
              onClick={onVoiceSearchClick}
              className="w-12 h-12 rounded-full bg-card border border-border/30 flex items-center justify-center hover:bg-card/80 transition-colors"
            >
              <Mic className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={onSearchClick}
              className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 min-w-[240px] border border-border/30 hover:bg-card transition-colors"
            >
              <Search className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">Search</span>
            </button>
          </div>
        )}

        {/* Right side - Settings & Profile */}
        <div className="flex items-center gap-3 md:gap-4">
          {isMobile && (
            <button
              onClick={onSearchClick}
              className="w-10 h-10 rounded-full bg-card border border-border/30 flex items-center justify-center"
            >
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => onNavigate('settings')}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-card border border-border/30 flex items-center justify-center hover:bg-card/80 transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden ring-2 ring-primary/30">
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-6 md:px-10 pb-8 overflow-y-auto">
        {isMobile ? (
          /* Mobile Layout - Vertical stack */
          <div className="flex flex-col gap-4 pb-20">
            {/* Continue Watching */}
            <ContinueWatching
              onSelect={(id) => onContinueWatchingSelect?.(id)}
              onRemove={handleContinueWatchingRemove}
            />

            {/* Live TV - Featured */}
            <TileCard onClick={() => onNavigate('live')} size="large" delay={0} className="min-h-[160px]">
              <div className="flex-1 flex flex-col justify-between">
                <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Tv className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Live TV's</h2>
                  <p className="text-muted-foreground text-sm">
                    {loading ? '...' : `+${channelCount.toLocaleString()} Channels`}
                  </p>
                </div>
              </div>
            </TileCard>

            {/* Grid for Movies, Series, Sports */}
            <div className="grid grid-cols-2 gap-4">
              <TileCard onClick={() => onNavigate('movies')} delay={1} className="min-h-[140px]">
                <div className="flex-1 flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Film className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Movies</h3>
                    <p className="text-muted-foreground text-xs">
                      {loading ? '...' : `+${movieCount.toLocaleString()} Movies`}
                    </p>
                  </div>
                </div>
              </TileCard>

              <TileCard onClick={() => onNavigate('series')} delay={2} className="min-h-[140px]">
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-bold">New</span>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Clapperboard className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Series</h3>
                    <p className="text-muted-foreground text-xs">
                      {loading ? '...' : `+${seriesCount.toLocaleString()} Series`}
                    </p>
                  </div>
                </div>
              </TileCard>
            </div>

            {/* Sports Guide */}
            <TileCard onClick={() => onNavigate('sports')} delay={3} className="min-h-[120px]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Sports Guide</h3>
                  <p className="text-muted-foreground text-xs">
                    {loading ? '...' : `+${sportsCount.toLocaleString()} in playlist`}
                  </p>
                </div>
              </div>
            </TileCard>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              <ActionButton icon={User} label="Account" onClick={() => onNavigate('settings')} />
              <ActionButton icon={RefreshCw} label="Reload" onClick={onReload} />
              <ActionButton icon={LogOut} label="Exit" onClick={() => window.close()} />
            </div>
          </div>
        ) : (
          /* Desktop Layout - Mi Player Pro Grid */
          <div className="flex gap-6 h-full">
            {/* Left Section - Content Tiles */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Continue Watching */}
              <ContinueWatching
                onSelect={(id) => onContinueWatchingSelect?.(id)}
                onRemove={handleContinueWatchingRemove}
              />

              {/* Main Grid */}
              <div className="grid grid-cols-3 grid-rows-2 gap-4 flex-1">
                {/* Live TV - Takes full left column */}
                <TileCard onClick={() => onNavigate('live')} size="large" delay={0} className="row-span-2">
                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                      <Tv className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">Live TV's</h2>
                      <p className="text-muted-foreground">
                        {loading ? '...' : `+${channelCount.toLocaleString()} Channels`}
                      </p>
                    </div>
                  </div>
                </TileCard>

                {/* Movies */}
                <TileCard onClick={() => onNavigate('movies')} delay={1}>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Film className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Movies</h3>
                      <p className="text-muted-foreground text-sm">
                        {loading ? '...' : `+${movieCount.toLocaleString()} Movies`}
                      </p>
                    </div>
                  </div>
                </TileCard>

                {/* Sports Guide */}
                <TileCard onClick={() => onNavigate('sports')} delay={2}>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Sports Guide</h3>
                      <p className="text-muted-foreground text-sm">
                        {loading ? '...' : `+${sportsCount.toLocaleString()} in playlist`}
                      </p>
                    </div>
                  </div>
                </TileCard>

                {/* Series */}
                <TileCard onClick={() => onNavigate('series')} delay={3}>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-bold">New</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Clapperboard className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Series</h3>
                      <p className="text-muted-foreground text-sm">
                        {loading ? '...' : `+${seriesCount.toLocaleString()} Series`}
                      </p>
                    </div>
                  </div>
                </TileCard>

                {/* Catch Up */}
                <TileCard onClick={handleCatchUp} delay={4}>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Clock className={`w-6 h-6 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Catch Up</h3>
                      <p className="text-muted-foreground text-sm">Resume watching</p>
                    </div>
                  </div>
                </TileCard>
              </div>
            </div>

            {/* Right Section - Actions & Time */}
            <div className="w-72 flex flex-col gap-4">
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <ActionButton icon={User} label="Account" onClick={() => onNavigate('settings')} />
                <ActionButton icon={RefreshCw} label="Reload" onClick={onReload} />
                <ActionButton icon={LogOut} label="Exit" onClick={() => window.close()} />
              </div>

              {/* Time & Date - Bottom right */}
              <div className="mt-auto text-right">
                <div className="flex items-center justify-end gap-2 text-muted-foreground mb-2">
                  <WeatherIcon icon={weather.icon} />
                  <span>{weather.displayTemp}</span>
                </div>
                <p className="text-5xl font-light text-foreground">{formatTime()}</p>
                <p className="text-muted-foreground text-lg">{formatDate()}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
