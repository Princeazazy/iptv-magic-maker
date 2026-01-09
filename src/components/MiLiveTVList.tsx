import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronDown, Search, Star, Tv, Cloud } from 'lucide-react';
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
}

// Country flag emoji helper
const getCountryFlag = (group: string): string => {
  const groupLower = group.toLowerCase();
  const flagMap: Record<string, string> = {
    'ukraine': '🇺🇦',
    'brazil': '🇧🇷',
    'germany': '🇩🇪',
    'united states': '🇺🇸',
    'usa': '🇺🇸',
    'us': '🇺🇸',
    'france': '🇫🇷',
    'portugal': '🇵🇹',
    'south africa': '🇿🇦',
    'china': '🇨🇳',
    'uk': '🇬🇧',
    'united kingdom': '🇬🇧',
    'spain': '🇪🇸',
    'italy': '🇮🇹',
    'canada': '🇨🇦',
    'australia': '🇦🇺',
    'japan': '🇯🇵',
    'korea': '🇰🇷',
    'india': '🇮🇳',
    'mexico': '🇲🇽',
    'argentina': '🇦🇷',
    'netherlands': '🇳🇱',
    'belgium': '🇧🇪',
    'sweden': '🇸🇪',
    'norway': '🇳🇴',
    'denmark': '🇩🇰',
    'finland': '🇫🇮',
    'poland': '🇵🇱',
    'russia': '🇷🇺',
    'turkey': '🇹🇷',
    'egypt': '🇪🇬',
    'saudi': '🇸🇦',
    'uae': '🇦🇪',
  };

  for (const [key, flag] of Object.entries(flagMap)) {
    if (groupLower.includes(key)) return flag;
  }
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
}: MiLiveTVListProps) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('number');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
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
    <div className="h-full flex">
      {/* Left Sidebar - Categories with Flags */}
      <div className="w-64 flex flex-col">
        {/* Back Button & Title */}
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">
            {showFavoritesOnly ? (
              <>
                <span className="font-bold">Favorites</span>{' '}
                <span className="font-normal text-muted-foreground">Live TV's</span>
              </>
            ) : (
              "Live TV's"
            )}
          </h1>
        </div>

        {/* Country/Category List */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {groups.slice(0, 15).map((group) => (
            <button
              key={group.name}
              onClick={() => setSelectedGroup(group.name)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                selectedGroup === group.name
                  ? 'bg-card text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg overflow-hidden">
                <span>{getCountryFlag(group.name)}</span>
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm truncate ${selectedGroup === group.name ? 'font-semibold' : ''}`}>
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
        <div className="p-4 space-y-2">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              selectedGroup === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            <Tv className="w-6 h-6" />
          </button>
          <button
            onClick={() => onToggleFavorite('')}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              showFavoritesOnly ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            <Star className={`w-6 h-6 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content - Channel List */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-56 bg-card/50 border-border">
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
          <div className="flex items-center gap-4">
            <span className="text-foreground font-medium">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Cloud className="w-4 h-4" />
              <span className="text-sm">24°</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80" />
            </div>
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto px-6">
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {filteredChannels.map((channel, index) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    currentChannel?.id === channel.id
                      ? 'bg-card border-l-4 border-primary'
                      : focusedIndex === index
                      ? 'bg-card/70'
                      : 'bg-card/40 hover:bg-card/60'
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
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-semibold rounded">
                      HD
                    </span>
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-semibold rounded">
                      EPG
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(channel.id);
                      }}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          favorites.has(channel.id)
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChannels.map((channel, index) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel)}
                  className={`flex gap-4 p-4 rounded-xl transition-all ${
                    currentChannel?.id === channel.id
                      ? 'bg-card border-l-4 border-primary'
                      : focusedIndex === index
                      ? 'bg-card/70'
                      : 'bg-card/40 hover:bg-card/60'
                  }`}
                >
                  {/* Channel Logo - Larger for card view */}
                  <div className="w-24 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-full h-full object-contain p-2"
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
                      <h3 className="text-foreground font-semibold text-left">{channel.name}</h3>
                      <p className="text-muted-foreground text-xs text-left">+8.2M Views</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-semibold rounded">
                          HD
                        </span>
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-semibold rounded">
                          EPG
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(channel.id);
                        }}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            favorites.has(channel.id)
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        />
                      </button>
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
        <div className="w-[400px] relative">
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 to-transparent" />
          <div className="absolute bottom-8 left-4 right-4">
            <p className="text-muted-foreground text-sm mb-1">Now Playing...</p>
            <h2 className="text-foreground text-2xl font-bold mb-2">{currentChannel.name}</h2>
            <p className="text-muted-foreground text-sm line-clamp-3">
              {currentChannel.group || 'Live TV Channel'}
            </p>
            {/* Progress bar placeholder */}
            <div className="mt-4">
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-foreground" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
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
