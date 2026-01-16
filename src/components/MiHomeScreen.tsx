import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tv, Film, Clapperboard, Trophy, User, RefreshCw, Clock, LogOut, Search, Settings, Mic, Cloud, Sun, CloudRain, Snowflake, CloudLightning, Sparkles, Zap, RotateCw } from 'lucide-react';
import arabianPalaceBg from '@/assets/arabian-palace-bg.png';
import logoAnimation from '@/assets/logo-animation-new.mp4';
import { TransparentVideoLogo } from './TransparentVideoLogo';
import { ParticleBackground } from './ParticleBackground';
import { AnimatedGradientOrb } from './AnimatedGradientOrb';
import { useWeather } from '@/hooks/useWeather';
import { useIsMobile } from '@/hooks/use-mobile';

const WeatherIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'sun': return <Sun className="w-6 h-6" />;
    case 'rain': return <CloudRain className="w-6 h-6" />;
    case 'snow': return <Snowflake className="w-6 h-6" />;
    case 'storm': return <CloudLightning className="w-6 h-6" />;
    default: return <Cloud className="w-6 h-6" />;
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
}

// Animated count with smooth number transition
const AnimatedCount = ({ value, loading, suffix, color = 'primary' }: { value: number; loading?: boolean; suffix: string; color?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (loading || value === 0) {
      setDisplayValue(0);
      return;
    }
    
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, loading]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="inline-block w-16 h-4 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 rounded animate-shimmer" />
      </span>
    );
  }
  
  const colorClass = color === 'accent' ? 'text-accent' : color === 'purple' ? 'text-purple-400' : 'text-primary';
  
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className={`${colorClass} font-bold text-lg`}>+{displayValue.toLocaleString()}</span>
      <span className="text-muted-foreground ml-1">{suffix}</span>
    </motion.span>
  );
};

