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
import { getStoredPlaylistUrl, setStoredPlaylistUrl } from '@/lib/playlistStorage';
import arabiaLogo from '@/assets/arabia-logo.png';

interface MiSettingsPageProps {
  onBack: () => void;
  onPlaylistChange?: () => void;
}

export const MiSettingsPage = ({ onBack, onPlaylistChange }: MiSettingsPageProps) => {
  const [time, setTime] = useState(new Date());
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = getStoredPlaylistUrl();
    if (saved) {
      setPlaylistUrl(saved);
    }
  }, []);

  const handleSavePlaylist = () => {
    if (playlistUrl.trim()) {
      setStoredPlaylistUrl(playlistUrl.trim());
      toast.success('Playlist saved!');
      setShowPlaylistDialog(false);
      onPlaylistChange?.();
    } else {
      toast.error('Please enter a valid M3U URL');
    }
  };

  const handleDeleteCache = () => {
    localStorage.removeItem('mi-player-favorites');
    localStorage.removeItem('mi-player-last-channel');
    localStorage.removeItem('mi-player-playlist-url');
    toast.success('Cache cleared - reloading with default playlist...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Mock account data from Figma
  const accountData = {
    status: 'Active',
    macAddress: '8f:f7:2f:95:d1',
    deviceKey: '170135',
    expireDate: 'Forever'
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

        {/* Center Logo */}
        <div className="arabia-logo-container">
          <img src={arabiaLogo} alt="Arabia" className="h-24 w-auto arabia-logo-animated" />
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
          {/* Profile */}
          <div className="w-12 h-12 rounded-full bg-primary overflow-hidden ring-2 ring-primary/30">
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-primary-foreground text-lg font-bold">A</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-10 py-8">
        <div className="max-w-5xl mx-auto flex gap-6">
          {/* Left - User Profile Card */}
          <div className="flex-1 mi-card p-8">
            <div className="flex items-center gap-6 mb-8">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-primary overflow-hidden ring-4 ring-primary/30">
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-primary-foreground text-4xl font-bold">A</span>
                </div>
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-2xl font-bold text-foreground">Ameer E</h2>
                <p className="text-muted-foreground">ameer@example.com</p>
              </div>
            </div>

            {/* Account Button */}
            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground font-medium">Account</span>
            </button>

            {/* Account Details (from Figma page 5) */}
            <div className="mt-6 space-y-3 p-4 bg-secondary/50 rounded-xl">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Account Status</span>
                <span className="text-accent font-medium text-sm">{accountData.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Mac Address</span>
                <span className="text-foreground text-sm font-mono">{accountData.macAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Device Key</span>
                <span className="text-foreground text-sm font-mono">{accountData.deviceKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Expire Date</span>
                <span className="text-accent font-medium text-sm">{accountData.expireDate}</span>
              </div>
            </div>
          </div>

          {/* Right - Settings Options */}
          <div className="flex-1 space-y-3">
            {/* Parent Control */}
            <button className="w-full flex items-center gap-4 px-6 py-5 mi-card hover:bg-card">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Shield className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-foreground font-medium text-lg">Parent Control</span>
            </button>

            {/* Change Playlist */}
            <button 
              onClick={() => setShowPlaylistDialog(true)}
              className="w-full flex items-center gap-4 px-6 py-5 mi-card hover:bg-card"
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
              className="w-full flex items-center gap-4 px-6 py-5 mi-card hover:bg-card"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-foreground font-medium text-lg">Delete Cache</span>
            </button>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-muted-foreground text-sm mt-12">Version 1.1.1</p>
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
