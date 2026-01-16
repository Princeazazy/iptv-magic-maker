// Local M3U playlist file storage - stores parsed channels from uploaded M3U files
// This approach mimics Bocaletto's IPTV Web Player: user uploads M3U, browser parses it,
// streams play directly from user's IP (no proxy needed)

const LOCAL_CHANNELS_KEY = 'mi-player-local-channels';
const LOCAL_PLAYLIST_NAME_KEY = 'mi-player-local-playlist-name';

export interface LocalChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  type?: 'live' | 'movies' | 'series' | 'sports';
}

// Parse M3U content into channels array (browser-side parsing)
export const parseM3UContent = (content: string): LocalChannel[] => {
  const lines = content.split('\n');
  const channels: LocalChannel[] = [];
  let currentChannel: Partial<LocalChannel> = {};

  const getContentType = (
    group: string = '',
    name: string = ''
  ): NonNullable<LocalChannel['type']> => {
    const groupLower = group.toLowerCase();
    const nameLower = name.toLowerCase();
    const combined = `${groupLower} ${nameLower}`;

    // Sports detection
    if (
      combined.includes('sport') ||
      combined.includes('football') ||
      combined.includes('soccer') ||
      combined.includes('basketball') ||
      combined.includes('tennis') ||
      combined.includes('cricket') ||
      combined.includes('boxing') ||
      combined.includes('wrestling') ||
      combined.includes('nfl') ||
      combined.includes('nba') ||
      combined.includes('mlb') ||
      combined.includes('nhl')
    ) {
      return 'sports';
    }

    // Series detection
    if (
      groupLower.includes('series') ||
      groupLower.includes('tv show') ||
      groupLower.includes('tvshow') ||
      groupLower.includes('episode') ||
      groupLower.includes('season')
    ) {
      return 'series';
    }

    // Movies/VOD detection
    if (
      groupLower.includes('vod') ||
      groupLower.includes('on demand') ||
      groupLower.includes('on-demand') ||
      groupLower.match(/\bmov\b/) !== null ||
      groupLower.includes(' movies') ||
      groupLower.startsWith('movies') ||
      groupLower.includes(' film')
    ) {
      return 'movies';
    }

    return 'live';
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const nameMatch = line.split(',').pop();

      const name = nameMatch?.trim() || 'Unknown Channel';
      const group = groupMatch ? groupMatch[1] : 'Uncategorized';

      currentChannel = {
        id: `local-${channels.length}`,
        name,
        logo: logoMatch ? logoMatch[1] : undefined,
        group,
        type: getContentType(group, name),
      };
    } else if (line && !line.startsWith('#') && currentChannel.name) {
      currentChannel.url = line;
      channels.push(currentChannel as LocalChannel);
      currentChannel = {};
    }
  }

  return channels;
};

// Save parsed channels to localStorage
export const saveLocalChannels = (channels: LocalChannel[], fileName?: string): void => {
  try {
    localStorage.setItem(LOCAL_CHANNELS_KEY, JSON.stringify(channels));
    if (fileName) {
      localStorage.setItem(LOCAL_PLAYLIST_NAME_KEY, fileName);
    }
    console.log(`Saved ${channels.length} local channels from ${fileName || 'uploaded file'}`);
  } catch (e) {
    console.warn('Failed to save local channels:', e);
  }
};

// Get saved local channels
export const getLocalChannels = (): LocalChannel[] | null => {
  try {
    const data = localStorage.getItem(LOCAL_CHANNELS_KEY);
    if (data) {
      const channels = JSON.parse(data);
      if (Array.isArray(channels) && channels.length > 0) {
        return channels;
      }
    }
  } catch (e) {
    console.warn('Failed to load local channels:', e);
  }
  return null;
};

// Get saved playlist file name
export const getLocalPlaylistName = (): string | null => {
  return localStorage.getItem(LOCAL_PLAYLIST_NAME_KEY);
};

// Check if we have local channels saved
export const hasLocalChannels = (): boolean => {
  const channels = getLocalChannels();
  return channels !== null && channels.length > 0;
};

// Clear local channels
export const clearLocalChannels = (): void => {
  try {
    localStorage.removeItem(LOCAL_CHANNELS_KEY);
    localStorage.removeItem(LOCAL_PLAYLIST_NAME_KEY);
    console.log('Cleared local channels');
  } catch {
    // ignore
  }
};

// Read file as text (for file input)
export const readM3UFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
