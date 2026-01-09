import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Search, Star, Tv, Cloud, User, Grid, List } from 'lucide-react';
import { Channel } from '@/hooks/useIPTV';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MiLiveTVListProps {
  channels: Channel[];
  currentChannel: Channel | null;
  favorites: Set<string>;
  searchQuery: string;
  showFavoritesOnly: boolean;
  onChannelSelect: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  onBack: () => void;
  category?: 'live' | 'movies' | 'series' | 'sports';
}

const getCategoryTitle = (category: string): string => {
  switch (category) {
    case 'movies': return 'Movies';
    case 'series': return 'Series';
    case 'sports': return 'Sports Guide';
    default: return "Live TV's";
  }
};

// Country flag image URLs using flagcdn.com (circular flags)
const getCountryFlagUrl = (group: string): string | null => {
  const groupLower = group.toLowerCase();
  const countryCodeMap: Record<string, string> = {
    'ukraine': 'ua',
    'brazil': 'br',
    'germany': 'de',
    'united states': 'us',
    'usa': 'us',
    'us': 'us',
    'france': 'fr',
    'portugal': 'pt',
    'south africa': 'za',
    'china': 'cn',
    'uk': 'gb',
    'united kingdom': 'gb',
    'spain': 'es',
    'italy': 'it',
    'canada': 'ca',
    'australia': 'au',
    'japan': 'jp',
    'korea': 'kr',
    'india': 'in',
    'mexico': 'mx',
    'argentina': 'ar',
    'netherlands': 'nl',
    'belgium': 'be',
    'sweden': 'se',
    'norway': 'no',
    'denmark': 'dk',
    'finland': 'fi',
    'poland': 'pl',
    'russia': 'ru',
    'turkey': 'tr',
    'egypt': 'eg',
    'saudi': 'sa',
    'uae': 'ae',
    'greece': 'gr',
    'czech': 'cz',
    'austria': 'at',
    'switzerland': 'ch',
    'ireland': 'ie',
    'romania': 'ro',
    'hungary': 'hu',
    'thailand': 'th',
    'vietnam': 'vn',
    'indonesia': 'id',
    'malaysia': 'my',
    'philippines': 'ph',
    'pakistan': 'pk',
    'bangladesh': 'bd',
    'israel': 'il',
    'iran': 'ir',
    'iraq': 'iq',
    'kuwait': 'kw',
    'qatar': 'qa',
    'bahrain': 'bh',
    'oman': 'om',
    'jordan': 'jo',
    'lebanon': 'lb',
    'morocco': 'ma',
    'algeria': 'dz',
    'tunisia': 'tn',
    'nigeria': 'ng',
    'kenya': 'ke',
    'ghana': 'gh',
    'colombia': 'co',
    'chile': 'cl',
    'peru': 'pe',
    'venezuela': 've',
    'ecuador': 'ec',
    'uruguay': 'uy',
    'paraguay': 'py',
    'bolivia': 'bo',
    'cuba': 'cu',
    'puerto rico': 'pr',
    'new zealand': 'nz',
    'singapore': 'sg',
    'hong kong': 'hk',
    'taiwan': 'tw',
  };

  for (const [key, code] of Object.entries(countryCodeMap)) {
    if (groupLower.includes(key)) {
      return `https://flagcdn.com/w80/${code}.png`;
    }
  }
  return null;
};

// Fallback emoji for non-country categories
const getCategoryEmoji = (group: string): string => {
  const groupLower = group.toLowerCase();
  if (groupLower.includes('news')) return '📰';
  if (groupLower.includes('sport')) return '⚽';
  if (groupLower.includes('documentary') || groupLower.includes('doc')) return '🎬';
  if (groupLower.includes('entertainment')) return '🎭';
  if (groupLower.includes('kids') || groupLower.includes('child')) return '👶';
  if (groupLower.includes('music')) return '🎵';
  if (groupLower.includes('movie') || groupLower.includes('film')) return '🎥';
  if (groupLower.includes('series')) return '📺';
  if (groupLower.includes('religious') || groupLower.includes('faith')) return '⛪';
  return '🌐';
};

