import { useState, useEffect } from 'react';
import { Tv, Film, Clapperboard, Trophy, User, RefreshCw, Clock, LogOut, Search, Settings, Mic, Cloud } from 'lucide-react';
import arabianPalaceBg from '@/assets/arabian-palace-bg.png';
import arabiaLogo from '@/assets/arabia-logo.png';
import { BackgroundMusic } from './BackgroundMusic';

interface MiHomeScreenProps {
  channelCount: number;
  movieCount: number;
  seriesCount: number;
  sportsCount: number;
  onNavigate: (section: 'live' | 'movies' | 'series' | 'sports' | 'settings') => void;
  onReload?: () => void;
  onSearchClick?: () => void;
  onVoiceSearchClick?: () => void;
}

export const MiHomeScreen = ({
  channelCount,
  movieCount,
  seriesCount,
  sportsCount,
  onNavigate,
  onReload,
  onSearchClick,
  onVoiceSearchClick,
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
      {/* Background image with overlay - more visible palace */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${arabianPalaceBg})`,
          opacity: 0.7,
        }}
      />
      {/* Lighter gradient overlay to show more of the palace */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/50 to-background/40" />
      {/* Bottom fade for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Background Music */}
      <BackgroundMusic src="/audio/arabian-ambient.mp3" autoPlay defaultVolume={0.25} />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-10 py-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={arabiaLogo} alt="Arabia" className="h-28 w-auto" />
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onVoiceSearchClick}
            className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <Mic className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={onSearchClick}
            className="flex items-center gap-3 bg-card/60 backdrop-blur-sm rounded-full px-6 py-3.5 min-w-[240px] border border-border/20 hover:bg-card/80 transition-colors"
          >
            <Search className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground">Search</span>
          </button>
        </div>

        {/* Right side - Settings & Profile */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('settings')}
            className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <Settings className="w-6 h-6 text-muted-foreground" />
          </button>
          <div className="w-14 h-14 rounded-full bg-primary overflow-hidden ring-4 ring-primary/30">
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-bold">A</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="relative z-10 px-10 pt-4 pb-8">
        <div className="flex gap-4 items-start">
          {/* Live TV - Large Card (Left) */}
          <button
            onClick={() => onNavigate('live')}
            className="relative w-[300px] h-[430px] mi-card group cursor-pointer flex flex-col"
          >
            {/* Last Update Badge */}
            <div className="flex items-center gap-2 text-muted-foreground text-sm px-5 pt-5">
              <RefreshCw className="w-4 h-4" />
              <span>Last Update : 2 day ago</span>
            </div>

            {/* Center Icon */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
                <Tv className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>

            {/* Title & Count */}
            <div className="px-6 pb-6">
              <h2 className="text-3xl font-bold text-foreground">Live</h2>
              <p className="text-muted-foreground mt-1">+{channelCount.toLocaleString()} Channels</p>
            </div>
            {/* Selection indicator */}
            <div className="flex justify-center pb-5">
              <div className="mi-selection-bar" />
            </div>
          </button>

          {/* Middle Column - Movies & Series */}
          <div className="flex flex-col gap-3">
            {/* Movies Card */}
            <button
              onClick={() => onNavigate('movies')}
              className="relative w-[220px] h-[208px] mi-card group cursor-pointer"
            >
              <div className="absolute top-5 left-5">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Film className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
              <div className="absolute bottom-5 left-5">
                <h3 className="text-2xl font-semibold text-foreground">Movies</h3>
                <p className="text-muted-foreground text-sm mt-0.5">+{movieCount.toLocaleString()} Movies</p>
              </div>
            </button>

            {/* Series Card */}
            <button
              onClick={() => onNavigate('series')}
              className="relative w-[220px] h-[208px] mi-card group cursor-pointer"
            >
              {/* New Badge */}
              <div className="absolute top-5 right-5">
                <span className="mi-badge mi-badge-new">New</span>
              </div>
              <div className="absolute top-5 left-5">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Clapperboard className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
              <div className="absolute bottom-5 left-5">
                <h3 className="text-2xl font-semibold text-foreground">Series</h3>
                <p className="text-muted-foreground text-sm mt-0.5">+{seriesCount.toLocaleString()} Series</p>
              </div>
            </button>
          </div>

          {/* Sports Guide Card */}
          <button
            onClick={() => onNavigate('sports')}
            className="relative w-[220px] h-[430px] mi-card group cursor-pointer overflow-hidden"
          >
            {/* Background image hint for sports */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1461896836934-gy?w=400")',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/90 to-card/70" />
            
            {/* Icon */}
            <div className="relative flex items-center justify-center h-2/3">
              <div className="w-16 h-16 rounded-full bg-secondary/60 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            
            {/* Title */}
            <div className="relative px-5 pb-8">
              <h3 className="text-2xl font-semibold text-foreground">Sports Guide</h3>
              <p className="text-muted-foreground text-sm mt-0.5">+{sportsCount} in playlist</p>
            </div>
          </button>

          <div className="flex flex-col gap-2.5 min-w-[180px]">
            <button 
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-4 px-5 py-4 mi-card hover:bg-card"
            >
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Account</span>
            </button>
            <button 
              onClick={onReload}
              className="flex items-center gap-4 px-5 py-4 mi-card hover:bg-card"
            >
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Reload</span>
            </button>
            <button className="flex items-center gap-4 px-5 py-4 mi-card hover:bg-card">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Catch up</span>
            </button>
            <button className="flex items-center gap-4 px-5 py-4 mi-card hover:bg-card">
              <LogOut className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Exit</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Right - Time & Weather */}
      <div className="absolute bottom-8 right-12 text-right z-10">
        <div className="flex items-center justify-end gap-2 text-muted-foreground mb-2">
          <Cloud className="w-6 h-6" />
          <span className="text-lg">24°</span>
        </div>
        <p className="text-6xl font-light text-foreground tracking-tight">{formatTime()}</p>
        <p className="text-muted-foreground text-lg mt-1">{formatDate()}</p>
      </div>
    </div>
  );
};
