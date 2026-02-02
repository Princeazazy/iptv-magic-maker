import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Film, Tv, TrendingUp, Loader2 } from 'lucide-react';
import { useTMDB, TMDBItem } from '@/hooks/useTMDB';

interface TMDBBrowseSectionProps {
  onSelectItem?: (item: TMDBItem) => void;
}

const MediaCard = ({ item, onClick, index }: { item: TMDBItem; onClick?: () => void; index: number }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05, duration: 0.2 }}
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex-shrink-0 w-full group relative"
  >
    {/* Poster */}
    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-card border border-border/30 relative">
      {item.poster ? (
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          {item.mediaType === 'tv' ? (
            <Tv className="w-10 h-10 text-muted-foreground" />
          ) : (
            <Film className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
      )}
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Play className="w-5 h-5 text-primary-foreground fill-current" />
        </div>
      </div>
      
      {/* Rating badge */}
      {item.rating && item.rating > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-white">{item.rating.toFixed(1)}</span>
        </div>
      )}
      
      {/* Media type badge */}
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary/80 backdrop-blur-sm">
        <span className="text-[10px] font-bold text-primary-foreground uppercase">
          {item.mediaType === 'tv' ? 'TV' : 'Movie'}
        </span>
      </div>
    </div>
    
    {/* Title */}
    <div className="mt-2 px-1">
      <h4 className="text-sm font-medium text-foreground truncate">{item.title}</h4>
      {item.year && (
        <p className="text-xs text-muted-foreground">{item.year}</p>
      )}
    </div>
  </motion.button>
);

const CategoryRow = ({ 
  title, 
  icon: Icon, 
  items, 
  onSelectItem,
  loading 
}: { 
  title: string; 
  icon: typeof Film;
  items: TMDBItem[]; 
  onSelectItem?: (item: TMDBItem) => void;
  loading?: boolean;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Auto-scroll effect
  useEffect(() => {
    if (!scrollRef.current || items.length === 0 || isPaused) return;
    
    const container = scrollRef.current;
    let animationId: number;
    let scrollSpeed = 0.5; // pixels per frame
    
    const scroll = () => {
      if (container && !isPaused) {
        container.scrollLeft += scrollSpeed;
        
        // Reset to start when reaching the end (infinite loop effect)
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 10) {
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    
    return () => cancelAnimationFrame(animationId);
  }, [items.length, isPaused]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : items.length > 0 ? (
        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Duplicate items for seamless infinite scroll */}
          {[...items, ...items].map((item, index) => (
            <div key={`${item.id}-${item.mediaType}-${index}`} className="flex-shrink-0 w-[140px] md:w-[160px]">
              <MediaCard
                item={item}
                index={index % items.length}
                onClick={() => onSelectItem?.(item)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          No content available
        </div>
      )}
    </div>
  );
};

export const TMDBBrowseSection = ({ onSelectItem }: TMDBBrowseSectionProps) => {
  const { getTrending, getMovies, getTVShows, error } = useTMDB();
  const [trending, setTrending] = useState<TMDBItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<TMDBItem[]>([]);
  const [popularTV, setPopularTV] = useState<TMDBItem[]>([]);
  const [loadingState, setLoadingState] = useState({
    trending: true,
    movies: true,
    tv: true,
  });

  useEffect(() => {
    const loadContent = async () => {
      // Load all categories in parallel
      const [trendingData, moviesData, tvData] = await Promise.all([
        getTrending().finally(() => setLoadingState(s => ({ ...s, trending: false }))),
        getMovies('popular').finally(() => setLoadingState(s => ({ ...s, movies: false }))),
        getTVShows('popular').finally(() => setLoadingState(s => ({ ...s, tv: false }))),
      ]);
      
      setTrending(trendingData.slice(0, 18));
      setPopularMovies(moviesData.results.slice(0, 18));
      setPopularTV(tvData.results.slice(0, 18));
    };
    
    // Initial load
    loadContent();
    
    // Auto-refresh every 30 minutes
    const refreshInterval = setInterval(() => {
      loadContent();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [getTrending, getMovies, getTVShows]);

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
        <p className="text-destructive text-sm">Failed to load content: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Browse Movies & Series</h2>
          <p className="text-sm text-muted-foreground">Discover trending content • Click to view details & trailers</p>
        </div>
      </div>
      
      {/* Content Rows */}
      <div className="space-y-6">
        <CategoryRow
          title="Trending Now"
          icon={TrendingUp}
          items={trending}
          onSelectItem={onSelectItem}
          loading={loadingState.trending}
        />
        
        <CategoryRow
          title="Popular Movies"
          icon={Film}
          items={popularMovies}
          onSelectItem={onSelectItem}
          loading={loadingState.movies}
        />
        
        <CategoryRow
          title="Popular TV Shows"
          icon={Tv}
          items={popularTV}
          onSelectItem={onSelectItem}
          loading={loadingState.tv}
        />
      </div>
    </div>
  );
};
