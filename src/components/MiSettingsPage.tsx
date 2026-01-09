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
            <button className="w-full flex items-center gap-4 px-6 py-5 bg-card rounded-2xl hover:bg-card/80 transition-colors border border-border/30">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <ListVideo className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-foreground font-medium text-lg">Change Playlist</span>
            </button>

            {/* Delete Cache */}
            <button className="w-full flex items-center gap-4 px-6 py-5 bg-card rounded-2xl hover:bg-card/80 transition-colors border border-border/30">
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
    </div>
  );
};