export const MiLiveTVList = ({
  channels,
  currentChannel,
  favorites,
  searchQuery,
  showFavoritesOnly,
  onChannelSelect,
  onToggleFavorite,
  onBack,
  category = 'live',
}: MiLiveTVListProps) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('number');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const groups = useMemo(() => {
    const groupCounts = new Map<string, number>();
    channels.forEach((ch) => {
      const group = ch.group || 'Uncategorized';
      groupCounts.set(group, (groupCounts.get(group) || 0) + 1);
    });
    return Array.from(groupCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [channels]);

  const filteredChannels = useMemo(() => {
    let filtered = channels.filter((channel) => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = selectedGroup === 'all' || channel.group === selectedGroup;
      const matchesFavorites = !showFavoritesOnly || favorites.has(channel.id);
      return matchesSearch && matchesGroup && matchesFavorites;
    });

    switch (sortBy) {
      case 'a-z':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'z-a':
        filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return filtered;
  }, [channels, searchQuery, selectedGroup, showFavoritesOnly, favorites, sortBy]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredChannels.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, filteredChannels.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredChannels[focusedIndex]) {
            onChannelSelect(filteredChannels[focusedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredChannels, focusedIndex, onChannelSelect]);

  return (
    <div className="h-full flex bg-background">
      {/* Left Sidebar - Categories with Flags */}
      <div className="w-72 flex flex-col border-r border-border/30">
        {/* Back Button & Title */}
        <div className="flex items-center gap-4 p-5">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">
            {showFavoritesOnly ? (
              <>
                <span className="font-bold">Favorites</span>{' '}
                <span className="font-normal text-muted-foreground">{getCategoryTitle(category)}</span>
              </>
            ) : (
              getCategoryTitle(category)
            )}
          </h1>
        </div>

        {/* Country/Category List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 mi-scrollbar">
          {groups.slice(0, 15).map((group) => (
            <button
              key={group.name}
              onClick={() => setSelectedGroup(group.name)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                selectedGroup === group.name
                  ? 'bg-card text-foreground'
                  : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {getCountryFlagUrl(group.name) ? (
                  <img 
                    src={getCountryFlagUrl(group.name)!} 
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">{getCategoryEmoji(group.name)}</span>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm truncate ${selectedGroup === group.name ? 'font-semibold text-foreground' : ''}`}>
                  {group.name}
                </p>
                {selectedGroup === group.name && (
                  <p className="text-xs text-muted-foreground">{group.count} Channels</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Nav Icons */}
        <div className="p-4 flex flex-col gap-2">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              selectedGroup === 'all' && !showFavoritesOnly ? 'bg-secondary text-foreground' : 'bg-card text-muted-foreground hover:bg-card/80'
            }`}
          >
            <Tv className="w-6 h-6" />
          </button>
          <button
            onClick={() => onToggleFavorite('')}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              showFavoritesOnly ? 'bg-secondary text-foreground' : 'bg-card text-muted-foreground hover:bg-card/80'
            }`}
          >
            <Star className={`w-6 h-6 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content - Channel List */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-60 bg-card border-border/50 rounded-xl h-12">
              <SelectValue placeholder="Order By Number" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Order By Number</SelectItem>
              <SelectItem value="added">Order By Added</SelectItem>
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
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'card' : 'list')}
              className="w-11 h-11 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors"
            >
              {viewMode === 'list' ? <Grid className="w-5 h-5 text-muted-foreground" /> : <List className="w-5 h-5 text-muted-foreground" />}
            </button>
            <button className="w-11 h-11 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="w-11 h-11 rounded-full bg-primary overflow-hidden flex items-center justify-center ring-2 ring-primary/30">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 mi-scrollbar">
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {filteredChannels.map((channel, index) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    currentChannel?.id === channel.id
                      ? 'mi-card-selected'
                      : focusedIndex === index
                      ? 'bg-card'
                      : 'bg-card/50 hover:bg-card'
                  }`}
                >
                  {/* Channel Logo */}
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">
                        {channel.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Channel Name */}
                  <span className="flex-1 text-left text-foreground font-medium truncate">
                    {channel.name}
                  </span>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    <span className="mi-badge mi-badge-secondary">HD</span>
                    <span className="mi-badge mi-badge-secondary">EPG</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(channel.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          onToggleFavorite(channel.id);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          favorites.has(channel.id)
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredChannels.map((channel, index) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel)}
                  className={`flex gap-4 p-4 rounded-xl transition-all ${
                    currentChannel?.id === channel.id
                      ? 'mi-card-selected bg-card'
                      : focusedIndex === index
                      ? 'bg-card'
                      : 'bg-card/50 hover:bg-card'
                  }`}
                >
                  {/* Channel Logo - Larger for card view */}
                  <div className="w-28 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-full h-full object-contain p-3"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">
                        {channel.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Channel Info */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="text-foreground font-semibold text-left text-lg">{channel.name}</h3>
                      <p className="text-muted-foreground text-sm text-left">+8.2M Views</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <span className="mi-badge mi-badge-secondary">HD</span>
                        <span className="mi-badge mi-badge-secondary">EPG</span>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(channel.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            onToggleFavorite(channel.id);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            favorites.has(channel.id)
                              ? 'fill-accent text-accent'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {filteredChannels.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground text-lg">No channels found</p>
              <p className="text-muted-foreground/60 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Video Preview Panel (when channel selected) */}
      {currentChannel && (
        <div className="w-[420px] relative bg-gradient-to-l from-background/95 to-transparent">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${currentChannel.logo || ''})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute bottom-10 left-6 right-6">
            <p className="text-muted-foreground text-sm mb-2">Now Playing...</p>
            <h2 className="text-foreground text-3xl font-bold mb-2">{currentChannel.name}</h2>
            <p className="text-muted-foreground text-sm line-clamp-3">
              {currentChannel.group || 'Live TV Channel'}
            </p>
            {/* Progress bar placeholder */}
            <div className="mt-6">
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-foreground" />
              </div>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>01:52:37</span>
                <span>02:10:46</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
