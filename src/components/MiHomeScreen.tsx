import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Film, Clapperboard, Trophy, User, RefreshCw, Clock, LogOut, Search, Settings, Mic, Cloud, Sparkles } from 'lucide-react';
import arabianPalaceBg from '@/assets/arabian-palace-bg.png';
import logoAnimation from '@/assets/logo-animation-new.mp4';
import { TransparentVideoLogo } from './TransparentVideoLogo';
import { ParticleBackground } from './ParticleBackground';
import { AnimatedGradientOrb } from './AnimatedGradientOrb';
import { GlowingCard } from './GlowingCard';

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
const AnimatedCount = ({ value, loading, suffix }: { value: number; loading?: boolean; suffix: string }) => {
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
        <span className="text-muted-foreground">{suffix}</span>
      </span>
    );
  }
  
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-muted-foreground"
    >
      <span className="text-primary font-semibold">+{displayValue.toLocaleString()}</span> {suffix}
    </motion.span>
  );
};

// Floating icon with 3D effect
const FloatingIcon = ({ 
  icon: Icon, 
  className = '',
  delay = 0,
}: { 
  icon: typeof Tv; 
  className?: string;
  delay?: number;
}) => (
  <motion.div
    className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary via-secondary/80 to-secondary/60 flex items-center justify-center backdrop-blur-sm border border-border/30 ${className}`}
    initial={{ scale: 0, rotate: -10 }}
    animate={{ 
      scale: 1, 
      rotate: 0,
      y: [0, -5, 0],
    }}
    transition={{
      scale: { duration: 0.5, delay },
      rotate: { duration: 0.5, delay },
      y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 },
    }}
    whileHover={{ 
      scale: 1.1, 
      rotate: 5,
      boxShadow: '0 10px 30px hsl(var(--primary) / 0.3)',
    }}
  >
    <Icon className="w-8 h-8 text-foreground/80" />
  </motion.div>
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
}: MiHomeScreenProps) => {
  const [time, setTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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

  const formatTime = () => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = () => {
    return time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Interactive particle background */}
      <ParticleBackground />

      {/* Animated gradient orbs */}
      <AnimatedGradientOrb 
        className="top-[-200px] left-[-100px]" 
        color1="hsl(0, 75%, 55%)" 
        color2="hsl(28, 100%, 55%)" 
        size={600}
        delay={0}
      />
      <AnimatedGradientOrb 
        className="bottom-[-300px] right-[-200px]" 
        color1="hsl(28, 100%, 55%)" 
        color2="hsl(0, 75%, 55%)" 
        size={500}
        delay={2}
      />
      <AnimatedGradientOrb 
        className="top-[40%] left-[60%]" 
        color1="hsl(280, 80%, 50%)" 
        color2="hsl(320, 70%, 50%)" 
        size={300}
        delay={4}
      />

      {/* Background image with enhanced overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${arabianPalaceBg})`,
          opacity: 0.5,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Header */}
      <motion.header 
        className="relative z-20 flex items-center justify-between px-10 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated Logo */}
        <motion.div 
          className="flex items-center gap-2 -ml-6"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <TransparentVideoLogo 
            src={logoAnimation} 
            className="h-36 w-48"
            threshold={35}
          />
        </motion.div>

        {/* Search Bar with glass effect */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button 
            onClick={onVoiceSearchClick}
            className="w-14 h-14 rounded-full glass-card flex items-center justify-center hover:animate-pulse-glow transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mic className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          <motion.button
            onClick={onSearchClick}
            className="flex items-center gap-3 glass-card rounded-full px-6 py-3.5 min-w-[240px] hover:border-primary/30 transition-all duration-300"
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px hsl(var(--primary) / 0.2)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Search className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground">Search</span>
            <Sparkles className="w-4 h-4 text-accent ml-auto" />
          </motion.button>
        </motion.div>

        {/* Right side - Settings & Profile */}
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.button 
            onClick={() => onNavigate('settings')}
            className="w-14 h-14 rounded-full glass-card flex items-center justify-center"
            whileHover={{ 
              scale: 1.1, 
              rotate: 90,
              boxShadow: '0 8px 32px hsl(var(--primary) / 0.3)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-6 h-6 text-muted-foreground" />
          </motion.button>
          <motion.div 
            className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary to-accent overflow-hidden ring-4 ring-primary/30"
            whileHover={{ scale: 1.1 }}
            animate={{ 
              boxShadow: ['0 0 20px hsl(var(--primary) / 0.3)', '0 0 30px hsl(var(--primary) / 0.5)', '0 0 20px hsl(var(--primary) / 0.3)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-bold">A</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.header>

      {/* Main Content Grid */}
      <motion.main 
        className="relative z-20 px-10 pt-4 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex gap-4 items-start">
          {/* Live TV - Large Card */}
          <motion.div variants={itemVariants}>
            <GlowingCard
              onClick={() => onNavigate('live')}
              className="relative w-[300px] h-[430px] glass-card glass-card-hover rounded-2xl cursor-pointer flex flex-col"
              glowColor="hsl(0, 75%, 55%)"
              delay={0}
            >
              {/* Live badge */}
              <motion.div 
                className="absolute top-5 right-5"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold uppercase tracking-wider">
                  Live
                </span>
              </motion.div>

              <div className="flex items-center gap-2 text-muted-foreground text-sm px-5 pt-5">
                <RefreshCw className="w-4 h-4" />
                <span>Last Update : 2 day ago</span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <FloatingIcon icon={Tv} delay={0.2} />
              </div>

              <div className="px-6 pb-6">
                <h2 className="text-3xl font-bold text-foreground">Live</h2>
                <p className="mt-1">
                  <AnimatedCount value={channelCount} loading={loading} suffix="Channels" />
                </p>
              </div>

              <div className="flex justify-center pb-5">
                <motion.div 
                  className="w-20 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full"
                  animate={{ scaleX: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </GlowingCard>
          </motion.div>

          {/* Middle Column - Movies & Series */}
          <div className="flex flex-col gap-3">
            <motion.div variants={itemVariants}>
              <GlowingCard
                onClick={() => onNavigate('movies')}
                className="relative w-[220px] h-[208px] glass-card glass-card-hover rounded-2xl cursor-pointer"
                glowColor="hsl(280, 80%, 55%)"
                delay={0.1}
              >
                <div className="absolute top-5 left-5">
                  <FloatingIcon icon={Film} className="w-12 h-12" delay={0.3} />
                </div>
                <div className="absolute bottom-5 left-5">
                  <h3 className="text-2xl font-semibold text-foreground">Movies</h3>
                  <p className="text-sm mt-0.5">
                    <AnimatedCount value={movieCount} loading={loading} suffix="Movies" />
                  </p>
                </div>
              </GlowingCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <GlowingCard
                onClick={() => onNavigate('series')}
                className="relative w-[220px] h-[208px] glass-card glass-card-hover rounded-2xl cursor-pointer"
                glowColor="hsl(28, 100%, 55%)"
                delay={0.2}
              >
                <motion.div 
                  className="absolute top-5 right-5"
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="px-2.5 py-1 rounded bg-gradient-to-r from-accent to-primary text-white text-xs font-bold">
                    New
                  </span>
                </motion.div>
                <div className="absolute top-5 left-5">
                  <FloatingIcon icon={Clapperboard} className="w-12 h-12" delay={0.4} />
                </div>
                <div className="absolute bottom-5 left-5">
                  <h3 className="text-2xl font-semibold text-foreground">Series</h3>
                  <p className="text-sm mt-0.5">
                    <AnimatedCount value={seriesCount} loading={loading} suffix="Series" />
                  </p>
                </div>
              </GlowingCard>
            </motion.div>
          </div>

          {/* Sports Guide Card */}
          <motion.div variants={itemVariants}>
            <GlowingCard
              onClick={() => onNavigate('sports')}
              className="relative w-[220px] h-[430px] glass-card glass-card-hover rounded-2xl cursor-pointer overflow-hidden"
              glowColor="hsl(45, 100%, 50%)"
              delay={0.3}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1461896836934-gy?w=400")',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/90 to-transparent" />
              
              <div className="relative flex items-center justify-center h-2/3">
                <FloatingIcon icon={Trophy} className="w-16 h-16" delay={0.5} />
              </div>
              
              <div className="relative px-5 pb-8">
                <h3 className="text-2xl font-semibold text-foreground">Sports Guide</h3>
                <p className="text-sm mt-0.5">
                  <AnimatedCount value={sportsCount} loading={loading} suffix="in playlist" />
                </p>
              </div>
            </GlowingCard>
          </motion.div>

          {/* Action buttons */}
          <motion.div 
            className="flex flex-col gap-2.5 min-w-[180px]"
            variants={containerVariants}
          >
            {[
              { icon: User, label: 'Account', action: () => onNavigate('settings'), delay: 0.4 },
              { icon: RefreshCw, label: 'Reload', action: onReload, delay: 0.5 },
              { icon: Clock, label: isRefreshing ? 'Updating...' : 'Catch up', action: handleCatchUp, delay: 0.6, spinning: isRefreshing },
              { icon: LogOut, label: 'Exit', action: () => {}, delay: 0.7 },
            ].map(({ icon: Icon, label, action, delay, spinning }) => (
              <motion.button
                key={label}
                onClick={action}
                className="flex items-center gap-4 px-5 py-4 glass-card glass-card-hover rounded-xl ripple"
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                disabled={spinning}
              >
                <Icon className={`w-5 h-5 text-muted-foreground ${spinning ? 'animate-spin' : ''}`} />
                <span className="text-foreground">{label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.main>

      {/* Bottom Right - Time & Weather with glow */}
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
          <span className="text-lg">24°</span>
        </div>
        <motion.p 
          className="text-6xl font-light text-foreground tracking-tight"
          animate={{ textShadow: ['0 0 10px hsl(var(--primary) / 0.3)', '0 0 20px hsl(var(--primary) / 0.5)', '0 0 10px hsl(var(--primary) / 0.3)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {formatTime()}
        </motion.p>
        <p className="text-muted-foreground text-lg mt-1">{formatDate()}</p>
      </motion.div>
    </div>
  );
};