// Glowing animated card with border gradient
const GlowCard = ({ 
  children, 
  onClick, 
  className = '',
  glowColor = 'primary',
  delay = 0,
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
  glowColor?: 'primary' | 'accent' | 'purple' | 'cyan' | 'green';
  delay?: number;
}) => {
  const gradientMap = {
    primary: 'from-primary via-accent to-primary',
    accent: 'from-accent via-primary to-accent',
    purple: 'from-purple-500 via-pink-500 to-purple-500',
    cyan: 'from-cyan-400 via-blue-500 to-cyan-400',
    green: 'from-green-400 via-emerald-500 to-green-400',
  };

  const glowColorMap = {
    primary: 'hsl(8, 90%, 58%)',
    accent: 'hsl(32, 100%, 55%)',
    purple: 'hsl(280, 80%, 60%)',
    cyan: 'hsl(190, 90%, 50%)',
    green: 'hsl(140, 70%, 50%)',
  };

  const borderGradientMap = {
    primary: 'linear-gradient(135deg, hsl(8, 90%, 58%) 0%, hsl(32, 100%, 55%) 50%, hsl(8, 90%, 58%) 100%)',
    accent: 'linear-gradient(135deg, hsl(32, 100%, 55%) 0%, hsl(8, 90%, 58%) 50%, hsl(32, 100%, 55%) 100%)',
    purple: 'linear-gradient(135deg, hsl(280, 80%, 60%) 0%, hsl(320, 80%, 55%) 50%, hsl(280, 80%, 60%) 100%)',
    cyan: 'linear-gradient(135deg, hsl(190, 90%, 50%) 0%, hsl(220, 80%, 60%) 50%, hsl(190, 90%, 50%) 100%)',
    green: 'linear-gradient(135deg, hsl(140, 70%, 50%) 0%, hsl(160, 80%, 45%) 50%, hsl(140, 70%, 50%) 100%)',
  };

  return (
    <motion.div
      className={`relative group cursor-pointer ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated glow effect behind card */}
      <div 
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-500"
        style={{ background: borderGradientMap[glowColor] }}
      />
      
      {/* Card content with gradient border on hover */}
      <div 
        className="relative h-full rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, hsl(260 30% 18%) 0%, hsl(260 30% 10%) 100%)',
          boxShadow: `0 4px 30px -10px ${glowColorMap[glowColor]}40`,
        }}
      >
        {/* Animated border gradient */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-30 group-hover:opacity-100 transition-opacity duration-300"
          style={{ 
            background: borderGradientMap[glowColor],
            padding: '1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
        
        {/* Inner shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        
        {children}
      </div>
    </motion.div>
  );
};

// Static icon with simple styling - no animations
const FloatingIcon = ({ 
  icon: Icon, 
  color = 'primary',
  size = 'normal',
}: { 
  icon: typeof Tv; 
  color?: 'primary' | 'accent' | 'purple' | 'cyan';
  size?: 'normal' | 'large';
}) => {
  const colorMap = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    accent: 'from-accent/20 to-accent/5 text-accent',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400',
    cyan: 'from-cyan-400/20 to-cyan-400/5 text-cyan-400',
  };
  
  const sizeClass = size === 'large' ? 'w-20 h-20' : 'w-14 h-14';
  const iconSize = size === 'large' ? 'w-10 h-10' : 'w-7 h-7';

  return (
    <div
      className={`${sizeClass} rounded-2xl bg-gradient-to-br ${colorMap[color]} backdrop-blur-sm border border-white/10 flex items-center justify-center`}
    >
      <Icon className={`${iconSize}`} />
    </div>
  );
};

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
}: MiHomeScreenProps) => {
  const [time, setTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const weather = useWeather();
  const isMobile = useIsMobile();

  const handleCatchUp = async () => {
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Interactive particle background */}
      <ParticleBackground />

      {/* Animated gradient orbs - more vibrant */}
      <AnimatedGradientOrb 
        className="top-[-200px] left-[-100px]" 
        color1="hsl(8, 90%, 58%)" 
        color2="hsl(32, 100%, 55%)" 
        size={isMobile ? 400 : 700}
        delay={0}
      />
      <AnimatedGradientOrb 
        className="bottom-[-300px] right-[-200px]" 
        color1="hsl(280, 80%, 60%)" 
        color2="hsl(320, 80%, 55%)" 
        size={isMobile ? 350 : 600}
        delay={2}
      />
      {!isMobile && (
        <AnimatedGradientOrb 
          className="top-[30%] right-[20%]" 
          color1="hsl(190, 90%, 50%)" 
          color2="hsl(220, 80%, 60%)" 
          size={400}
          delay={4}
        />
      )}

      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(${arabianPalaceBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 md:px-10 py-4 md:py-6">
        <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
          <TransparentVideoLogo src={logoAnimation} className="h-16 w-24 md:h-36 md:w-48" threshold={35} />
        </div>

        {/* Search Bar - Hidden on mobile, show icon only */}
        {isMobile ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={onSearchClick}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/50 border border-white/10 flex items-center justify-center"
            >
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <button 
              onClick={() => onNavigate('settings')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/50 border border-white/10 flex items-center justify-center"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <button 
                onClick={onVoiceSearchClick}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-secondary/50 border border-white/10 flex items-center justify-center hover:scale-105 transition-transform duration-200"
              >
                <Mic className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={onSearchClick}
                className="flex items-center gap-3 bg-gradient-to-r from-secondary/80 to-secondary/40 backdrop-blur-xl rounded-full px-6 py-3.5 min-w-[260px] border border-white/10 hover:scale-[1.02] transition-transform duration-200"
              >
                <Search className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">Search anything...</span>
                <Sparkles className="w-4 h-4 text-accent ml-auto" />
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('settings')}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-secondary/50 border border-white/10 flex items-center justify-center hover:scale-105 hover:rotate-90 transition-all duration-200"
              >
                <Settings className="w-6 h-6 text-muted-foreground" />
              </button>
              <div 
                className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-accent to-primary overflow-hidden ring-4 ring-primary/30 hover:scale-105 transition-transform duration-200"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">A</span>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content Grid */}
      <main className="relative z-20 px-4 md:px-10 pt-4 pb-8 overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(100vh - 100px)' : 'auto' }}>
        {isMobile ? (
          /* Mobile Layout - Premium vertical cards */
          <div className="flex flex-col gap-3 pb-24">
            {/* Live TV Card - Featured */}
            <GlowCard onClick={() => onNavigate('live')} glowColor="primary" delay={0}>
              <div className="relative p-5 overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <Tv className="w-full h-full" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <FloatingIcon icon={Tv} color="primary" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Live TV</h2>
                      <AnimatedCount value={channelCount} loading={loading} suffix="Channels" color="primary" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/30">
                      Live Now
                    </span>
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Movies & Series Row */}
            <div className="grid grid-cols-2 gap-3">
              <GlowCard onClick={() => onNavigate('movies')} glowColor="purple" delay={1}>
                <div className="p-4 h-32 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 opacity-10">
                    <Film className="w-full h-full" />
                  </div>
                  <FloatingIcon icon={Film} color="purple" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Movies</h3>
                    <AnimatedCount value={movieCount} loading={loading} suffix="" color="purple" />
                  </div>
                </div>
              </GlowCard>

              <GlowCard onClick={() => onNavigate('series')} glowColor="accent" delay={2}>
                <div className="p-4 h-32 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 opacity-10">
                    <Clapperboard className="w-full h-full" />
                  </div>
                  <div className="flex items-start justify-between">
                    <FloatingIcon icon={Clapperboard} color="accent" />
                    <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold uppercase">
                      New
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Series</h3>
                    <AnimatedCount value={seriesCount} loading={loading} suffix="" color="accent" />
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* Sports Card */}
            <GlowCard onClick={() => onNavigate('sports')} glowColor="cyan" delay={3}>
              <div className="p-4 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                  <Trophy className="w-full h-full" />
                </div>
                <div className="flex items-center gap-4">
                  <FloatingIcon icon={Trophy} color="cyan" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Sports Guide</h3>
                    <AnimatedCount value={sportsCount} loading={loading} suffix="Events" color="accent" />
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Quick Actions - Sleek grid */}
            <div className="grid grid-cols-4 gap-2 mt-1">
              {[
                { icon: User, label: 'Account', action: () => onNavigate('settings'), color: 'from-blue-500/20 to-blue-600/10' },
                { icon: RefreshCw, label: 'Reload', action: onReload, color: 'from-green-500/20 to-green-600/10' },
                { icon: Clock, label: 'Catch up', action: handleCatchUp, spinning: isRefreshing, color: 'from-amber-500/20 to-amber-600/10' },
                { icon: LogOut, label: 'Exit', action: () => {}, color: 'from-red-500/20 to-red-600/10' },
              ].map(({ icon: Icon, label, action, spinning, color }, idx) => (
                <motion.button
                  key={label}
                  onClick={action}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/10 bg-gradient-to-br ${color} backdrop-blur-sm active:scale-95 transition-transform`}
                  disabled={spinning}
                >
                  <Icon className={`w-5 h-5 text-foreground ${spinning ? 'animate-spin' : ''}`} />
                  <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
                </motion.button>
              ))}
            </div>

          </div>
        ) : (
          /* Desktop Layout - Horizontal cards */
          <div className="flex gap-5 items-stretch justify-center">
            {/* Live TV - Large Card */}
            <GlowCard
              onClick={() => onNavigate('live')}
              className="w-[320px] h-[430px] flex-shrink-0"
              glowColor="primary"
              delay={0}
            >
              <div className="relative h-full flex flex-col p-6">
                {/* Live badge */}
                <div className="flex items-center justify-end">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold uppercase tracking-wider">
                    Live
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <FloatingIcon icon={Tv} color="primary" size="large" />
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-foreground">Live</h2>
                  <div className="mt-2">
                    <AnimatedCount value={channelCount} loading={loading} suffix="Channels" color="primary" />
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <div className="w-24 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent opacity-80" />
                </div>
              </div>
            </GlowCard>

            {/* Middle Column - Movies & Series - height matches Live/Sports */}
            <div className="flex flex-col gap-[14px] flex-shrink-0 h-[430px]">
              {/* Movies Card */}
              <GlowCard
                onClick={() => onNavigate('movies')}
                className="w-[280px] flex-1"
                glowColor="purple"
                delay={0.1}
              >
                <div className="relative h-full p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <FloatingIcon icon={Film} color="purple" />
                    <div className="opacity-30">
                      <Zap className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h3 className="text-2xl font-bold text-foreground">Movies</h3>
                    <div className="mt-1">
                      <AnimatedCount value={movieCount} loading={loading} suffix="Movies" color="purple" />
                    </div>
                  </div>
                </div>
              </GlowCard>

              {/* Series Card */}
              <GlowCard
                onClick={() => onNavigate('series')}
                className="w-[280px] flex-1"
                glowColor="accent"
                delay={0.2}
              >
                <div className="relative h-full p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <FloatingIcon icon={Clapperboard} color="accent" />
                    <div className="z-10">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-accent to-primary text-white text-xs font-bold uppercase">
                        New
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h3 className="text-2xl font-bold text-foreground">Series</h3>
                    <div className="mt-1">
                      <AnimatedCount value={seriesCount} loading={loading} suffix="Series" color="accent" />
                    </div>
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* Sports Guide Card - Same height as Live */}
            <GlowCard
              onClick={() => onNavigate('sports')}
              className="w-[320px] h-[430px] flex-shrink-0"
              glowColor="cyan"
              delay={0.3}
            >
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                
                <div className="relative flex items-center justify-center h-2/3">
                  <FloatingIcon icon={Trophy} color="cyan" size="large" />
                </div>
                
                <div className="relative px-5 pb-8">
                  <h3 className="text-2xl font-bold text-foreground">Sports Guide</h3>
                  <div className="mt-1">
                    <AnimatedCount value={sportsCount} loading={loading} suffix="in playlist" color="accent" />
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Action buttons - simplified with CSS transitions only */}
            <div className="flex flex-col gap-3 flex-shrink-0 h-[430px] justify-center">
              {[
                { icon: User, label: 'Account', action: () => onNavigate('settings') },
                { icon: RefreshCw, label: 'Reload', action: onReload },
                { icon: Clock, label: isRefreshing ? 'Updating...' : 'Catch up', action: handleCatchUp, spinning: isRefreshing },
                { icon: LogOut, label: 'Exit', action: () => {} },
              ].map(({ icon: Icon, label, action, spinning }) => (
                <button
                  key={label}
                  onClick={action}
                  className="relative flex items-center gap-4 px-6 py-4 rounded-xl border border-white/10 backdrop-blur-sm overflow-hidden group hover:scale-105 hover:translate-x-2 transition-all duration-200"
                  style={{
                    background: 'linear-gradient(145deg, hsl(260 30% 16%) 0%, hsl(260 30% 12%) 100%)',
                  }}
                  disabled={spinning}
                >
                  <Icon className={`w-5 h-5 text-muted-foreground group-hover:text-white transition-colors duration-200 ${spinning ? 'animate-spin' : ''}`} />
                  <span className="text-foreground font-medium group-hover:text-white transition-colors duration-200">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Right - Time & Weather - simplified (desktop only) */}
      {!isMobile && (
        <div className="absolute bottom-8 right-12 text-right z-20">
          <div className="flex items-center justify-end gap-2 text-muted-foreground mb-2">
            <button 
              onClick={() => weather.refresh()} 
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              title="Refresh weather"
            >
              <RotateCw className={`w-4 h-4 ${weather.loading ? 'animate-spin' : ''}`} />
            </button>
            <WeatherIcon icon={weather.icon} />
            <span className="text-lg font-medium">{weather.loading ? '...' : weather.displayTemp}</span>
          </div>
          <p className="text-6xl font-light text-foreground tracking-tight">
            {formatTime()}
          </p>
          <p className="text-muted-foreground text-lg mt-1">{formatDate()}</p>
        </div>
      )}
    </div>
  );
};
