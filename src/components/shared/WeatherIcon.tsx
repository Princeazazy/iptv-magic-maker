import { Cloud, Sun, CloudRain, Snowflake, CloudLightning } from 'lucide-react';

interface WeatherIconProps {
  icon: string;
  className?: string;
}

export const WeatherIcon = ({ icon, className = 'w-5 h-5' }: WeatherIconProps) => {
  switch (icon) {
    case 'sun': return <Sun className={className} />;
    case 'rain': return <CloudRain className={className} />;
    case 'snow': return <Snowflake className={className} />;
    case 'storm': return <CloudLightning className={className} />;
    default: return <Cloud className={className} />;
  }
};
