import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      if (!m3uUrl || !m3uUrl.trim()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching M3U from browser...');
        
        // Fetch directly from browser - the ONLY way that works with this provider
        const response = await fetch(m3uUrl, {
          mode: 'no-cors',
          credentials: 'omit',
          cache: 'no-cache'
        });
        
        // Try to read as text
        let content;
        try {
          content = await response.text();
        } catch (e) {
          // If no-cors mode, try alternative approach with a proxy
          console.log('No-cors blocked, trying with cors mode...');
          const corsResponse = await fetch(m3uUrl, {
            mode: 'cors',
            credentials: 'omit',
          });
          content = await corsResponse.text();
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
        let errorMessage = 'Failed to load channels. ';
        
        if (err.message?.includes('CORS') || err.message?.includes('NetworkError')) {
          errorMessage += 'Your IPTV provider blocks web browsers. You may need to use a native IPTV app instead.';
        } else if (err.message?.includes('Empty response')) {
          errorMessage += err.message;
        } else {
          errorMessage += 'Please check your internet connection and M3U URL credentials.';
        }
        
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
