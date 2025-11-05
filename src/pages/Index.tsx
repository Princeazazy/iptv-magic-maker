import { useState, useEffect } from 'react';
import { Tv, Loader2 } from 'lucide-react';
import { useIPTV, Channel } from '@/hooks/useIPTV';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ChannelList } from '@/components/ChannelList';
import { useToast } from '@/hooks/use-toast';

const IPTV_URL = 'http://myhand.org:8080/get.php?username=25370763999522&password=34479960743076&type=m3u_plus&output=ts';

const Index = () => {
  const { channels, loading, error } = useIPTV(IPTV_URL);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-destructive mb-2 font-semibold">Failed to load channels</p>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Tv className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">IPTV Magic</h1>
              <p className="text-sm text-muted-foreground">
                {channels.length} channels available
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {currentChannel && (
          <VideoPlayer url={currentChannel.url} title={currentChannel.name} />
        )}

        <ChannelList
          channels={channels}
          currentChannel={currentChannel}
          favorites={favorites}
          onChannelSelect={setCurrentChannel}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>
    </div>
  );
};

export default Index;
