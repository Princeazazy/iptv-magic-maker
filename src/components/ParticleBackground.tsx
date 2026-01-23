import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  color: 'primary' | 'accent' | 'purple';
}

export const ParticleBackground = ({ className = '' }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  // Generate initial particles
  useEffect(() => {
    const colors: ('primary' | 'accent' | 'purple')[] = ['primary', 'accent', 'purple'];
    const initialParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.4 + 0.1,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(initialParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    const animate = () => {
      setParticles(prev => prev.map(p => {
        let newX = p.x + p.vx;
        let newY = p.y + p.vy;

        // Bounce off edges
        if (newX < 0 || newX > 100) p.vx *= -1;
        if (newY < 0 || newY > 100) p.vy *= -1;

        // Keep in bounds
        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));

        return { ...p, x: newX, y: newY };
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Track mouse for interactive effects
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const colorMap = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    purple: 'bg-purple-500',
  };

  const glowMap = {
    primary: 'shadow-[0_0_15px_hsl(8,90%,58%)]',
    accent: 'shadow-[0_0_15px_hsl(32,100%,55%)]',
    purple: 'shadow-[0_0_15px_hsl(280,80%,60%)]',
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 pointer-events-auto overflow-hidden ${className}`} 
      style={{ zIndex: 1 }}
      onMouseMove={handleMouseMove}
    >
      {/* Animated particles */}
      {particles.map((p) => {
        // Calculate distance from mouse for interactive glow
        const dx = p.x - mousePos.x;
        const dy = p.y - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const isNearMouse = distance < 15;
        const scale = isNearMouse ? 1.5 : 1;
        const glowOpacity = isNearMouse ? 0.8 : p.opacity;

        return (
          <motion.div
            key={p.id}
            className={`absolute rounded-full ${colorMap[p.color]} ${isNearMouse ? glowMap[p.color] : ''}`}
            animate={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              scale,
              opacity: glowOpacity,
            }}
            transition={{ 
              type: 'tween',
              duration: 0.1,
              ease: 'linear',
            }}
            style={{
              width: p.size * 2,
              height: p.size * 2,
            }}
          />
        );
      })}

      {/* Mouse glow follower */}
      <motion.div
        className="absolute w-64 h-64 rounded-full pointer-events-none"
        animate={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          x: '-50%',
          y: '-50%',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        style={{
          background: 'radial-gradient(circle, hsl(8 90% 58% / 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Floating orbs with pulse */}
      <motion.div
        className="absolute w-4 h-4 rounded-full bg-primary/40"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ left: '20%', top: '30%' }}
      />
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-accent/50"
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ left: '70%', top: '60%' }}
      />
      <motion.div
        className="absolute w-5 h-5 rounded-full bg-purple-500/30"
        animate={{
          y: [0, -25, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ left: '85%', top: '20%' }}
      />
      <motion.div
        className="absolute w-6 h-6 rounded-full bg-cyan-500/25"
        animate={{
          y: [0, -18, 0],
          x: [0, -8, 0],
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.5, 0.25],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{ left: '10%', top: '70%' }}
      />
    </div>
  );
};
