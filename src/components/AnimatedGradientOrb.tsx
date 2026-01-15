// Static gradient orb - no animations for performance
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
}: AnimatedGradientOrbProps) => {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none opacity-30 ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color1} 0%, ${color2} 50%, transparent 70%)`,
      }}
    />
  );
};
