import { motion } from 'framer-motion';
import arabiaLogo from '@/assets/arabia-logo.png';

interface AnimatedArabiaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Generate random smoke particles
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    initialX: Math.random() * 30 - 15,
    initialY: 0,
    targetX: Math.random() * 60 - 30,
    targetY: -(50 + Math.random() * 80),
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 2,
    size: 4 + Math.random() * 12,
    opacity: 0.3 + Math.random() * 0.4,
  }));
};

const SmokeParticle = ({ 
  initialX, 
  initialY, 
  targetX, 
  targetY, 
  duration, 
  delay, 
  size, 
  opacity 
}: {
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
}) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, hsl(165 50% 45% / ${opacity}) 0%, hsl(165 40% 40% / ${opacity * 0.5}) 50%, transparent 100%)`,
      filter: 'blur(2px)',
      top: '25%',
      right: '15%',
    }}
    initial={{ 
      x: initialX, 
      y: initialY, 
      opacity: 0, 
      scale: 0.3 
    }}
    animate={{ 
      x: [initialX, targetX * 0.5, targetX],
      y: [initialY, targetY * 0.6, targetY],
      opacity: [0, opacity, opacity * 0.8, 0],
      scale: [0.3, 1, 1.5, 2],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  />
);

const SmokeWisp = ({ delay, duration }: { delay: number; duration: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      width: 20,
      height: 40,
      background: `linear-gradient(to top, hsl(165 50% 45% / 0.4), hsl(165 40% 50% / 0.2), transparent)`,
      filter: 'blur(4px)',
      borderRadius: '50%',
      top: '20%',
      right: '12%',
    }}
    initial={{ 
      y: 0, 
      x: 0,
      opacity: 0,
      scaleY: 0.5,
      scaleX: 1,
    }}
    animate={{ 
      y: [-5, -60, -100],
      x: [0, 15, 25],
      opacity: [0, 0.6, 0.4, 0],
      scaleY: [0.5, 1.2, 2],
      scaleX: [1, 1.5, 2.5],
      rotate: [0, 10, 20],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  />
);

const FloatingSmoke = () => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      width: 35,
      height: 60,
      background: `radial-gradient(ellipse at center bottom, hsl(165 45% 45% / 0.35) 0%, hsl(165 40% 50% / 0.15) 50%, transparent 80%)`,
      filter: 'blur(6px)',
      borderRadius: '50% 50% 30% 30%',
      top: '10%',
      right: '8%',
    }}
    animate={{ 
      y: [0, -20, -40, -60, -80],
      x: [0, 5, 15, 25, 40],
      opacity: [0.5, 0.7, 0.5, 0.3, 0],
      scaleX: [1, 1.2, 1.5, 2, 3],
      scaleY: [1, 1.3, 1.5, 1.8, 2.2],
      rotate: [0, 5, 10, 15, 25],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeOut",
    }}
  />
);

export const AnimatedArabiaLogo = ({ className = '', size = 'md' }: AnimatedArabiaLogoProps) => {
  const particles = generateParticles(8);
  
  const sizeClasses = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-24',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main floating smoke cloud */}
      <FloatingSmoke />
      
      {/* Secondary smoke wisps */}
      <SmokeWisp delay={0} duration={3.5} />
      <SmokeWisp delay={1.2} duration={3} />
      <SmokeWisp delay={2.4} duration={3.2} />
      
      {/* Small smoke particles */}
      {particles.map((particle) => (
        <SmokeParticle key={particle.id} {...particle} />
      ))}
      
      {/* Glowing aura behind logo */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 70% 30%, hsl(165 50% 45% / 0.15) 0%, transparent 50%)',
          filter: 'blur(10px)',
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Logo with glow animation */}
      <motion.img
        src={arabiaLogo}
        alt="Arabia"
        className={`${sizeClasses[size]} w-auto relative z-10`}
        style={{
          filter: 'drop-shadow(0 0 10px hsl(165 50% 45% / 0.3))',
        }}
        animate={{
          filter: [
            'drop-shadow(0 0 8px hsl(165 50% 45% / 0.3))',
            'drop-shadow(0 0 15px hsl(165 50% 50% / 0.5))',
            'drop-shadow(0 0 8px hsl(165 50% 45% / 0.3))',
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};
