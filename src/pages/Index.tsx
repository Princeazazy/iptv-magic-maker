import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIPTV, Channel } from '@/hooks/useIPTV';
import { MiHomeScreen } from '@/components/MiHomeScreen';
import { MiLiveTVList } from '@/components/MiLiveTVList';
import { MiMediaGrid } from '@/components/MiMediaGrid';
import { MiMovieDetail } from '@/components/MiMovieDetail';
import { MiSettingsPage } from '@/components/MiSettingsPage';
import { MiFullscreenPlayer } from '@/components/MiFullscreenPlayer';
import { ArabiaIntro } from '@/components/ArabiaIntro';
import { GlobalSearchModal } from '@/components/GlobalSearchModal';
import { useToast } from '@/hooks/use-toast';
import arabiaLogo from '@/assets/arabia-logo.png';

type Screen = 'home' | 'live' | 'movies' | 'series' | 'sports' | 'settings' | 'detail';

const Index = () => {
  const [playlistVersion, setPlaylistVersion] = useState(0);
  const { channels, loading, error, refresh } = useIPTV();

  // Always show intro before home on each app load
  const [showIntro, setShowIntro] = useState(true);

  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [selectedItem, setSelectedItem] = useState<Channel | null>(null);
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  // Filter channels by current screen category
  const filteredChannelsByCategory = useMemo(() => {
    if (currentScreen === 'home' || currentScreen === 'settings' || currentScreen === 'detail') {
      return channels;
    }

    // "Live" should include all live streams (including sports)
    if (currentScreen === 'live') {
      return channels.filter((ch) => ch.type === 'live' || ch.type === 'sports' || !ch.type);
    }

    return channels.filter((ch) => ch.type === currentScreen);
  }, [channels, currentScreen]);

  // Count channels by type
  const liveCount = useMemo(
    () => channels.filter((ch) => ch.type === 'live' || ch.type === 'sports' || !ch.type).length,
    [channels],
  );
  const movieCount = useMemo(() => channels.filter((ch) => ch.type === 'movies').length, [channels]);
  const seriesCount = useMemo(() => channels.filter((ch) => ch.type === 'series').length, [channels]);
  const sportsCount = useMemo(() => channels.filter((ch) => ch.type === 'sports').length, [channels]);

  const handlePlaylistChange = useCallback(() => {
    setPlaylistVersion(v => v + 1);
    window.location.reload();
  }, []);

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
    if (!channelId) {
      setShowFavoritesOnly(!showFavoritesOnly);
      return;
    }

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

  const handleChannelSelect = (channel: Channel) => {
    setCurrentChannel(channel);
    setIsFullscreen(true);
  };

  const handleItemSelect = (item: Channel) => {
    setSelectedItem(item);
    setPreviousScreen(currentScreen);
    setCurrentScreen('detail');
  };

  const handleSearchItemSelect = (item: Channel) => {
    setSelectedItem(item);
    setPreviousScreen('home');
    setCurrentScreen('detail');
  };

  const handlePlayFromDetail = () => {
    if (selectedItem) {
      setCurrentChannel(selectedItem);
      setIsFullscreen(true);
    }
  };

  const handleNextChannel = () => {
    if (!currentChannel) return;
    const currentIndex = filteredChannelsByCategory.findIndex((c) => c.id === currentChannel.id);
    if (currentIndex < filteredChannelsByCategory.length - 1) {
      setCurrentChannel(filteredChannelsByCategory[currentIndex + 1]);
    }
  };

  const handlePreviousChannel = () => {
    if (!currentChannel) return;
    const currentIndex = filteredChannelsByCategory.findIndex((c) => c.id === currentChannel.id);
    if (currentIndex > 0) {
      setCurrentChannel(filteredChannelsByCategory[currentIndex - 1]);
    }
  };

  const handleNavigate = useCallback((section: 'live' | 'movies' | 'series' | 'sports' | 'settings') => {
    // Navigate immediately; heavy lists render progressively inside their screens
    setCurrentScreen(section);
  }, []);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  // Show intro video first (once per session)
  if (showIntro) {
    return <ArabiaIntro onComplete={handleIntroComplete} />;
  }

  // Loading state removed - app proceeds directly to home screen

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="flex items-center justify-center mb-6">
            <img src={arabiaLogo} alt="Arabia" className="h-20 w-auto opacity-50" />
          </div>
          <p className="text-destructive mb-2 font-semibold text-lg">Failed to load channels</p>
          <p className="text-muted-foreground text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen player overlay
  if (isFullscreen && currentChannel) {
    return (
      <MiFullscreenPlayer
        channel={currentChannel}
        isFavorite={favorites.has(currentChannel.id)}
        onClose={() => setIsFullscreen(false)}
        onNext={handleNextChannel}
        onPrevious={handlePreviousChannel}
        onToggleFavorite={() => handleToggleFavorite(currentChannel.id)}
      />
    );
  }

  // Render screens based on current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <MiHomeScreen
            channelCount={liveCount}
            movieCount={movieCount}
            seriesCount={seriesCount}
            sportsCount={sportsCount}
            loading={loading}
            onNavigate={handleNavigate}
            onReload={handleReload}
            onCatchUp={refresh}
            onSearchClick={() => setIsSearchOpen(true)}
            onVoiceSearchClick={() => setIsSearchOpen(true)}
          />
        );

    case 'settings':
      return (
        <MiSettingsPage 
          onBack={() => setCurrentScreen('home')} 
          onPlaylistChange={handlePlaylistChange}
        />
      );

    case 'detail':
      if (selectedItem) {
        return (
          <MiMovieDetail
            item={selectedItem}
            onBack={() => setCurrentScreen(previousScreen as Screen)}
            onPlay={handlePlayFromDetail}
            onToggleFavorite={() => handleToggleFavorite(selectedItem.id)}
            isFavorite={favorites.has(selectedItem.id)}
          />
        );
      }
      return null;

    case 'movies':
    case 'series':
      return (
        <div className="h-screen bg-background overflow-hidden">
          <MiMediaGrid
            items={filteredChannelsByCategory}
            favorites={favorites}
            onItemSelect={handleItemSelect}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => setCurrentScreen('home')}
            category={currentScreen}
          />
        </div>
      );

    case 'live':
    case 'sports':
      return (
        <div className="h-screen bg-background overflow-hidden">
          <MiLiveTVList
            channels={filteredChannelsByCategory}
            currentChannel={currentChannel}
            favorites={favorites}
            searchQuery={searchQuery}
            showFavoritesOnly={showFavoritesOnly}
            onChannelSelect={handleChannelSelect}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => setCurrentScreen('home')}
            category={currentScreen}
          />
        </div>
      );

      default:
        return (
          <MiHomeScreen
            channelCount={liveCount}
            movieCount={movieCount}
            seriesCount={seriesCount}
            sportsCount={sportsCount}
            loading={loading}
            onNavigate={handleNavigate}
            onReload={handleReload}
            onCatchUp={refresh}
            onSearchClick={() => setIsSearchOpen(true)}
            onVoiceSearchClick={() => setIsSearchOpen(true)}
          />
        );
    }
  };

  return (
    <>
      {renderScreen()}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        channels={channels}
        onChannelSelect={handleChannelSelect}
        onItemSelect={handleSearchItemSelect}
      />
    </>
  );
};

export default Index;
