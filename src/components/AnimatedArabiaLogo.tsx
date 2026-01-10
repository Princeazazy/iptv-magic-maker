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
    targetX: Math.random() * 80 - 40,
    targetY: -(60 + Math.random() * 100),
    duration: 2.5 + Math.random() * 2,
    delay: Math.random() * 2,
    size: 8 + Math.random() * 18,
    opacity: 0.5 + Math.random() * 0.4,
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
      background: `radial-gradient(circle, hsl(165 60% 50% / ${opacity}) 0%, hsl(165 50% 45% / ${opacity * 0.7}) 40%, transparent 100%)`,
      filter: 'blur(1px)',
      boxShadow: `0 0 ${size}px hsl(165 50% 50% / ${opacity * 0.5})`,
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
      width: 28,
      height: 55,
      background: `linear-gradient(to top, hsl(165 60% 50% / 0.6), hsl(165 50% 55% / 0.4), hsl(165 40% 50% / 0.1), transparent)`,
      filter: 'blur(3px)',
      boxShadow: '0 0 15px hsl(165 50% 50% / 0.3)',
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
      width: 45,
      height: 80,
      background: `radial-gradient(ellipse at center bottom, hsl(165 55% 50% / 0.5) 0%, hsl(165 50% 55% / 0.3) 40%, hsl(165 40% 50% / 0.1) 70%, transparent 100%)`,
      filter: 'blur(4px)',
      boxShadow: '0 0 25px hsl(165 50% 50% / 0.4)',
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
  const particles = generateParticles(12);
  
  const sizeClasses = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-24',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Ambient glow behind smoke */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 60,
          height: 100,
          background: 'radial-gradient(ellipse at center, hsl(165 50% 50% / 0.25) 0%, transparent 70%)',
          filter: 'blur(15px)',
          top: '-20%',
          right: '0%',
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Main floating smoke cloud */}
      <FloatingSmoke />
      
      {/* Secondary smoke wisps */}
      <SmokeWisp delay={0} duration={3.5} />
      <SmokeWisp delay={0.8} duration={3} />
      <SmokeWisp delay={1.6} duration={3.2} />
      <SmokeWisp delay={2.2} duration={2.8} />
      
      {/* Small smoke particles */}
      {particles.map((particle) => (
        <SmokeParticle key={particle.id} {...particle} />
      ))}
      
      {/* Glowing aura behind logo */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 70% 30%, hsl(165 55% 50% / 0.25) 0%, transparent 50%)',
          filter: 'blur(8px)',
        }}
        animate={{
          opacity: [0.6, 1, 0.6],
          scale: [1, 1.15, 1],
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
          filter: 'drop-shadow(0 0 12px hsl(165 50% 50% / 0.4)) drop-shadow(0 0 25px hsl(45 80% 50% / 0.2))',
        }}
        animate={{
          filter: [
            'drop-shadow(0 0 10px hsl(165 50% 50% / 0.4)) drop-shadow(0 0 20px hsl(45 80% 50% / 0.2))',
            'drop-shadow(0 0 20px hsl(165 55% 55% / 0.6)) drop-shadow(0 0 35px hsl(45 80% 55% / 0.3))',
            'drop-shadow(0 0 10px hsl(165 50% 50% / 0.4)) drop-shadow(0 0 20px hsl(45 80% 50% / 0.2))',
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
