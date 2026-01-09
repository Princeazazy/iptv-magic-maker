import { useState, useEffect } from 'react';
import { ChevronLeft, User, Shield, ListVideo, Trash2, Cloud } from 'lucide-react';

interface MiSettingsPageProps {
  onBack: () => void;
}

export const MiSettingsPage = ({ onBack }: MiSettingsPageProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        {/* Back & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="text-primary font-bold text-2xl">
              <span className="text-primary">M</span>
              <span className="text-[#FF6B35]">i</span>
            </div>
            <span className="text-muted-foreground text-sm ml-2">Player Pro</span>
          </div>
        </div>

        {/* Time & Weather */}
        <div className="flex items-center gap-4">
          <span className="text-foreground font-medium">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Cloud className="w-4 h-4" />
            <span className="text-sm">24°</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8">
        <div className="max-w-4xl mx-auto flex gap-8">
          {/* User Profile Card */}
          <div className="flex-1 bg-card/60 rounded-2xl p-8">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-primary overflow-hidden border-4 border-primary">
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary-foreground" />
                </div>
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-2xl font-bold text-foreground">User</h2>
                <p className="text-muted-foreground">user@example.com</p>
              </div>
            </div>

            {/* Account Button */}
            <button className="mt-8 w-full flex items-center gap-3 px-6 py-4 bg-card rounded-xl hover:bg-muted transition-colors">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground font-medium">Account</span>
            </button>
          </div>

          {/* Settings Options */}
          <div className="flex-1 space-y-4">
            {/* Parent Control */}
            <button className="w-full flex items-center gap-4 px-6 py-5 bg-card/60 rounded-2xl hover:bg-card transition-colors">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-foreground font-medium">Parent Control</span>
            </button>

            {/* Change Playlist */}
            <button className="w-full flex items-center gap-4 px-6 py-5 bg-card/80 rounded-2xl hover:bg-card transition-colors border border-border/50">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <ListVideo className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-foreground font-medium">Change Playlist</span>
            </button>

            {/* Delete Cache */}
            <button className="w-full flex items-center gap-4 px-6 py-5 bg-card/60 rounded-2xl hover:bg-card transition-colors">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-foreground font-medium">Delete Cache</span>
            </button>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-muted-foreground text-sm mt-12">Version 1.1.1</p>
      </main>
    </div>
  );
};
