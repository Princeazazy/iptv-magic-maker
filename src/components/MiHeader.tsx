import { Search, Star, Cloud } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatedArabiaLogo } from './AnimatedArabiaLogo';

interface MiHeaderProps {
  title: string;
  onSearchChange?: (query: string) => void;
  onFavoritesClick?: () => void;
  showFavorites?: boolean;
}

export const MiHeader = ({ 
  title, 
  onSearchChange, 
  onFavoritesClick,
  showFavorites = false 
}: MiHeaderProps) => {
  const [time, setTime] = useState(new Date());
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border">
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <AnimatedArabiaLogo size="md" />
        <div className="w-px h-6 bg-border mx-2 hidden sm:block" />
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      {/* Right side - Time, Weather, Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        {showSearch ? (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-48 px-4 py-2 bg-secondary rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
              onBlur={() => !searchQuery && setShowSearch(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
        )}

        {/* Time and Weather */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="text-lg font-medium">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-1">
            <Cloud className="w-4 h-4" />
            <span className="text-sm">24°</span>
          </div>
        </div>

        {/* Favorites */}
        <button
          onClick={onFavoritesClick}
          className={`p-2 rounded-full transition-colors ${
            showFavorites ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
          }`}
        >
          <Star className={`w-5 h-5 ${showFavorites ? 'fill-current' : ''}`} />
        </button>
      </div>
    </header>
  );
};
