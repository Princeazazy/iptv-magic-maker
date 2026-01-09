import { useState, useEffect } from 'react';
import { Tv, Film, Clapperboard, Bike, User, RefreshCw, Clock, LogOut, Search, Settings, Mic, Cloud } from 'lucide-react';

interface MiHomeScreenProps {
  channelCount: number;
  movieCount?: number;
  seriesCount?: number;
  sportsCount?: number;
  onNavigate: (section: 'live' | 'movies' | 'series' | 'sports' | 'settings') => void;
  onReload?: () => void;
}

export const MiHomeScreen = ({
  channelCount,
  movieCount = 1200,
  seriesCount = 1200,
  sportsCount = 100,
  onNavigate,
  onReload,
}: MiHomeScreenProps) => {
  const [time, setTime] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = () => {
    return time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="text-primary font-bold text-3xl">
              <span className="text-primary">M</span>
              <span className="text-[#FF6B35]">i</span>
            </div>
            <span className="text-muted-foreground text-sm ml-2">Player Pro</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
            <Mic className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 bg-secondary/30 rounded-full px-4 py-2.5 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Search</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('settings')}
            className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="w-12 h-12 rounded-full bg-primary overflow-hidden border-2 border-primary">
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-8 pt-4 pb-8">
        <div className="flex gap-6">
          {/* Live TV - Large Card */}
          <button
            onClick={() => onNavigate('live')}
            className="relative w-80 h-96 bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer border border-border/50"
          >
            {/* Last Update Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground text-xs">
              <RefreshCw className="w-3 h-3" />
              <span>Last Update : 2 day ago</span>
            </div>

            {/* Icon */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Tv className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>

            {/* Title */}
            <div className="absolute bottom-8 left-6">
              <h2 className="text-2xl font-bold text-foreground">Live TV's</h2>
              <p className="text-muted-foreground text-sm">+{channelCount.toLocaleString()} Channels</p>
            </div>

            {/* Selection indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary rounded-full" />
          </button>

          {/* Middle Column - Movies & Series */}
          <div className="flex flex-col gap-4">
            {/* Movies Card */}
            <button
              onClick={() => onNavigate('movies')}
              className="relative w-56 h-44 bg-card/60 backdrop-blur-sm rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer border border-border/50"
            >
              <div className="absolute top-4 left-4">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Film className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-semibold text-foreground">Movies</h3>
                <p className="text-muted-foreground text-xs">+{movieCount} Movies</p>
              </div>
            </button>

            {/* Series Card */}
            <button
              onClick={() => onNavigate('series')}
              className="relative w-56 h-44 bg-card/60 backdrop-blur-sm rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer border border-border/50"
            >
              {/* New Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded">
                  New
                </span>
              </div>
              <div className="absolute top-4 left-4">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Clapperboard className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-semibold text-foreground">Series</h3>
                <p className="text-muted-foreground text-xs">+{seriesCount} Series</p>
              </div>
            </button>
          </div>

          {/* Sports Guide Card */}
          <button
            onClick={() => onNavigate('sports')}
            className="relative w-56 h-[376px] bg-card/60 backdrop-blur-sm rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer border border-border/50"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <Bike className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <div className="absolute bottom-8 left-4">
              <h3 className="text-xl font-semibold text-foreground">Sports Guide</h3>
              <p className="text-muted-foreground text-xs">+{sportsCount} in playlist</p>
            </div>
          </button>

          {/* Quick Actions Menu */}
          <div className="flex flex-col gap-2 min-w-[180px]">
            <button className="flex items-center gap-3 px-4 py-3 bg-card/40 rounded-xl hover:bg-card/60 transition-colors">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-sm">Account</span>
            </button>
            <button 
              onClick={onReload}
              className="flex items-center gap-3 px-4 py-3 bg-card/40 rounded-xl hover:bg-card/60 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-sm">Reload</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 bg-card/40 rounded-xl hover:bg-card/60 transition-colors">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-sm">Catch up</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 bg-card/40 rounded-xl hover:bg-card/60 transition-colors">
              <LogOut className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-sm">Exit</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Right - Time & Weather */}
      <div className="absolute bottom-8 right-8 text-right">
        <div className="flex items-center justify-end gap-2 text-muted-foreground mb-2">
          <Cloud className="w-5 h-5" />
          <span className="text-sm">24°</span>
        </div>
        <p className="text-5xl font-light text-foreground">{formatTime()}</p>
        <p className="text-muted-foreground">{formatDate()}</p>
      </div>
    </div>
  );
};
