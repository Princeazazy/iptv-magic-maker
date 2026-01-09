import { useState, useEffect } from 'react';
import { Tv, Film, Clapperboard, Trophy, User, RefreshCw, Clock, LogOut, Search, Settings, Mic, Cloud } from 'lucide-react';

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
      <header className="relative z-10 flex items-center justify-between px-10 py-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="text-4xl font-bold">
              <span className="text-primary">m</span>
              <span className="text-accent">i</span>
            </span>
            <span className="text-muted-foreground text-lg ml-3">Player Pro</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <button className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <Mic className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-3 bg-secondary/50 rounded-full px-5 py-3 min-w-[200px]">
            <span className="text-muted-foreground">Search</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('settings')}
            className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <Settings className="w-6 h-6 text-muted-foreground" />
          </button>
          <div className="w-14 h-14 rounded-full bg-primary overflow-hidden ring-4 ring-primary/30">
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <User className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-10 pt-6 pb-8">
        <div className="flex gap-5 items-start">
          {/* Live TV - Large Card */}
          <button
            onClick={() => onNavigate('live')}
            className="relative w-[320px] h-[440px] bg-card rounded-2xl overflow-hidden group hover:bg-card/80 transition-all cursor-pointer border border-border/30"
          >
            {/* Last Update Badge */}
            <div className="absolute top-5 left-5 flex items-center gap-2 text-muted-foreground text-sm">
              <RefreshCw className="w-4 h-4" />
              <span>Last Update : 2 day ago</span>
            </div>

            {/* Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-8">
              <div className="w-20 h-20 rounded-2xl bg-secondary/80 flex items-center justify-center">
                <Tv className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>

            {/* Title */}
            <div className="absolute bottom-12 left-6">
              <h2 className="text-3xl font-bold text-foreground">Live TV's</h2>
              <p className="text-muted-foreground mt-1">+{channelCount.toLocaleString()} Channels</p>
            </div>

            {/* Selection indicator */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-foreground rounded-full" />
          </button>

          {/* Middle Column - Movies & Series */}
          <div className="flex flex-col gap-4">
            {/* Movies Card */}
            <button
              onClick={() => onNavigate('movies')}
              className="relative w-[240px] h-[210px] bg-card rounded-2xl overflow-hidden group hover:bg-card/80 transition-all cursor-pointer border border-border/30"
            >
              <div className="absolute top-5 left-5">
                <div className="w-12 h-12 rounded-xl bg-secondary/80 flex items-center justify-center">
                  <Film className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
              <div className="absolute bottom-5 left-5">
                <h3 className="text-2xl font-semibold text-foreground">Movies</h3>
                <p className="text-muted-foreground text-sm mt-0.5">+{movieCount} Movies</p>
              </div>
            </button>

            {/* Series Card */}
            <button
              onClick={() => onNavigate('series')}
              className="relative w-[240px] h-[210px] bg-card rounded-2xl overflow-hidden group hover:bg-card/80 transition-all cursor-pointer border border-border/30"
            >
              {/* New Badge */}
              <div className="absolute top-5 right-5">
                <span className="px-3 py-1 bg-accent text-accent-foreground text-sm font-semibold rounded-md">
                  New
                </span>
              </div>
              <div className="absolute top-5 left-5">
                <div className="w-12 h-12 rounded-xl bg-secondary/80 flex items-center justify-center">
                  <Clapperboard className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
              <div className="absolute bottom-5 left-5">
                <h3 className="text-2xl font-semibold text-foreground">Series</h3>
                <p className="text-muted-foreground text-sm mt-0.5">+{seriesCount} Series</p>
              </div>
            </button>
          </div>

          {/* Sports Guide Card */}
          <button
            onClick={() => onNavigate('sports')}
            className="relative w-[240px] h-[440px] bg-card rounded-2xl overflow-hidden group hover:bg-card/80 transition-all cursor-pointer border border-border/30 bg-gradient-to-b from-card to-card/80"
            style={{
              backgroundImage: 'linear-gradient(to bottom, hsl(228 20% 12% / 0.9), hsl(228 20% 12% / 0.95)), url("https://images.unsplash.com/photo-1461896836934- voices?w=400")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 rounded-full bg-secondary/60 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <div className="absolute bottom-8 left-5">
              <h3 className="text-2xl font-semibold text-foreground">Sports Guide</h3>
              <p className="text-muted-foreground text-sm mt-0.5">+{sportsCount} in playlist</p>
            </div>
          </button>

          {/* Quick Actions Menu */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            <button className="flex items-center gap-4 px-5 py-4 bg-card rounded-xl hover:bg-card/80 transition-colors border border-border/30">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Account</span>
            </button>
            <button 
              onClick={onReload}
              className="flex items-center gap-4 px-5 py-4 bg-card rounded-xl hover:bg-card/80 transition-colors border border-border/30"
            >
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Reload</span>
            </button>
            <button className="flex items-center gap-4 px-5 py-4 bg-card rounded-xl hover:bg-card/80 transition-colors border border-border/30">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Catch up</span>
            </button>
            <button className="flex items-center gap-4 px-5 py-4 bg-card rounded-xl hover:bg-card/80 transition-colors border border-border/30">
              <LogOut className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Exit</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Right - Time & Weather */}
      <div className="absolute bottom-10 right-12 text-right">
        <div className="flex items-center justify-end gap-2 text-muted-foreground mb-3">
          <Cloud className="w-6 h-6" />
          <span className="text-lg">24°</span>
        </div>
        <p className="text-6xl font-light text-foreground tracking-tight">{formatTime()}</p>
        <p className="text-muted-foreground text-lg mt-1">{formatDate()}</p>
      </div>
    </div>
  );
};
