import { motion } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';

interface GlowingCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glowColor?: string;
  delay?: number;
}

export const GlowingCard = ({
  children,
  className = '',
  onClick,
  glowColor = 'hsl(0, 75%, 55%)',
  delay = 0,
}: GlowingCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Spotlight effect following cursor */}
      {isHovered && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: 300,
            height: 300,
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
            background: `radial-gradient(circle, ${glowColor}20 0%, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${glowColor}30, transparent 50%, ${glowColor}20)`,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
