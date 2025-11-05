import { useState, useEffect } from 'react';
import { Tv, Loader2, Link, Settings } from 'lucide-react';
import { useIPTV, Channel } from '@/hooks/useIPTV';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ChannelList } from '@/components/ChannelList';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Index = () => {
  const [m3uUrl, setM3uUrl] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const { channels, loading, error } = useIPTV(m3uUrl);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const savedUrl = localStorage.getItem('iptv-m3u-url');
    if (savedUrl) {
      setM3uUrl(savedUrl);
      setUrlInput(savedUrl);
    }
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

  const handleSaveUrl = () => {
    if (urlInput.trim()) {
      localStorage.setItem('iptv-m3u-url', urlInput.trim());
      setM3uUrl(urlInput.trim());
      setShowSettings(false);
      toast({
        title: 'M3U URL saved',
        description: 'Loading channels...',
        duration: 2000,
      });
    }
  };

  // Show welcome screen if no URL is configured
  if (!m3uUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Tv className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">IPTV Magic</h1>
              <p className="text-muted-foreground">
                Enter your M3U playlist URL to start watching
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <Input
              type="url"
              placeholder="https://example.com/playlist.m3u"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveUrl()}
            />
            <Button onClick={handleSaveUrl} className="w-full" disabled={!urlInput.trim()}>
              <Link className="w-4 h-4 mr-2" />
              Load Channels
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
          <div className="flex items-center justify-between">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
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

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>M3U Playlist Settings</DialogTitle>
            <DialogDescription>
              Update your M3U playlist URL
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="url"
              placeholder="https://example.com/playlist.m3u"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveUrl()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUrl} disabled={!urlInput.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
