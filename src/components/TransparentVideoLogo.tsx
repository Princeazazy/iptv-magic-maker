import arabiaLogo from '@/assets/arabia-logo-new.png';

interface TransparentVideoLogoProps {
  src?: string;
  className?: string;
  threshold?: number;
}

// Simplified: Use static logo image instead of heavy canvas video processing
export const TransparentVideoLogo = ({ 
  className = '',
}: TransparentVideoLogoProps) => {
  return (
    <div className={`relative ${className}`}>
      <img
        src={arabiaLogo}
        alt="Arabia"
        className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(200,150,50,0.5)]"
      />
    </div>
  );
};