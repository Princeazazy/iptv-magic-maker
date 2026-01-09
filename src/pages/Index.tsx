import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useIPTV, Channel } from '@/hooks/useIPTV';
import { MiHomeScreen } from '@/components/MiHomeScreen';
import { MiLiveTVList } from '@/components/MiLiveTVList';
import { MiSettingsPage } from '@/components/MiSettingsPage';
import { MiFullscreenPlayer } from '@/components/MiFullscreenPlayer';
import { useToast } from '@/hooks/use-toast';

const IPTV_URL = 'http://myhand.org:8080/get.php?username=25370763999522&password=34479960743076&type=m3u_plus&output=ts';

type Screen = 'home' | 'live' | 'movies' | 'series' | 'sports' | 'settings';

const Index = () => {
  const { channels, loading, error } = useIPTV(IPTV_URL);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    if (!channelId) {
      // Toggle favorites view mode
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

  const handleNextChannel = () => {
    if (!currentChannel) return;
    const currentIndex = channels.findIndex((c) => c.id === currentChannel.id);
    if (currentIndex < channels.length - 1) {
      setCurrentChannel(channels[currentIndex + 1]);
    }
  };

  const handlePreviousChannel = () => {
    if (!currentChannel) return;
    const currentIndex = channels.findIndex((c) => c.id === currentChannel.id);
    if (currentIndex > 0) {
      setCurrentChannel(channels[currentIndex - 1]);
    }
  };

  const handleNavigate = (section: 'live' | 'movies' | 'series' | 'sports' | 'settings') => {
    setCurrentScreen(section);
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="text-primary font-bold text-4xl">
              <span className="text-primary">M</span>
              <span className="text-[#FF6B35]">i</span>
            </div>
            <span className="text-muted-foreground text-lg ml-2">Player Pro</span>
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
          <div className="flex items-center justify-center mb-4">
            <div className="text-destructive font-bold text-4xl">
              <span>M</span>
              <span>i</span>
            </div>
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
  switch (currentScreen) {
    case 'home':
      return (
        <MiHomeScreen
          channelCount={channels.length}
          onNavigate={handleNavigate}
          onReload={handleReload}
        />
      );

    case 'settings':
      return <MiSettingsPage onBack={() => setCurrentScreen('home')} />;

    case 'live':
    case 'movies':
    case 'series':
    case 'sports':
      return (
        <div className="h-screen bg-background overflow-hidden">
          <MiLiveTVList
            channels={channels}
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
          channelCount={channels.length}
          onNavigate={handleNavigate}
          onReload={handleReload}
        />
      );
  }
};

export default Index;
