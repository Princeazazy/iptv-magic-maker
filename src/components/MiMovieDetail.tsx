import { useState, useEffect } from 'react';
import { ChevronLeft, Play, Star, Clock, Globe, Calendar, User, Cloud, Sun, CloudRain, Snowflake, CloudLightning, Search, Film } from 'lucide-react';
import { Channel } from '@/hooks/useIPTV';
import { useWeather } from '@/hooks/useWeather';

const WeatherIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'sun': return <Sun className="w-5 h-5" />;
    case 'rain': return <CloudRain className="w-5 h-5" />;
    case 'snow': return <Snowflake className="w-5 h-5" />;
    case 'storm': return <CloudLightning className="w-5 h-5" />;
    default: return <Cloud className="w-5 h-5" />;
  }
};

interface MiMovieDetailProps {
  item: Channel;
  onBack: () => void;
  onPlay: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

export const MiMovieDetail = ({
  item,
  onBack,
  onPlay,
  onToggleFavorite,
  isFavorite,
}: MiMovieDetailProps) => {
  const [time, setTime] = useState(new Date());
  const weather = useWeather();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Parse metadata from channel data
  const metadata = {
    genre: item.genre || 'SuperHero, Comedy',
    rating: item.rating || '6.5',
    duration: item.duration || '02:10:46',
    languages: 'EN+FR',
    director: item.director || 'Greta Gerwig, Raymond Kirk',
    ageRating: '+18',
    plot: item.plot || `${item.name} is a 2023 fantasy comedy film directed by Greta Gerwig from a screenplay she wrote with Noah Baumbach. Based on the eponymous fashion dolls by Mattel, it is the first live-action film after numerous computer-animated films and specials. The film stars Margot Robbie as the title character and Ryan Gosling as Ken, and follows the pair on a journey of self-discovery through both the fantasy world and the real world. The supporting cast includes America Ferrera, Michael Cera, Kate McKinnon, Issa Rae, Rhea Perlman, and Will Ferrell.`,
    year: item.year || '2023',
  };

  // Get poster URL - use backdrop or logo
  const posterUrl = item.backdrop_path?.[0] || item.logo || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blur image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110"
        style={{ backgroundImage: `url(${posterUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 active:scale-95 transition-all duration-100"
          >
            <ChevronLeft className="w-6 h-6 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">{item.name} Movie</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <span className="text-foreground font-medium text-lg">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <WeatherIcon icon={weather.icon} />
            <span>{weather.displayTemp}</span>
          </div>
          <button className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="w-12 h-12 rounded-full bg-primary overflow-hidden ring-2 ring-primary/30">
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-10 py-6">
        <div className="flex gap-10">
          {/* Poster */}
          <div className="w-[350px] flex-shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              {item.logo ? (
                <img 
                  src={posterUrl}
                  alt={item.name}
                  className="w-full aspect-[2/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-card flex items-center justify-center">
                  <Film className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 max-w-2xl">
            {/* Genre */}
            <p className="text-muted-foreground text-lg">{metadata.genre}</p>
            
            {/* Title */}
            <h1 className="text-4xl font-bold text-foreground mt-2">{item.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-4 mt-4">
              <span className="text-lg text-muted-foreground">{metadata.rating}/10</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(parseFloat(metadata.rating) / 2)
                        ? 'mi-star-filled'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Metadata Row */}
            <div className="flex items-center gap-4 mt-6 flex-wrap">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span>{metadata.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="w-5 h-5" />
                <span>{metadata.languages}</span>
              </div>
              <span className="mi-badge mi-badge-hd">HD</span>
              <span className="mi-badge mi-badge-epg">EPG</span>
            </div>

            {/* Director & Age */}
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Director:</span>
                <span className="text-foreground">{metadata.director}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Age:</span>
                <span className="text-foreground">{metadata.ageRating}</span>
              </div>
            </div>

            {/* Plot */}
            <p className="text-muted-foreground mt-6 leading-relaxed line-clamp-6">
              {metadata.plot}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button className="flex-1 flex items-center justify-center gap-3 px-8 py-4 mi-card hover:bg-card transition-colors">
                <Film className="w-6 h-6 text-muted-foreground" />
                <span className="text-foreground font-medium text-lg">Trailer</span>
              </button>
              
              <button 
                onClick={onPlay}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-secondary rounded-2xl hover:bg-secondary/80 transition-colors"
              >
                <Play className="w-6 h-6 text-foreground fill-foreground" />
                <span className="text-foreground font-medium text-lg">Watch Now</span>
              </button>
              
              <button 
                onClick={onToggleFavorite}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 mi-card hover:bg-card transition-colors"
              >
                <Star className={`w-6 h-6 ${isFavorite ? 'mi-star-filled' : 'text-muted-foreground'}`} />
                <span className="text-foreground font-medium text-lg">
                  {isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
