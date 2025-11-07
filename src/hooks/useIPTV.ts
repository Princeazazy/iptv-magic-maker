import { useState, useEffect } from 'react';

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

export const useIPTV = (m3uUrl: string) => {
  console.log('useIPTV hook called with URL:', m3uUrl);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useIPTV useEffect running');
    const fetchM3U = async () => {
      console.log('fetchM3U function called');
      if (!m3uUrl || !m3uUrl.trim()) {
        console.log('No M3U URL provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        let content: string;
        
        // Check if Capacitor is available (native app)
        const isNative = typeof (window as any).Capacitor !== 'undefined';
        
        if (isNative) {
          console.log('Fetching M3U using native HTTP...');
          
          // Dynamically import Capacitor HTTP
          const { Http } = await import('@capacitor/http');
          
          const response = await Http.request({
            method: 'GET',
            url: m3uUrl,
            headers: {
              'User-Agent': 'Mozilla/5.0',
            }
          });
          
          if (response.status !== 200) {
            throw new Error(`Failed to fetch playlist. Status: ${response.status}`);
          }
          
          content = response.data;
        } else {
          // Use edge function to bypass CORS in browser
          console.log('Fetching M3U via edge function...');
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-m3u`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ url: m3uUrl }),
            }
          );
          
          if (!response.ok) {
            throw new Error(`Failed to fetch via edge function: ${response.status}`);
          }
          
          const data = await response.json();
          content = data.content;
        }
        
        if (!content || content.length === 0) {
          throw new Error('Empty response from IPTV provider. Please check your credentials.');
        }
        
        console.log('M3U fetch successful, parsing channels...');
        const parsedChannels = parseM3U(content);
        
        if (parsedChannels.length === 0) {
          throw new Error('No channels found in playlist. The M3U file may be empty or invalid.');
        }
        
        setChannels(parsedChannels);
        setError(null);
      } catch (err: any) {
        console.error('Error loading m3u:', err);
        const errorMessage = err?.message || 'Failed to load channels. Please check your M3U URL and internet connection.';
        setError(errorMessage);
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

  // Keywords to filter out VOD content (movies and series)
  const vodKeywords = [
    'movie', 'movies', 'film', 'films', 'cinema',
    'series', 'tv show', 'tvshow', 'episode', 'season',
    'vod', 'on demand', 'on-demand',
    '24/7', '24-7', 'marathon'
  ];

  const isVODContent = (group: string = '', name: string = ''): boolean => {
    const combined = `${group} ${name}`.toLowerCase();
    return vodKeywords.some(keyword => combined.includes(keyword));
  };

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
        group: groupMatch ? groupMatch[1] : 'Live TV',
      };
    } else if (line && !line.startsWith('#') && currentChannel.name) {
      currentChannel.url = line;
      
      // Only add if it's not VOD content
      if (!isVODContent(currentChannel.group, currentChannel.name)) {
        channels.push(currentChannel as Channel);
      }
      
      currentChannel = {};
    }
  }

  return channels;
};
