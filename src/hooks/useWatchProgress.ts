const STORAGE_KEY = 'mi_watch_progress';
const SAVE_INTERVAL = 5; // Save every 5 seconds of playback
const MIN_PROGRESS_TO_SAVE = 10; // Minimum seconds watched to save
const RESUME_THRESHOLD = 0.95; // Don't resume if > 95% complete

export interface WatchProgress {
  channelId: string;
  channelName: string;
  position: number; // seconds
  duration: number;
  timestamp: number; // when it was saved
  logo?: string;
}

interface WatchProgressStore {
  [channelId: string]: WatchProgress;
}

// Get all watch progress entries
export const getWatchProgress = (): WatchProgressStore => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Get progress for a specific channel
export const getChannelProgress = (channelId: string): WatchProgress | null => {
  const store = getWatchProgress();
  return store[channelId] || null;
};

// Save progress for a channel
export const saveWatchProgress = (
  channelId: string,
  channelName: string,
  position: number,
  duration: number,
  logo?: string
): void => {
  // Don't save if barely started or almost finished
  if (position < MIN_PROGRESS_TO_SAVE) return;
  if (duration > 0 && position / duration > RESUME_THRESHOLD) {
    // If finished watching, remove the progress
    removeWatchProgress(channelId);
    return;
  }

  try {
    const store = getWatchProgress();
    store[channelId] = {
      channelId,
      channelName,
      position,
      duration,
      timestamp: Date.now(),
      logo,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save watch progress:', e);
  }
};

// Remove progress for a channel
export const removeWatchProgress = (channelId: string): void => {
  try {
    const store = getWatchProgress();
    delete store[channelId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to remove watch progress:', e);
  }
};

// Get recent watch progress (for "Continue Watching" section)
export const getRecentWatchProgress = (limit = 10): WatchProgress[] => {
  const store = getWatchProgress();
  return Object.values(store)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

// Clear all watch progress
export const clearAllWatchProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear watch progress:', e);
  }
};

// Custom hook for managing watch progress in a player component
export const useWatchProgress = (
  channelId: string | undefined,
  channelName: string,
  logo?: string
) => {
  const savedProgress = channelId ? getChannelProgress(channelId) : null;
  
  const saveProgress = (position: number, duration: number) => {
    if (!channelId) return;
    saveWatchProgress(channelId, channelName, position, duration, logo);
  };

  const clearProgress = () => {
    if (channelId) {
      removeWatchProgress(channelId);
    }
  };

  return {
    savedPosition: savedProgress?.position || 0,
    hasSavedProgress: !!savedProgress && savedProgress.position > MIN_PROGRESS_TO_SAVE,
    saveProgress,
    clearProgress,
    saveInterval: SAVE_INTERVAL,
  };
};
