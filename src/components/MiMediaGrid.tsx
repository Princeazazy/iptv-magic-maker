import { useState, useMemo } from 'react';
import { ChevronLeft, Search, Star, Tv, Film, User, Cloud, Grid, List } from 'lucide-react';
import { Channel } from '@/hooks/useIPTV';
import { useProgressiveList } from '@/hooks/useProgressiveList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Get category emoji based on group name
const getCategoryEmoji = (group: string): string => {
  const groupLower = group.toLowerCase();
  
  // Streaming services / Series platforms
  if (groupLower.includes('netflix') || group.includes('نتفلكس')) return '🎬';
  if (groupLower.includes('amazon') || groupLower.includes('prime')) return '📦';
  if (groupLower.includes('hulu')) return '📺';
  if (groupLower.includes('disney')) return '🏰';
  if (groupLower.includes('hbo') || groupLower.includes('max')) return '🎭';
  if (groupLower.includes('osn')) return '📡';
  if (groupLower.includes('starz')) return '⭐';
  if (groupLower.includes('showtime')) return '🎪';
  if (groupLower.includes('power')) return '⚡';
  
  // Wrestling / WWE
  if (groupLower.includes('wwe') || group.includes('مصارعة')) return '🤼';
  
  // 3D Movies
  if (groupLower.includes('3d')) return '🥽';
  
  // Cartoon / Kids
  if (groupLower.includes('cartoon') || group.includes('كرتون')) return '🎨';
  
  // Country-based VOD with flags
  if (groupLower.includes('albania')) return '🇦🇱';
  if (groupLower.includes('germany') || groupLower.includes('german') || groupLower.includes('بالالمانية') || groupLower.includes('ger')) return '🇩🇪';
  if (groupLower.includes('indian') || group.includes('هندية')) return '🇮🇳';
  if (groupLower.includes('vod fr') || groupLower.includes('france') || groupLower.includes('french')) return '🇫🇷';
  if (groupLower.includes('turk') || group.includes('تركية') || group.includes('تركي')) return '🇹🇷';
  if (groupLower.includes('asia')) return '🌏';
  if (groupLower.includes('vod en') || groupLower.includes('subtitles') || groupLower.includes('english')) return '🇬🇧';
  if (groupLower.includes('russia')) return '🇷🇺';
  if (groupLower.includes('egypt') || group.includes('مصر')) return '🇪🇬';
  
  // Documentary categories
  if (groupLower.includes('doc') || group.includes('وثائقية') || groupLower.includes('documentary')) return '📽️';
  
  // Movie/VOD categories
  if (groupLower.includes('vod') || groupLower.includes('mov') || group.includes('أفلام') || group.includes('افلام')) return '🎬';
  if (groupLower.match(/\b(19|20)\d{2}\b/)) return '🎬'; // Year patterns
  
  // Series
  if (groupLower.includes('series') || group.includes('مسلسل')) return '📺';
  
  // Action/Adventure
  if (groupLower.includes('action') || groupLower.includes('adventure')) return '💥';
  if (groupLower.includes('comedy')) return '😂';
  if (groupLower.includes('horror') || groupLower.includes('scary')) return '👻';
  if (groupLower.includes('crime') || groupLower.includes('mystery')) return '🔍';
  if (groupLower.includes('sci-fi') || groupLower.includes('fantasy')) return '🚀';
  
  return '🎬';
};

interface MiMediaGridProps {
  items: Channel[];
  favorites: Set<string>;
  onItemSelect: (item: Channel) => void;
  onToggleFavorite: (itemId: string) => void;
  onBack: () => void;
  category: 'movies' | 'series';
}

