import { motion } from 'framer-motion';

interface AnimatedGradientOrbProps {
  className?: string;
  color1?: string;
  color2?: string;
  size?: number;
  delay?: number;
}

export const AnimatedGradientOrb = ({
  className = '',
  color1 = 'hsl(0, 75%, 55%)',
  color2 = 'hsl(28, 100%, 55%)',
  size = 400,
  delay = 0,
}: AnimatedGradientOrbProps) => {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color1} 0%, ${color2} 50%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
        x: [0, 30, -20, 0],
        y: [0, -20, 30, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
};
