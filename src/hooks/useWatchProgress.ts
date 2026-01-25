const STORAGE_KEY = 'mi_watch_progress';
const SAVE_INTERVAL = 5; // Save every 5 seconds of playback
const MIN_PROGRESS_TO_SAVE = 10; // Minimum seconds watched to save
const RESUME_THRESHOLD = 0.95; // Don't resume if > 95% complete

export type ContentType = 'live' | 'movie' | 'series' | 'sports' | 'unknown';

export interface WatchProgress {
  channelId: string;
  channelName: string;
  position: number; // seconds
  duration: number;
  timestamp: number; // when it was saved
  logo?: string;
  url?: string;
  contentType?: ContentType;
  group?: string;
}

const LAST_PLAYED_KEY = 'mi_last_played';

export interface LastPlayed {
  channelId: string;
  channelName: string;
  url: string;
  logo?: string;
  type?: string;
  group?: string;
  timestamp: number;
}

interface WatchProgressStore {
  [channelId: string]: WatchProgress;
}

// Determine content type from group/url
export const getContentType = (group?: string, url?: string): ContentType => {
  const g = group?.toLowerCase() || '';
  const u = url?.toLowerCase() || '';
  
  if (g.includes('movie') || u.includes('/movie/')) return 'movie';
  if (g.includes('series') || u.includes('/series/')) return 'series';
  if (g.includes('sport')) return 'sports';
  if (g.includes('live') || !g.includes('vod')) return 'live';
  return 'unknown';
};

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
  logo?: string,
  url?: string,
  group?: string
): void => {
  // Don't save if barely started or almost finished (for VOD only)
  const contentType = getContentType(group, url);
  if (contentType !== 'live' && position < MIN_PROGRESS_TO_SAVE) return;
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
      url,
      contentType,
      group,
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

// Get recent watch progress filtered by content type
export const getRecentByType = (type: ContentType, limit = 5): WatchProgress[] => {
  const store = getWatchProgress();
  return Object.values(store)
    .filter((item) => item.contentType === type)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

export const saveLastPlayed = (input: Omit<LastPlayed, 'timestamp'>) => {
  try {
    const payload: LastPlayed = {
      ...input,
      timestamp: Date.now(),
    };
    localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
};

export const getLastPlayed = (): LastPlayed | null => {
  try {
    const stored = localStorage.getItem(LAST_PLAYED_KEY);
    return stored ? (JSON.parse(stored) as LastPlayed) : null;
  } catch {
    return null;
  }
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
  logo?: string,
  url?: string,
  group?: string
) => {
  const savedProgress = channelId ? getChannelProgress(channelId) : null;
  
  const saveProgress = (position: number, duration: number) => {
    if (!channelId) return;
    saveWatchProgress(channelId, channelName, position, duration, logo, url, group);
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
