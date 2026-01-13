import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tv, Film, Clapperboard, Trophy, User, RefreshCw, Clock, LogOut, Search, Settings, Mic, Cloud, Sparkles, Zap } from 'lucide-react';
import arabianPalaceBg from '@/assets/arabian-palace-bg.png';
import logoAnimation from '@/assets/logo-animation-new.mp4';
import { TransparentVideoLogo } from './TransparentVideoLogo';
import { ParticleBackground } from './ParticleBackground';
import { AnimatedGradientOrb } from './AnimatedGradientOrb';

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

  const glowMap = {
    primary: 'shadow-primary/30',
    accent: 'shadow-accent/30',
    purple: 'shadow-purple-500/30',
    cyan: 'shadow-cyan-400/30',
    green: 'shadow-green-400/30',
  };

  return (
    <motion.div
      className={`relative group cursor-pointer ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated gradient border */}
      <motion.div
        className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-r ${gradientMap[glowColor]} opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ backgroundSize: '200% 200%' }}
      />
      
      {/* Card content */}
      <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl ${glowMap[glowColor]}`}
        style={{
          background: 'linear-gradient(145deg, hsl(260 30% 16%) 0%, hsl(260 30% 10%) 100%)',
        }}
      >
        {/* Inner glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 0%, hsl(var(--${glowColor}) / 0.15) 0%, transparent 60%)`,
          }}
        />
        
        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          }}
        />
        
        {children}
      </div>
    </motion.div>
  );
};

// Floating icon with glow
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
    <motion.div
      className={`${sizeClass} rounded-2xl bg-gradient-to-br ${colorMap[color]} backdrop-blur-sm border border-white/10 flex items-center justify-center`}
      animate={{ 
        y: [0, -8, 0],
        rotate: [0, 2, 0, -2, 0],
      }}
      transition={{
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <Icon className={`${iconSize}`} />
    </motion.div>
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
        size={700}
        delay={0}
      />
      <AnimatedGradientOrb 
        className="bottom-[-300px] right-[-200px]" 
        color1="hsl(280, 80%, 60%)" 
        color2="hsl(320, 80%, 55%)" 
        size={600}
        delay={2}
      />
      <AnimatedGradientOrb 
        className="top-[30%] right-[20%]" 
        color1="hsl(190, 90%, 50%)" 
        color2="hsl(220, 80%, 60%)" 
        size={400}
        delay={4}
      />

      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(${arabianPalaceBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Header */}
      <motion.header 
        className="relative z-20 flex items-center justify-between px-10 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="flex items-center gap-2 -ml-6"
          whileHover={{ scale: 1.05 }}
        >
          <TransparentVideoLogo src={logoAnimation} className="h-36 w-48" threshold={35} />
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button 
            onClick={onVoiceSearchClick}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-secondary/50 border border-white/10 flex items-center justify-center"
            whileHover={{ scale: 1.1, boxShadow: '0 0 30px hsl(var(--primary) / 0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Mic className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          <motion.button
            onClick={onSearchClick}
            className="flex items-center gap-3 bg-gradient-to-r from-secondary/80 to-secondary/40 backdrop-blur-xl rounded-full px-6 py-3.5 min-w-[260px] border border-white/10"
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px hsl(var(--primary) / 0.2)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Search className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground">Search anything...</span>
            <Sparkles className="w-4 h-4 text-accent ml-auto" />
          </motion.button>
        </motion.div>

        {/* Right side */}
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.button 
            onClick={() => onNavigate('settings')}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-secondary/50 border border-white/10 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-6 h-6 text-muted-foreground" />
          </motion.button>
          <motion.div 
            className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-accent to-primary overflow-hidden ring-4 ring-primary/30"
            whileHover={{ scale: 1.1 }}
            animate={{ boxShadow: ['0 0 20px hsl(var(--primary) / 0.4)', '0 0 40px hsl(var(--primary) / 0.6)', '0 0 20px hsl(var(--primary) / 0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">A</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.header>

      {/* Main Content Grid */}
      <main className="relative z-20 px-10 pt-4 pb-8">
        <div className="flex gap-4 items-start">
          {/* Live TV - Large Card */}
          <GlowCard
            onClick={() => onNavigate('live')}
            className="w-[300px] h-[430px]"
            glowColor="primary"
            delay={0}
          >
            <div className="relative h-full flex flex-col p-5">
              {/* Live badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <RefreshCw className="w-4 h-4" />
                  <span>Last Update : 2 day ago</span>
                </div>
                <motion.span 
                  className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold uppercase tracking-wider"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Live
                </motion.span>
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
                <motion.div 
                  className="w-24 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent"
                  animate={{ scaleX: [0.7, 1, 0.7], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
          </GlowCard>

          {/* Middle Column - Movies & Series */}
          <div className="flex flex-col gap-3">
            {/* Movies Card */}
            <GlowCard
              onClick={() => onNavigate('movies')}
              className="w-[220px] h-[208px]"
              glowColor="purple"
              delay={0.1}
            >
              <div className="relative h-full p-5">
                <div className="absolute top-5 left-5">
                  <FloatingIcon icon={Film} color="purple" />
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-2xl font-bold text-foreground">Movies</h3>
                  <div className="mt-1">
                    <AnimatedCount value={movieCount} loading={loading} suffix="Movies" color="purple" />
                  </div>
                </div>
                {/* Movie icon decorative */}
                <motion.div 
                  className="absolute top-5 right-5 opacity-20"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap className="w-8 h-8 text-purple-400" />
                </motion.div>
              </div>
            </GlowCard>

            {/* Series Card */}
            <GlowCard
              onClick={() => onNavigate('series')}
              className="w-[220px] h-[208px]"
              glowColor="accent"
              delay={0.2}
            >
              <div className="relative h-full p-5">
                <motion.div 
                  className="absolute top-5 right-5 z-10"
                  animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-accent to-primary text-white text-xs font-bold uppercase">
                    New
                  </span>
                </motion.div>
                <div className="absolute top-5 left-5">
                  <FloatingIcon icon={Clapperboard} color="accent" />
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-2xl font-bold text-foreground">Series</h3>
                  <div className="mt-1">
                    <AnimatedCount value={seriesCount} loading={loading} suffix="Series" color="accent" />
                  </div>
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Sports Guide Card */}
          <GlowCard
            onClick={() => onNavigate('sports')}
            className="w-[220px] h-[430px]"
            glowColor="cyan"
            delay={0.3}
          >
            <div className="relative h-full">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1461896836934-gy?w=400")' }}
              />
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

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 min-w-[180px]">
            {[
              { icon: User, label: 'Account', action: () => onNavigate('settings'), color: 'primary' },
              { icon: RefreshCw, label: 'Reload', action: onReload, color: 'cyan' },
              { icon: Clock, label: isRefreshing ? 'Updating...' : 'Catch up', action: handleCatchUp, color: 'accent', spinning: isRefreshing },
              { icon: LogOut, label: 'Exit', action: () => {}, color: 'purple' },
            ].map(({ icon: Icon, label, action, color, spinning }, index) => (
              <motion.button
                key={label}
                onClick={action}
                className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/10 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(145deg, hsl(260 30% 16%) 0%, hsl(260 30% 12%) 100%)',
                }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.02, 
                  x: 5,
                  boxShadow: `0 8px 30px hsl(var(--${color}) / 0.2)`,
                }}
                whileTap={{ scale: 0.98 }}
                disabled={spinning}
              >
                <Icon className={`w-5 h-5 text-muted-foreground ${spinning ? 'animate-spin' : ''}`} />
                <span className="text-foreground font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Right - Time & Weather */}
      <motion.div 
        className="absolute bottom-8 right-12 text-right z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="flex items-center justify-end gap-2 text-muted-foreground mb-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Cloud className="w-6 h-6" />
          </motion.div>
          <span className="text-lg font-medium">24°</span>
        </div>
        <motion.p 
          className="text-6xl font-light text-foreground tracking-tight"
          animate={{ 
            textShadow: [
              '0 0 20px hsl(var(--primary) / 0.3)', 
              '0 0 40px hsl(var(--primary) / 0.5)', 
              '0 0 20px hsl(var(--primary) / 0.3)'
            ] 
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {formatTime()}
        </motion.p>
        <p className="text-muted-foreground text-lg mt-1">{formatDate()}</p>
      </motion.div>
    </div>
  );
};
