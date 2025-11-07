import { useState, useMemo, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChannelCard } from './ChannelCard';
import { Channel } from '@/hooks/useIPTV';

interface ChannelListProps {
  channels: Channel[];
  currentChannel: Channel | null;
  favorites: Set<string>;
  onChannelSelect: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
}

export const ChannelList = ({
  channels,
  currentChannel,
  favorites,
  onChannelSelect,
  onToggleFavorite,
}: ChannelListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const groups = useMemo(() => {
    const uniqueGroups = new Set(channels.map((ch) => ch.group || 'Uncategorized'));
    return Array.from(uniqueGroups).sort();
  }, [channels]);

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      const matchesSearch = channel.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesGroup =
        selectedGroup === 'all' || channel.group === selectedGroup;
      const matchesFavorites = !showFavoritesOnly || favorites.has(channel.id);

      return matchesSearch && matchesGroup && matchesFavorites;
    });
  }, [channels, searchQuery, selectedGroup, showFavoritesOnly, favorites]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredChannels.length === 0) return;

      const cols = window.innerWidth >= 1280 ? 6 : window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 4 : 3;

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

  // Reset focused index when filters change
  useEffect(() => {
    setFocusedIndex(0);
  }, [searchQuery, selectedGroup, showFavoritesOnly]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
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
        <Button
          variant={showFavoritesOnly ? 'default' : 'outline'}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="w-full sm:w-auto"
        >
          Favorites {favorites.size > 0 && `(${favorites.size})`}
        </Button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredChannels.map((channel, index) => (
          <ChannelCard
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
        <div className="text-center py-12">
          <p className="text-muted-foreground">No channels found</p>
        </div>
      )}
    </div>
  );
};