export const MiMediaGrid = ({
  items,
  favorites,
  onItemSelect,
  onToggleFavorite,
  onBack,
  category,
}: MiMediaGridProps) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('number');
  const [time] = useState(new Date());

  const groups = useMemo(() => {
    const groupCounts = new Map<string, number>();
    items.forEach((item) => {
      const group = item.group || 'Uncategorized';
      groupCounts.set(group, (groupCounts.get(group) || 0) + 1);
    });
    return Array.from(groupCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [items]);

  const filteredItems = useMemo(() => {
    let filtered = items.filter((item) => {
      return selectedGroup === 'all' || item.group === selectedGroup;
    });

    switch (sortBy) {
      case 'a-z':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'z-a':
        filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
        break;
    }

    return filtered;
  }, [items, selectedGroup, sortBy]);

  const { visibleItems, onScroll, hasMore } = useProgressiveList(filteredItems, {
    initial: 60,
    step: 60,
  });

  const title = category === 'movies' ? 'Movies' : 'Series';

  return (
    <div className="h-full flex bg-background">
      {/* Left Sidebar - Categories */}
      <div className="w-64 flex flex-col border-r border-border/30">
        {/* Back Button & Title */}
        <div className="flex items-center gap-4 p-5">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 active:scale-95 transition-all duration-100"
          >
            <ChevronLeft className="w-6 h-6 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <div className="flex gap-0.5">
              <Star className="w-4 h-4 mi-star-filled" />
              <Star className="w-4 h-4 mi-star-filled" />
            </div>
          </div>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 mi-scrollbar">
          {groups.map((group) => (
            <button
              key={group.name}
              onClick={() => setSelectedGroup(group.name)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                selectedGroup === group.name
                  ? 'bg-card ring-2 ring-accent/50'
                  : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-2xl">
                {getCategoryEmoji(group.name)}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm truncate ${selectedGroup === group.name ? 'font-semibold text-foreground' : ''}`}>
                  {group.name}
                </p>
                {selectedGroup === group.name && (
                  <p className="text-xs text-muted-foreground">{group.count} {title}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Nav Icons */}
        <div className="p-4 flex flex-col gap-2">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`mi-nav-item ${selectedGroup === 'all' ? 'active' : ''}`}
          >
            <Tv className="w-6 h-6" />
          </button>
          <button className="mi-nav-item">
            <Star className="w-6 h-6" />
          </button>
          <button className="mi-nav-item">
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content - Grid */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-60 bg-card border-border/50 rounded-xl h-12">
              <SelectValue placeholder="Order By Number" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/50">
              <SelectItem value="number">Order By Number</SelectItem>
              <SelectItem value="added">Order By Added</SelectItem>
              <SelectItem value="rating">Order By Rating</SelectItem>
              <SelectItem value="a-z">Order By A-Z</SelectItem>
              <SelectItem value="z-a">Order By Z-A</SelectItem>
            </SelectContent>
          </Select>

          {/* Time & Weather */}
          <div className="flex items-center gap-6">
            <span className="text-foreground font-medium text-lg">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cloud className="w-5 h-5" />
              <span>24°</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="w-11 h-11 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-11 h-11 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors">
              <Star className="w-5 h-5 mi-star-filled" />
            </button>
            <div className="w-11 h-11 rounded-full bg-primary overflow-hidden flex items-center justify-center ring-2 ring-primary/30">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6 mi-scrollbar" onScroll={onScroll}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onItemSelect(item)}
                className="group text-left cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onItemSelect(item);
                  }
                }}
              >
                {/* Poster */}
                <div className="mi-poster-card bg-card">
                  {item.logo || item.backdrop_path?.[0] ? (
                    <img
                      src={item.backdrop_path?.[0] || item.logo}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <Film className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}

                  {/* Selection indicator on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-transparent group-hover:bg-foreground transition-colors" />
                </div>

                {/* Title & Info */}
                <div className="mt-3">
                  <h3 className="text-foreground font-medium truncate">{item.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    {item.year && <span>{item.year}</span>}
                    {item.duration && <span>• {item.duration}</span>}
                    {item.rating && <span>• ⭐ {item.rating}</span>}
                    {!item.year && !item.duration && !item.rating && <span>{item.group}</span>}
                  </div>
                </div>

                {/* Badges & Favorite */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    <span className="mi-badge-hd">HD</span>
                    {item.genre && <span className="mi-badge-hd">{item.genre.split(',')[0]}</span>}
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        favorites.has(item.id)
                          ? 'mi-star-filled'
                          : 'text-muted-foreground hover:mi-star'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="py-6 text-center text-muted-foreground text-sm">Loading more…</div>
          )}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground text-lg">No {title.toLowerCase()} found</p>
              <p className="text-muted-foreground/60 text-sm mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
