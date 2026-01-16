import { motion } from 'framer-motion';
import arabiaLogo from '@/assets/arabia-logo-glow.png';

interface TransparentVideoLogoProps {
  src?: string;
  className?: string;
  threshold?: number;
}

// Enhanced logo with animated glow effects and particles
export const TransparentVideoLogo = ({ 
  className = '',
}: TransparentVideoLogoProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Outer mystical aura - pulsing glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,200,150,0.4) 0%, rgba(200,150,50,0.3) 40%, transparent 70%)',
          filter: 'blur(30px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Secondary golden glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, transparent 30%, rgba(218,165,32,0.4) 50%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{
          rotate: [0, 360],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: i % 2 === 0 
              ? 'radial-gradient(circle, #00d4aa 0%, transparent 70%)' 
              : 'radial-gradient(circle, #ffd700 0%, transparent 70%)',
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            boxShadow: i % 2 === 0 
              ? '0 0 10px #00d4aa, 0 0 20px #00d4aa' 
              : '0 0 10px #ffd700, 0 0 20px #ffd700',
          }}
          animate={{
            y: [-20, -40, -20],
            x: [0, (i % 2 === 0 ? 10 : -10), 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Smoke wisps */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-24"
        style={{
          background: 'linear-gradient(to top, transparent 0%, rgba(0,200,150,0.3) 50%, transparent 100%)',
          filter: 'blur(8px)',
        }}
        animate={{
          y: [-10, -30],
          opacity: [0.6, 0],
          scaleX: [1, 1.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      
      {/* Main logo with enhanced shadow and glow */}
      <motion.img
        src={arabiaLogo}
        alt="Arabia"
        className="relative z-10 w-full h-full object-contain"
        style={{
          filter: 'drop-shadow(0 0 15px rgba(218,165,32,0.8)) drop-shadow(0 0 30px rgba(0,200,150,0.5)) drop-shadow(0 5px 20px rgba(0,0,0,0.5))',
        }}
        animate={{
          filter: [
            'drop-shadow(0 0 15px rgba(218,165,32,0.8)) drop-shadow(0 0 30px rgba(0,200,150,0.5)) drop-shadow(0 5px 20px rgba(0,0,0,0.5))',
            'drop-shadow(0 0 25px rgba(218,165,32,1)) drop-shadow(0 0 50px rgba(0,200,150,0.8)) drop-shadow(0 5px 20px rgba(0,0,0,0.5))',
            'drop-shadow(0 0 15px rgba(218,165,32,0.8)) drop-shadow(0 0 30px rgba(0,200,150,0.5)) drop-shadow(0 5px 20px rgba(0,0,0,0.5))',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{
          scale: 1.05,
          filter: 'drop-shadow(0 0 35px rgba(218,165,32,1)) drop-shadow(0 0 60px rgba(0,200,150,1)) drop-shadow(0 5px 30px rgba(0,0,0,0.6))',
        }}
      />
      
      {/* Bottom reflection */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8"
        style={{
          background: 'radial-gradient(ellipse, rgba(218,165,32,0.4) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scaleX: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};
