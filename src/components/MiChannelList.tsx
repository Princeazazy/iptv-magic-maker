import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { MiChannelCard } from './MiChannelCard';
import { Channel } from '@/hooks/useIPTV';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MiChannelListProps {
  channels: Channel[];
  currentChannel: Channel | null;
  favorites: Set<string>;
  searchQuery: string;
  showFavoritesOnly: boolean;
  onChannelSelect: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
}

export const MiChannelList = ({
  channels,
  currentChannel,
  favorites,
  searchQuery,
  showFavoritesOnly,
  onChannelSelect,
  onToggleFavorite,
}: MiChannelListProps) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('number');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const groups = useMemo(() => {
    const uniqueGroups = new Set(channels.map((ch) => ch.group || 'Uncategorized'));
    return Array.from(uniqueGroups).sort();
  }, [channels]);

  const filteredChannels = useMemo(() => {
    let filtered = channels.filter((channel) => {
      const matchesSearch = channel.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesGroup =
        selectedGroup === 'all' || channel.group === selectedGroup;
      const matchesFavorites = !showFavoritesOnly || favorites.has(channel.id);

      return matchesSearch && matchesGroup && matchesFavorites;
    });

    // Sort channels
    switch (sortBy) {
      case 'a-z':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'z-a':
        filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [channels, searchQuery, selectedGroup, showFavoritesOnly, favorites, sortBy]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredChannels.length === 0) return;

      const cols = window.innerWidth >= 1280 ? 5 : window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 3 : 2;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, filteredChannels.length - 1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + cols, filteredChannels.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - cols, 0));
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

  useEffect(() => {
    setFocusedIndex(0);
  }, [searchQuery, selectedGroup, showFavoritesOnly, sortBy]);

  return (
    <div className="flex h-full">
      {/* Category Sidebar */}
      <div className="w-64 bg-sidebar-background border-r border-border p-4 space-y-2 overflow-y-auto hidden lg:block">
        <button
          onClick={() => setSelectedGroup('all')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            selectedGroup === 'all'
              ? 'bg-card text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-sm">All Channels</span>
          <span className="ml-auto text-xs text-muted-foreground">{channels.length}</span>
        </button>
        
        {groups.slice(0, 20).map((group) => {
          const count = channels.filter((c) => c.group === group).length;
          return (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                selectedGroup === group
                  ? 'bg-card text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">{group.charAt(0)}</span>
              </div>
              <span className="text-sm truncate flex-1 text-left">{group}</span>
              <span className="text-xs text-muted-foreground">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            {/* Mobile Category Select */}
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48 lg:hidden">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground hidden lg:block">
              {filteredChannels.length} channels
            </span>
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Order By Number" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Order By Number</SelectItem>
              <SelectItem value="added">Order By Added</SelectItem>
              <SelectItem value="a-z">Order By A-Z</SelectItem>
              <SelectItem value="z-a">Order By Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Channel Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredChannels.map((channel, index) => (
              <MiChannelCard
                key={channel.id}
                channel={channel}
                isPlaying={currentChannel?.id === channel.id}
                isFavorite={favorites.has(channel.id)}
                isFocused={index === focusedIndex}
                onPlay={() => onChannelSelect(channel)}
                onToggleFavorite={() => onToggleFavorite(channel.id)}
              />
            ))}
          </div>

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
    </div>
  );
};
