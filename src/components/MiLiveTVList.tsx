import { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Star, Tv, Menu, X, Play, Calendar, Heart } from 'lucide-react';
import { Channel } from '@/hooks/useIPTV';
import { useProgressiveList } from '@/hooks/useProgressiveList';
import { useWeather } from '@/hooks/useWeather';
import { useIsMobile } from '@/hooks/use-mobile';
import { getCountryInfo, getCountryFlagUrl, getCategoryEmoji, mergeAndSortGroups, normalizeGroupName } from '@/lib/countryUtils';
import { EPGGuide } from './EPGGuide';
import { WeatherIcon } from './shared/WeatherIcon';
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
    default: return "Live TV";
  }
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
  const [selectedGroup, setSelectedGroup] = useState<string>('eg');
  const [sortBy, setSortBy] = useState<string>('number');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [hoveredChannel, setHoveredChannel] = useState<Channel | null>(null);
  const [showEPG, setShowEPG] = useState(false);
  const [localShowFavoritesOnly, setLocalShowFavoritesOnly] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const weather = useWeather();
  const isMobile = useIsMobile();

  const effectiveSearchQuery = localSearchQuery || searchQuery;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Build groups with first channel logo for non-country groups
  const groupsWithLogos = useMemo(() => {
    const groupData = new Map<string, { count: number; firstLogo?: string; originalNames: string[] }>();
    channels.forEach((ch) => {
      const group = ch.group || 'Uncategorized';
      const normalizedKey = normalizeGroupName(group);
      const existing = groupData.get(normalizedKey);
      if (!existing) {
        groupData.set(normalizedKey, { count: 1, firstLogo: ch.logo, originalNames: [group] });
      } else {
        existing.count++;
        // Track all original group names for this normalized key
        if (!existing.originalNames.includes(group)) {
          existing.originalNames.push(group);
        }
      }
    });
    return groupData;
  }, [channels]);

  const groups = useMemo(() => {
    return mergeAndSortGroups(groupsWithLogos);
  }, [groupsWithLogos]);

  // Create a mapping of normalized keys to original group names for filtering
  const normalizedGroupMap = useMemo(() => {
    const map = new Map<string, string[]>();
    channels.forEach((ch) => {
      const group = ch.group || 'Uncategorized';
      const normalizedKey = normalizeGroupName(group);
      const existing = map.get(normalizedKey);
      if (!existing) {
        map.set(normalizedKey, [group]);
      } else if (!existing.includes(group)) {
        existing.push(group);
      }
    });
    return map;
  }, [channels]);

  const filteredChannels = useMemo(() => {
    const hasSearchQuery = effectiveSearchQuery.trim().length > 0;
    
    let filtered = channels.filter((channel) => {
      const matchesSearch = channel.name.toLowerCase().includes(effectiveSearchQuery.toLowerCase());
      
      // When searching, ignore group filter and search ALL channels
      let matchesGroup = hasSearchQuery || selectedGroup === 'all';
      if (!matchesGroup) {
        const originalNames = normalizedGroupMap.get(selectedGroup) || [];
        matchesGroup = originalNames.includes(channel.group || 'Uncategorized');
      }
      
      const matchesFavorites = !localShowFavoritesOnly || favorites.has(channel.id);
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
  }, [channels, effectiveSearchQuery, selectedGroup, localShowFavoritesOnly, favorites, sortBy]);

  const { visibleItems: visibleChannels, onScroll, ensureIndexVisible, hasMore } = useProgressiveList(filteredChannels, { initial: 120, step: 120 });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredChannels.length === 0) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => { const next = Math.min(prev + 1, filteredChannels.length - 1); ensureIndexVisible(next); return next; });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredChannels[focusedIndex]) onChannelSelect(filteredChannels[focusedIndex]);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredChannels, focusedIndex, onChannelSelect, ensureIndexVisible]);

  const handleGroupSelect = (groupName: string) => {
    setSelectedGroup(groupName);
    if (isMobile) setSidebarOpen(false);
    // Reset scroll to top when changing groups
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Preview channel (hovered or current)
  const previewChannel = hoveredChannel || currentChannel;

  // Get logo for groups - use country flag for countries, first channel logo for others
  const getGroupLogo = (group: { name: string; displayName: string; firstLogo?: string; originalNames: string[] }): string | null => {
    // For countries, ALWAYS return the flag URL - never use channel logos for countries
    const countryInfo = getCountryInfo(group.displayName);
    if (countryInfo) {
      return countryInfo.flagUrl;
    }
    
    // Check if any original name is a country
    for (const origName of group.originalNames) {
      const flag = getCountryFlagUrl(origName);
      if (flag) return flag;
    }
    
    // For non-country groups (e.g., "Netflix", "MBC HD", "Jawwy TV"), use the first channel's logo
    if (group.firstLogo) {
      return group.firstLogo;
    }
    
    return null;
  };

  return (
    <div className="h-full flex flex-col bg-background relative overflow-x-hidden">
      {/* EPG Guide Overlay */}
      <AnimatePresence>
        {showEPG && (
          <div className="absolute inset-0 z-50 bg-background">
            <EPGGuide
              channels={channels}
              currentChannel={currentChannel}
              onChannelSelect={(channel) => {
                onChannelSelect(channel);
                setShowEPG(false);
              }}
              onClose={() => setShowEPG(false)}
            />
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Left Sidebar - Country/Category List */}
      <div className={`
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
          : 'w-56 flex-shrink-0'
        } 
        flex flex-col border-r border-border/30 bg-background
      `}>
        {/* Back Button & Title */}
        <div className="flex items-center gap-3 p-4">
          {isMobile ? (
            <button onClick={() => setSidebarOpen(false)} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          ) : (
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-card border border-border/30 flex items-center justify-center hover:bg-card/80 transition-colors">
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-foreground">{getCategoryTitle(category)}</h1>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 mi-scrollbar">
          {groups.map((group) => (
            <button
              key={group.name}
              onClick={() => handleGroupSelect(group.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                selectedGroup === group.name
                  ? 'bg-card text-foreground'
                  : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {getGroupLogo(group) ? (
                  <img src={getGroupLogo(group)!} alt={group.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-base">{getCategoryEmoji(group.displayName)}</span>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={`text-sm truncate ${selectedGroup === group.name ? 'font-semibold' : ''}`}>
                  {group.displayName}
                </p>
                {selectedGroup === group.name && (
                  <p className="text-xs text-muted-foreground">{group.count} Channels</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Nav - Favorites Filter */}
        <div className="p-3 flex flex-col gap-2">
          <button
            onClick={() => setLocalShowFavoritesOnly(!localShowFavoritesOnly)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              localShowFavoritesOnly ? 'bg-accent text-white ring-2 ring-accent/30' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            title={localShowFavoritesOnly ? 'Show All Channels' : 'Show Favorites Only'}
          >
            <Heart className={`w-5 h-5 ${localShowFavoritesOnly ? 'fill-white text-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Center - Channel List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 gap-2">
          {isMobile && (
            <div className="flex items-center gap-2">
              <button onClick={onBack} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 bg-card border-border/30 rounded-xl h-10">
                <SelectValue placeholder="Order By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Order By Number</SelectItem>
                <SelectItem value="a-z">Order By A-Z</SelectItem>
                <SelectItem value="z-a">Order By Z-A</SelectItem>
              </SelectContent>
            </Select>
            
            {/* EPG Button */}
            {category === 'live' && (
              <button
                onClick={() => setShowEPG(true)}
                className="flex items-center gap-2 px-4 h-10 bg-card border border-border/30 rounded-xl hover:bg-card/80 transition-colors"
              >
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground text-sm">EPG</span>
              </button>
            )}
          </div>

          {/* Time & Weather */}
          {!isMobile && (
            <div className="flex items-center gap-4">
              <span className="text-foreground font-medium">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <WeatherIcon icon={weather.icon} />
                <span>{weather.displayTemp}</span>
              </div>
            </div>
          )}

          {/* Search & Profile */}
          <div className="flex items-center gap-2">
            {showSearchInput ? (
              <div className="relative">
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                  onBlur={() => { if (!localSearchQuery) setShowSearchInput(false); }}
                  className="w-40 px-4 py-2 bg-card border border-border/30 rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {localSearchQuery && (
                  <button onClick={() => { setLocalSearchQuery(''); setShowSearchInput(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button onClick={() => setShowSearchInput(true)} className="w-10 h-10 rounded-full bg-card border border-border/30 flex items-center justify-center hover:bg-card/80">
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            {!isMobile && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ring-2 ring-primary/30">
                <span className="text-white font-bold">A</span>
              </div>
            )}
          </div>
        </div>

        {/* Channel Rows */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-2 mi-scrollbar" onScroll={onScroll}>
          <AnimatePresence mode="popLayout">
            {visibleChannels.map((channel, index) => (
              <motion.button
                key={channel.id}
                onClick={() => onChannelSelect(channel)}
                onMouseEnter={() => setHoveredChannel(channel)}
                onMouseLeave={() => setHoveredChannel(null)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group mb-1 ${
                  currentChannel?.id === channel.id
                    ? 'bg-card border-l-4 border-l-accent'
                    : focusedIndex === index
                    ? 'bg-card/70'
                    : 'hover:bg-card/50'
                }`}
              >
                {/* Channel Logo */}
                <div className="w-20 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">{channel.name.charAt(0)}</span>
                  )}
                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>

                {/* Channel Name */}
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-foreground font-medium truncate group-hover:text-primary transition-colors">
                    {channel.name}
                  </h3>
                </div>

                {/* Badges & Favorite */}
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">HD</span>
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">EPG</span>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(channel.id); }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star className={`w-5 h-5 ${favorites.has(channel.id) ? 'fill-accent text-accent' : 'text-muted-foreground hover:text-accent'}`} />
                  </motion.button>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>

          {hasMore && <div className="py-4 text-center text-muted-foreground text-sm">Loading more…</div>}
          
          {filteredChannels.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground text-lg">No channels found</p>
              <p className="text-muted-foreground/60 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      </div>
    </div>
  );
};
