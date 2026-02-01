import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useIPTV, Channel } from '@/hooks/useIPTV';
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
import { WatchProgress, getChannelProgress } from '@/hooks/useWatchProgress';
import { TMDBItem } from '@/hooks/useTMDB';

import { useToast } from '@/hooks/use-toast';
import arabiaLogo from '@/assets/arabia-logo.png';

type Screen = 'home' | 'live' | 'movies' | 'series' | 'sports' | 'settings' | 'detail' | 'series-detail' | 'catchup';

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
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTMDBItem, setSelectedTMDBItem] = useState<TMDBItem | null>(null);
  
  // Episode navigation state for series
  const [currentEpisodeList, setCurrentEpisodeList] = useState<Array<{ url: string; title: string }>>([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  
  const { toast } = useToast();

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  // Filter channels by current screen category
  const filteredChannelsByCategory = useMemo(() => {
    if (currentScreen === 'home' || currentScreen === 'settings' || currentScreen === 'detail') {
      return channels;
    }

    // "Live" should be NON-sports live TV (sports live streams live in the Sports Guide)
    if (currentScreen === 'live') {
      return channels.filter((ch) => ch.type === 'live' || !ch.type);
    }

    return channels.filter((ch) => ch.type === currentScreen);
  }, [channels, currentScreen]);

  // Count channels by type
  const liveCount = useMemo(() => channels.filter((ch) => ch.type === 'live' || !ch.type).length, [channels]);
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

  // Auto-refresh channels every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 30 * 60 * 1000); // 30 minutes in milliseconds

    return () => clearInterval(interval);
  }, [refresh]);

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
    setShowMiniPlayer(false);
    setIsFullscreen(true);
  };

  // Handle playing from CatchUp page
  const handleCatchUpSelect = useCallback((item: WatchProgress) => {
    const channelToPlay: Channel = {
      id: item.channelId,
      name: item.channelName,
      url: item.url || '',
      logo: item.logo,
      group: item.group,
      type: item.contentType === 'movie' ? 'movies' : 
            item.contentType === 'series' ? 'series' : 
            item.contentType === 'sports' ? 'sports' : 'live',
    };
    handleChannelSelect(channelToPlay);
  }, []);

  // Handle playing from Continue Watching sidebar
  const handleContinueWatchingSelect = useCallback((channelId: string) => {
    const progress = getChannelProgress(channelId);
    if (!progress) return;

    const channelToPlay: Channel = {
      id: progress.channelId,
      name: progress.channelName,
      url: progress.url || '',
      logo: progress.logo,
      group: progress.group,
      type: progress.contentType === 'movie' ? 'movies' : 
            progress.contentType === 'series' ? 'series' : 
            progress.contentType === 'sports' ? 'sports' : 'live',
    };
    handleChannelSelect(channelToPlay);
  }, []);

  // Navigate to CatchUp page
  const handleOpenCatchUp = useCallback(() => {
    setCurrentScreen('catchup');
  }, []);

  const handleItemSelect = (item: Channel) => {
    setSelectedItem(item);
    setPreviousScreen(currentScreen);
    // Use series-detail screen for series items
    if (item.type === 'series') {
      setCurrentScreen('series-detail');
    } else {
      setCurrentScreen('detail');
    }
  };

  const handleSearchItemSelect = (item: Channel) => {
    setSelectedItem(item);
    setPreviousScreen('home');
    // Use series-detail screen for series items
    if (item.type === 'series') {
      setCurrentScreen('series-detail');
    } else {
      setCurrentScreen('detail');
    }
  };

  const handlePlayFromDetail = () => {
    if (selectedItem) {
      setCurrentChannel(selectedItem);
      setIsFullscreen(true);
    }
  };

  // Handle playing a specific episode from series detail
  const handlePlayEpisode = useCallback((
    episodeUrl: string, 
    episodeTitle: string, 
    episodeList?: Array<{ url: string; title: string }>,
    episodeIndex?: number
  ) => {
    if (selectedItem) {
      // Create a temporary channel object for the episode
      const episodeChannel: Channel = {
        ...selectedItem,
        url: episodeUrl,
        name: `${selectedItem.name} - ${episodeTitle}`,
      };
      setCurrentChannel(episodeChannel);
      
      // Track episode list for navigation
      if (episodeList && episodeIndex !== undefined) {
        setCurrentEpisodeList(episodeList);
        setCurrentEpisodeIndex(episodeIndex);
      }
      
      setIsFullscreen(true);
    }
  }, [selectedItem]);

  // Episode navigation handlers
  const handleNextEpisode = useCallback(() => {
    if (currentEpisodeList.length === 0 || !selectedItem) return;
    const nextIndex = currentEpisodeIndex + 1;
    if (nextIndex < currentEpisodeList.length) {
      const nextEpisode = currentEpisodeList[nextIndex];
      const episodeChannel: Channel = {
        ...selectedItem,
        url: nextEpisode.url,
        name: `${selectedItem.name} - ${nextEpisode.title}`,
      };
      setCurrentChannel(episodeChannel);
      setCurrentEpisodeIndex(nextIndex);
    }
  }, [currentEpisodeList, currentEpisodeIndex, selectedItem]);

  const handlePreviousEpisode = useCallback(() => {
    if (currentEpisodeList.length === 0 || !selectedItem) return;
    const prevIndex = currentEpisodeIndex - 1;
    if (prevIndex >= 0) {
      const prevEpisode = currentEpisodeList[prevIndex];
      const episodeChannel: Channel = {
        ...selectedItem,
        url: prevEpisode.url,
        name: `${selectedItem.name} - ${prevEpisode.title}`,
      };
      setCurrentChannel(episodeChannel);
      setCurrentEpisodeIndex(prevIndex);
    }
  }, [currentEpisodeList, currentEpisodeIndex, selectedItem]);

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

  const handleNavigate = useCallback((section: 'live' | 'movies' | 'series' | 'sports' | 'settings' | 'home') => {
    // Navigate immediately; heavy lists render progressively inside their screens
    setCurrentScreen(section);
    // Hide mini player when going to home
    if (section === 'home') {
      setShowMiniPlayer(false);
      setCurrentChannel(null);
    }
  }, []);

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
    
    // Filter by content type
    const contentPool = channels.filter(ch => {
      if (mediaType === 'tv') {
        return ch.type === 'series' || ch.url?.includes('/series/');
      } else {
        return ch.type === 'movies' || ch.url?.includes('/movie/');
      }
    });
    
    // Score and rank matches
    let bestMatch: Channel | null = null;
    let bestScore = 0;
    
    for (const channel of contentPool) {
      const channelTitle = normalizeTitle(channel.name);
      let score = 0;
      
      // Exact match (highest priority)
      if (channelTitle === searchTitle) {
        score = 100;
      }
      // Channel title starts with or equals search title
      else if (channelTitle.startsWith(searchTitle + ' ') || channelTitle === searchTitle) {
        score = 95;
      }
      // Search title is contained as a complete phrase in channel title
      else if (channelTitle.includes(searchTitle)) {
        score = 85;
      }
      // Word-by-word matching (stricter)
      else {
        const searchWords = searchTitle.split(' ').filter(w => w.length > 2);
        const channelWords = channelTitle.split(' ').filter(w => w.length > 2);
        
        // Count exact word matches
        const exactMatches = searchWords.filter(sw => 
          channelWords.some(cw => cw === sw)
        ).length;
        
        // Require at least 70% of search words to match exactly
        if (searchWords.length > 0 && exactMatches / searchWords.length >= 0.7) {
          score = (exactMatches / searchWords.length) * 75;
        }
      }
      
      // Year bonus (only if score is already decent)
      if (score >= 60 && tmdbYear && channel.name.includes(tmdbYear)) {
        score += 10;
      }
      
      // Higher threshold - require 60+ score for a match
      if (score > bestScore && score >= 60) {
        bestScore = score;
        bestMatch = channel;
      }
    }
    
    return bestMatch;
  }, [channels, normalizeTitle]);

  // Handle TMDB item selection - navigate to detail page
  const handleTMDBSelect = useCallback((item: TMDBItem) => {
    // Find matching IPTV content
    const match = findIPTVMatch(item.title, item.year, item.mediaType);
    
    if (match) {
      // Navigate to appropriate detail page
      setSelectedItem(match);
      setPreviousScreen('home');
      if (item.mediaType === 'tv' || match.type === 'series') {
        setCurrentScreen('series-detail');
      } else {
        setCurrentScreen('detail');
      }
    } else {
      // No match found - show TMDB modal as fallback
      setSelectedTMDBItem(item);
    }
  }, [findIPTVMatch]);

  // Handle playing IPTV match from TMDB modal (fallback)
  const handlePlayIPTVFromTMDB = useCallback((channel: Channel) => {
    setSelectedTMDBItem(null);
    // Navigate to detail page instead of playing directly
    setSelectedItem(channel);
    setPreviousScreen('home');
    if (channel.type === 'series' || channel.url?.includes('/series/')) {
      setCurrentScreen('series-detail');
    } else {
      setCurrentScreen('detail');
    }
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
    const isSeries = currentChannel.type === 'series' || 
                     currentChannel.group?.toLowerCase().includes('series') ||
                     currentChannel.url?.includes('/series/');
    
    const isLiveTV = currentChannel.type === 'live' || 
                     currentChannel.type === 'sports' || 
                     (!currentChannel.type && !currentChannel.url?.includes('/movie/') && !currentChannel.url?.includes('/series/'));
    
    return (
      <MiFullscreenPlayer
        channel={currentChannel}
        isFavorite={favorites.has(currentChannel.id)}
        onClose={() => {
          setIsFullscreen(false);
          // Only show mini player for Live TV, not for movies/series
          if (isLiveTV) {
            setShowMiniPlayer(true);
          } else {
            setShowMiniPlayer(false);
            setCurrentChannel(null);
          }
        }}
        onNext={handleNextChannel}
        onPrevious={handlePreviousChannel}
        onToggleFavorite={() => handleToggleFavorite(currentChannel.id)}
        allChannels={filteredChannelsByCategory}
        onSelectChannel={(channel) => setCurrentChannel(channel)}
        // Series episode navigation
        onNextEpisode={isSeries ? handleNextEpisode : undefined}
        onPreviousEpisode={isSeries ? handlePreviousEpisode : undefined}
        hasNextEpisode={isSeries && currentEpisodeIndex < currentEpisodeList.length - 1}
        hasPreviousEpisode={isSeries && currentEpisodeIndex > 0}
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
            onCatchUp={handleOpenCatchUp}
            onSearchClick={() => setIsSearchOpen(true)}
            onVoiceSearchClick={() => setIsSearchOpen(true)}
            onContinueWatchingSelect={handleContinueWatchingSelect}
            onTMDBSelect={handleTMDBSelect}
          />
        );

      case 'catchup':
        return (
          <MiCatchUpPage
            onSelect={handleCatchUpSelect}
            onBack={() => setCurrentScreen('home')}
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

    case 'series-detail':
      if (selectedItem) {
        return (
          <MiSeriesDetail
            item={selectedItem}
            onBack={() => setCurrentScreen(previousScreen as Screen)}
            onPlayEpisode={handlePlayEpisode}
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
            key={currentScreen}
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
            key={currentScreen}
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
            onCatchUp={handleOpenCatchUp}
            onSearchClick={() => setIsSearchOpen(true)}
            onVoiceSearchClick={() => setIsSearchOpen(true)}
            onContinueWatchingSelect={handleContinueWatchingSelect}
            onTMDBSelect={handleTMDBSelect}
          />
        );
    }
  };


  return (
    <>
      {renderScreen()}
      
      {/* Background Music - plays when not in fullscreen player */}
      <BackgroundMusic 
        src="/audio/arabian-ambient.mp3" 
        autoPlay={!isFullscreen}
        defaultVolume={0.25}
      />
      
      {/* Mini Player (PiP) - shown when user exits fullscreen but channel is still playing (hidden on home) */}
      <AnimatePresence>
        {showMiniPlayer && currentChannel && currentScreen !== 'home' && (
          <MiniPlayer
            channel={currentChannel}
            onExpand={() => {
              setShowMiniPlayer(false);
              setIsFullscreen(true);
            }}
            onClose={() => {
              setShowMiniPlayer(false);
              setCurrentChannel(null);
            }}
          />
        )}
      </AnimatePresence>
      
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        channels={channels}
        onChannelSelect={handleChannelSelect}
        onItemSelect={handleSearchItemSelect}
      />
      
      {/* TMDB Detail Modal */}
      {selectedTMDBItem && (
        <TMDBDetailModal
          item={selectedTMDBItem}
          allChannels={channels}
          onClose={() => setSelectedTMDBItem(null)}
          onPlayIPTV={handlePlayIPTVFromTMDB}
        />
      )}
    </>
  );
};

export default Index;
