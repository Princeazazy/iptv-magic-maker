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
      try {
        setLoading(true);
        
        const { data, error: fetchError } = await supabase.functions.invoke('fetch-m3u', {
          body: { url: m3uUrl }
        });

        if (fetchError) {
          throw fetchError;
        }

        if (!data || !data.content) {
          throw new Error('No content received from server');
        }
        
        const parsedChannels = parseM3U(data.content);
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
