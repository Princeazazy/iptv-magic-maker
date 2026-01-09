import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useIPTV, Channel } from '@/hooks/useIPTV';
import { MiHeader } from '@/components/MiHeader';
import { MiSidebar } from '@/components/MiSidebar';
import { MiChannelList } from '@/components/MiChannelList';
import { MiVideoPlayer } from '@/components/MiVideoPlayer';
import { useToast } from '@/hooks/use-toast';

const IPTV_URL = 'http://myhand.org:8080/get.php?username=25370763999522&password=34479960743076&type=m3u_plus&output=ts';

type NavItem = 'live' | 'movies' | 'series' | 'sports' | 'favorites' | 'settings';

const Index = () => {
  const { channels, loading, error } = useIPTV(IPTV_URL);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeNav, setActiveNav] = useState<NavItem>('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedFavorites = localStorage.getItem('iptv-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('iptv-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const handleToggleFavorite = (channelId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(channelId)) {
        newFavorites.delete(channelId);
        toast({
          title: 'Removed from favorites',
          duration: 2000,
        });
      } else {
        newFavorites.add(channelId);
        toast({
          title: 'Added to favorites',
          duration: 2000,
        });
      }
      return newFavorites;
    });
  };

  const handleNavSelect = (item: NavItem) => {
    setActiveNav(item);
    if (item === 'favorites') {
      setShowFavoritesOnly(true);
    } else {
      setShowFavoritesOnly(false);
    }
  };

  const handleFavoritesClick = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    if (!showFavoritesOnly) {
      setActiveNav('favorites');
    } else {
      setActiveNav('live');
    }
  };

  const getNavTitle = () => {
    switch (activeNav) {
      case 'live': return "Live TV's";
      case 'movies': return 'Movies';
      case 'series': return 'Series';
      case 'sports': return 'Sports Guide';
      case 'favorites': return 'Favorites';
      case 'settings': return 'Settings';
      default: return "Live TV's";
    }
  };

  const handleNextChannel = () => {
    if (!currentChannel) return;
    const currentIndex = channels.findIndex(c => c.id === currentChannel.id);
    if (currentIndex < channels.length - 1) {
      setCurrentChannel(channels[currentIndex + 1]);
    }
  };

  const handlePreviousChannel = () => {
    if (!currentChannel) return;
    const currentIndex = channels.findIndex(c => c.id === currentChannel.id);
    if (currentIndex > 0) {
      setCurrentChannel(channels[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">Mi</span>
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive font-bold text-xl">!</span>
          </div>
          <p className="text-destructive mb-2 font-semibold">Failed to load channels</p>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <MiSidebar
        activeItem={activeNav}
        onItemSelect={handleNavSelect}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <MiHeader
          title={getNavTitle()}
          onSearchChange={setSearchQuery}
          onFavoritesClick={handleFavoritesClick}
          showFavorites={showFavoritesOnly}
        />

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Player (when channel selected) */}
          {currentChannel && (
            <div className="w-full lg:w-1/2 xl:w-2/5 p-4 flex flex-col">
              <MiVideoPlayer
                channel={currentChannel}
                onClose={() => setCurrentChannel(null)}
                onNext={handleNextChannel}
                onPrevious={handlePreviousChannel}
              />
            </div>
          )}

          {/* Channel List */}
          <div className={`flex-1 overflow-hidden ${currentChannel ? 'hidden lg:block' : ''}`}>
            <MiChannelList
              channels={channels}
              currentChannel={currentChannel}
              favorites={favorites}
              searchQuery={searchQuery}
              showFavoritesOnly={showFavoritesOnly}
              onChannelSelect={setCurrentChannel}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
