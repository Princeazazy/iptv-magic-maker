import { motion } from 'framer-motion';
import arabiaLogo from '@/assets/arabia-logo-new.png';

interface TransparentVideoLogoProps {
  src?: string;
  className?: string;
  threshold?: number;
}

// Enhanced logo with animated glow effects
export const TransparentVideoLogo = ({ 
  className = '',
}: TransparentVideoLogoProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Outer mystical aura - pulsing glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,200,150,0.3) 0%, rgba(200,150,50,0.2) 40%, transparent 70%)',
          filter: 'blur(25px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: i % 2 === 0 ? '#00d4aa' : '#ffd700',
            left: `${30 + Math.random() * 40}%`,
            top: `${30 + Math.random() * 40}%`,
            boxShadow: i % 2 === 0 
              ? '0 0 8px #00d4aa' 
              : '0 0 8px #ffd700',
          }}
          animate={{
            y: [-15, -35, -15],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2.5 + Math.random() * 1.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Main logo with enhanced glow */}
      <motion.img
        src={arabiaLogo}
        alt="Arabia"
        className="relative z-10 w-full h-full object-contain"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(200,150,50,0.6)) drop-shadow(0 0 40px rgba(0,180,130,0.4))',
        }}
        animate={{
          filter: [
            'drop-shadow(0 0 20px rgba(200,150,50,0.6)) drop-shadow(0 0 40px rgba(0,180,130,0.4))',
            'drop-shadow(0 0 30px rgba(200,150,50,0.9)) drop-shadow(0 0 60px rgba(0,180,130,0.6))',
            'drop-shadow(0 0 20px rgba(200,150,50,0.6)) drop-shadow(0 0 40px rgba(0,180,130,0.4))',
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};
