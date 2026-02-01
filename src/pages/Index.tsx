import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useIPTV, Channel } from '@/hooks/useIPTV';
import { useAppNavigation, Screen } from '@/hooks/useAppNavigation';
import { MiHomeScreen } from '@/components/MiHomeScreen';
import { MiLiveTVList } from '@/components/MiLiveTVList';
import { MiMediaGrid } from '@/components/MiMediaGrid';
import { MiMovieDetail } from '@/components/MiMovieDetail';
import { MiSeriesDetail } from '@/components/MiSeriesDetail';
import { MiSettingsPage } from '@/components/MiSettingsPage';
import { MiFullscreenPlayer } from '@/components/MiFullscreenPlayer';
import { MiniPlayer } from '@/components/MiniPlayer';
import { ArabiaIntro } from '@/components/ArabiaIntro';
import { GlobalSearchModal } from '@/components/GlobalSearchModal';
import { BackgroundMusic } from '@/components/BackgroundMusic';
import { MiCatchUpPage } from '@/components/MiCatchUpPage';
import { TMDBDetailModal } from '@/components/TMDBDetailModal';
import { TMDBItem } from '@/hooks/useTMDB';
import arabiaLogo from '@/assets/arabia-logo.png';

const Index = () => {
  const [playlistVersion, setPlaylistVersion] = useState(0);
  const { channels, loading, error, refresh } = useIPTV();
  const [showIntro, setShowIntro] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const nav = useAppNavigation();

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  // Filter channels by current screen category
  const filteredChannelsByCategory = useMemo(() => {
    if (nav.currentScreen === 'home' || nav.currentScreen === 'settings' || nav.currentScreen === 'detail') {
      return channels;
    }
    if (nav.currentScreen === 'live') {
      return channels.filter((ch) => ch.type === 'live' || !ch.type);
    }
    return channels.filter((ch) => ch.type === nav.currentScreen);
  }, [channels, nav.currentScreen]);

  // Count channels by type
  const liveCount = useMemo(() => channels.filter((ch) => ch.type === 'live' || !ch.type).length, [channels]);
  const movieCount = useMemo(() => channels.filter((ch) => ch.type === 'movies').length, [channels]);
  const seriesCount = useMemo(() => channels.filter((ch) => ch.type === 'series').length, [channels]);
  const sportsCount = useMemo(() => channels.filter((ch) => ch.type === 'sports').length, [channels]);

  const handlePlaylistChange = useCallback(() => {
    setPlaylistVersion(v => v + 1);
    window.location.reload();
  }, []);

  // Auto-refresh channels every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => refresh(), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleNextChannel = useCallback(() => {
    if (!nav.currentChannel) return;
    const currentIndex = filteredChannelsByCategory.findIndex((c) => c.id === nav.currentChannel?.id);
    if (currentIndex < filteredChannelsByCategory.length - 1) {
      nav.handleChannelSelect(filteredChannelsByCategory[currentIndex + 1]);
    }
  }, [nav, filteredChannelsByCategory]);

  const handlePreviousChannel = useCallback(() => {
    if (!nav.currentChannel) return;
    const currentIndex = filteredChannelsByCategory.findIndex((c) => c.id === nav.currentChannel?.id);
    if (currentIndex > 0) {
      nav.handleChannelSelect(filteredChannelsByCategory[currentIndex - 1]);
    }
  }, [nav, filteredChannelsByCategory]);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  // Normalize title for matching
  const normalizeTitle = useCallback((title: string) =>
    title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim(), []);

  // Find best IPTV match for a TMDB item
  const findIPTVMatch = useCallback((tmdbTitle: string, tmdbYear: string | undefined, mediaType: 'movie' | 'tv') => {
    const searchTitle = normalizeTitle(tmdbTitle);
    const contentPool = channels.filter(ch => {
      if (mediaType === 'tv') {
        return ch.type === 'series' || ch.url?.includes('/series/');
      } else {
        return ch.type === 'movies' || ch.url?.includes('/movie/');
      }
    });

    let bestMatch: Channel | null = null;
    let bestScore = 0;

    for (const channel of contentPool) {
      const channelTitle = normalizeTitle(channel.name);
      let score = 0;

      if (channelTitle === searchTitle) {
        score = 100;
      } else if (channelTitle.startsWith(searchTitle + ' ') || channelTitle === searchTitle) {
        score = 95;
      } else if (channelTitle.includes(searchTitle)) {
        score = 85;
      } else {
        const searchWords = searchTitle.split(' ').filter(w => w.length > 2);
        const channelWords = channelTitle.split(' ').filter(w => w.length > 2);
        const exactMatches = searchWords.filter(sw => channelWords.some(cw => cw === sw)).length;
        if (searchWords.length > 0 && exactMatches / searchWords.length >= 0.7) {
          score = (exactMatches / searchWords.length) * 75;
        }
      }

      if (score >= 60 && tmdbYear && channel.name.includes(tmdbYear)) {
        score += 10;
      }

      if (score > bestScore && score >= 60) {
        bestScore = score;
        bestMatch = channel;
      }
    }

    return bestMatch;
  }, [channels, normalizeTitle]);

  // Handle TMDB item selection
  const handleTMDBSelect = useCallback((item: TMDBItem) => {
    const match = findIPTVMatch(item.title, item.year, item.mediaType);
    if (match) {
      nav.handleItemSelect(match, 'home');
    } else {
      nav.setSelectedTMDBItem(item);
    }
  }, [findIPTVMatch, nav]);

  // Handle playing IPTV match from TMDB modal
  const handlePlayIPTVFromTMDB = useCallback((channel: Channel) => {
    nav.setSelectedTMDBItem(null);
    nav.handleItemSelect(channel, 'home');
  }, [nav]);

  // Show intro
  if (showIntro) {
    return <ArabiaIntro onComplete={handleIntroComplete} />;
  }

  // Error state
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
  if (nav.isFullscreen && nav.currentChannel) {
    const isSeries = nav.currentChannel.type === 'series' ||
      nav.currentChannel.group?.toLowerCase().includes('series') ||
      nav.currentChannel.url?.includes('/series/');

    const isLiveTV = nav.currentChannel.type === 'live' ||
      nav.currentChannel.type === 'sports' ||
      (!nav.currentChannel.type && !nav.currentChannel.url?.includes('/movie/') && !nav.currentChannel.url?.includes('/series/'));

    return (
      <MiFullscreenPlayer
        channel={nav.currentChannel}
        isFavorite={nav.favorites.has(nav.currentChannel.id)}
        onClose={() => nav.handleCloseFullscreen(isLiveTV)}
        onNext={handleNextChannel}
        onPrevious={handlePreviousChannel}
        onToggleFavorite={() => nav.handleToggleFavorite(nav.currentChannel!.id)}
        allChannels={filteredChannelsByCategory}
        onSelectChannel={(channel) => nav.handleChannelSelect(channel)}
        onNextEpisode={isSeries ? nav.handleNextEpisode : undefined}
        onPreviousEpisode={isSeries ? nav.handlePreviousEpisode : undefined}
        hasNextEpisode={isSeries && nav.currentEpisodeIndex < nav.currentEpisodeList.length - 1}
        hasPreviousEpisode={isSeries && nav.currentEpisodeIndex > 0}
      />
    );
  }

  // Render screens
  const renderScreen = () => {
    switch (nav.currentScreen) {
      case 'home':
        return (
          <MiHomeScreen
            channelCount={liveCount}
            movieCount={movieCount}
            seriesCount={seriesCount}
            sportsCount={sportsCount}
            loading={loading}
            onNavigate={nav.handleNavigate}
            onReload={handleReload}
            onCatchUp={nav.handleOpenCatchUp}
            onSearchClick={() => nav.setIsSearchOpen(true)}
            onVoiceSearchClick={() => nav.setIsSearchOpen(true)}
            onContinueWatchingSelect={nav.handleContinueWatchingSelect}
            onTMDBSelect={handleTMDBSelect}
          />
        );

      case 'catchup':
        return (
          <MiCatchUpPage
            onSelect={nav.handleCatchUpSelect}
            onBack={() => nav.setCurrentScreen('home')}
          />
        );

      case 'settings':
        return (
          <MiSettingsPage
            onBack={() => nav.setCurrentScreen('home')}
            onPlaylistChange={handlePlaylistChange}
          />
        );

      case 'detail':
        if (nav.selectedItem) {
          return (
            <MiMovieDetail
              item={nav.selectedItem}
              onBack={() => nav.setCurrentScreen(nav.previousScreen as Screen)}
              onPlay={nav.handlePlayFromDetail}
              onToggleFavorite={() => nav.handleToggleFavorite(nav.selectedItem!.id)}
              isFavorite={nav.favorites.has(nav.selectedItem.id)}
            />
          );
        }
        return null;

      case 'series-detail':
        if (nav.selectedItem) {
          return (
            <MiSeriesDetail
              item={nav.selectedItem}
              onBack={() => nav.setCurrentScreen(nav.previousScreen as Screen)}
              onPlayEpisode={nav.handlePlayEpisode}
              onToggleFavorite={() => nav.handleToggleFavorite(nav.selectedItem!.id)}
              isFavorite={nav.favorites.has(nav.selectedItem.id)}
            />
          );
        }
        return null;

      case 'movies':
      case 'series':
        return (
          <div className="h-screen bg-background overflow-hidden">
            <MiMediaGrid
              key={nav.currentScreen}
              items={filteredChannelsByCategory}
              favorites={nav.favorites}
              onItemSelect={(item) => nav.handleItemSelect(item, nav.currentScreen)}
              onToggleFavorite={nav.handleToggleFavorite}
              onBack={() => nav.setCurrentScreen('home')}
              category={nav.currentScreen}
            />
          </div>
        );

      case 'live':
      case 'sports':
        return (
          <div className="h-screen bg-background overflow-hidden">
            <MiLiveTVList
              key={nav.currentScreen}
              channels={filteredChannelsByCategory}
              currentChannel={nav.currentChannel}
              favorites={nav.favorites}
              searchQuery={searchQuery}
              showFavoritesOnly={showFavoritesOnly}
              onChannelSelect={nav.handleChannelSelect}
              onToggleFavorite={nav.handleToggleFavorite}
              onBack={() => nav.setCurrentScreen('home')}
              category={nav.currentScreen}
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
            onNavigate={nav.handleNavigate}
            onReload={handleReload}
            onCatchUp={nav.handleOpenCatchUp}
            onSearchClick={() => nav.setIsSearchOpen(true)}
            onVoiceSearchClick={() => nav.setIsSearchOpen(true)}
            onContinueWatchingSelect={nav.handleContinueWatchingSelect}
            onTMDBSelect={handleTMDBSelect}
          />
        );
    }
  };

  return (
    <>
      {renderScreen()}

      <BackgroundMusic
        src="/audio/arabian-ambient.mp3"
        autoPlay={!nav.isFullscreen}
        defaultVolume={0.25}
      />

      <AnimatePresence>
        {nav.showMiniPlayer && nav.currentChannel && nav.currentScreen !== 'home' && (
          <MiniPlayer
            channel={nav.currentChannel}
            onExpand={() => {
              nav.handleChannelSelect(nav.currentChannel!);
            }}
            onClose={() => nav.handleCloseFullscreen(false)}
          />
        )}
      </AnimatePresence>

      <GlobalSearchModal
        isOpen={nav.isSearchOpen}
        onClose={() => nav.setIsSearchOpen(false)}
        channels={channels}
        onChannelSelect={nav.handleChannelSelect}
        onItemSelect={nav.handleSearchItemSelect}
      />

      {nav.selectedTMDBItem && (
        <TMDBDetailModal
          item={nav.selectedTMDBItem}
          allChannels={channels}
          onClose={() => nav.setSelectedTMDBItem(null)}
          onPlayIPTV={handlePlayIPTVFromTMDB}
        />
      )}
    </>
  );
};

export default Index;
