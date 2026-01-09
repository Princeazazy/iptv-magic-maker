import { useState, useEffect } from 'react';
import { ChevronLeft, User, Shield, ListVideo, Trash2, Cloud, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface MiSettingsPageProps {
  onBack: () => void;
  onPlaylistChange?: () => void;
}

const PLAYLIST_STORAGE_KEY = 'mi-player-playlist-url';

export const getStoredPlaylistUrl = (): string => {
  return localStorage.getItem(PLAYLIST_STORAGE_KEY) || '';
};

export const MiSettingsPage = ({ onBack, onPlaylistChange }: MiSettingsPageProps) => {
  const [time, setTime] = useState(new Date());
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load saved playlist URL
    const saved = getStoredPlaylistUrl();
    if (saved) {
      setPlaylistUrl(saved);
    }
  }, []);

  const handleSavePlaylist = () => {
    if (playlistUrl.trim()) {
      localStorage.setItem(PLAYLIST_STORAGE_KEY, playlistUrl.trim());
      toast.success('Playlist saved! Channels will load on native app.');
      setShowPlaylistDialog(false);
      onPlaylistChange?.();
    } else {
      toast.error('Please enter a valid M3U URL');
    }
  };

  const handleDeleteCache = () => {
    // Clear cached data
    localStorage.removeItem('mi-player-favorites');
    localStorage.removeItem('mi-player-last-channel');
    toast.success('Cache cleared successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-6">
        {/* Back & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        </div>

        {/* Logo */}
        <div className="flex items-center">
          <span className="text-3xl font-bold">
            <span className="text-primary">m</span>
            <span className="text-accent">i</span>
          </span>
          <span className="text-muted-foreground text-lg ml-3">Player Pro</span>
        </div>

        {/* Time & Weather */}
        <div className="flex items-center gap-6">
          <span className="text-foreground font-medium text-lg">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cloud className="w-5 h-5" />
            <span>24°</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-10 py-12">
        <div className="max-w-5xl mx-auto flex gap-8">
          {/* User Profile Card */}
          <div className="flex-1 bg-card rounded-2xl p-8 border border-border/30">
            <div className="flex items-center gap-6 mb-8">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-full bg-primary overflow-hidden ring-4 ring-primary/30">
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <User className="w-14 h-14 text-primary-foreground" />
                </div>
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-2xl font-bold text-foreground">Mohammad Reza</h2>
                <p className="text-muted-foreground">mrfarahzad@gmail.com</p>
              </div>
            </div>

            {/* Account Button */}
            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground font-medium">Account</span>
            </button>
          </div>

          {/* Settings Options */}
          <div className="flex-1 space-y-4">
            {/* Parent Control */}
            <button className="w-full flex items-center gap-4 px-6 py-5 bg-card rounded-2xl hover:bg-card/80 transition-colors border border-border/30">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Shield className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-foreground font-medium text-lg">Parent Control</span>
            </button>

            {/* Change Playlist */}
            <button 
              onClick={() => setShowPlaylistDialog(true)}
              className="w-full flex items-center gap-4 px-6 py-5 bg-card rounded-2xl hover:bg-card/80 transition-colors border border-border/30"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <ListVideo className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-foreground font-medium text-lg block">Change Playlist</span>
                {playlistUrl && (
                  <span className="text-muted-foreground text-sm truncate block max-w-xs">
                    {playlistUrl.includes('?') ? playlistUrl.split('?')[0] + '...' : playlistUrl}
                  </span>
                )}
              </div>
              {playlistUrl && <Check className="w-5 h-5 text-accent" />}
            </button>

            {/* Delete Cache */}
            <button 
              onClick={handleDeleteCache}
              className="w-full flex items-center gap-4 px-6 py-5 bg-card rounded-2xl hover:bg-card/80 transition-colors border border-border/30"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-foreground font-medium text-lg">Delete Cache</span>
            </button>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-muted-foreground text-sm mt-16">Version 1.1.1</p>
      </main>

      {/* Playlist Dialog */}
      <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}>
        <DialogContent className="bg-card border-border/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">Change Playlist</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">M3U Playlist URL</label>
              <Input
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder="http://example.com/playlist.m3u"
                className="bg-secondary border-border/50 h-12 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> In the web preview, demo channels are shown because most IPTV providers block browser requests. 
                Your real playlist will work perfectly in the native Android/iOS app.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPlaylistDialog(false)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
              >
                <X className="w-5 h-5" />
                <span className="font-medium">Cancel</span>
              </button>
              <button
                onClick={handleSavePlaylist}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
              >
                <Check className="w-5 h-5" />
                <span className="font-medium">Save Playlist</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};