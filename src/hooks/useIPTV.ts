import { useState, useEffect } from 'react';

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

export const useIPTV = (m3uUrl: string) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchM3U = async () => {
      try {
        setLoading(true);
        const response = await fetch(m3uUrl);
        const text = await response.text();
        
        const parsedChannels = parseM3U(text);
        setChannels(parsedChannels);
        setError(null);
      } catch (err) {
        setError('Failed to load channels');
        console.error('Error loading m3u:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchM3U();
  }, [m3uUrl]);

  return { channels, loading, error };
};

const parseM3U = (content: string): Channel[] => {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const nameMatch = line.split(',').pop();

      currentChannel = {
        id: `channel-${channels.length}`,
        name: nameMatch?.trim() || 'Unknown Channel',
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : 'Uncategorized',
      };
    } else if (line && !line.startsWith('#') && currentChannel.name) {
      currentChannel.url = line;
      channels.push(currentChannel as Channel);
      currentChannel = {};
    }
  }

  return channels;
};
