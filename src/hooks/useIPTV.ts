import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  type?: 'live' | 'movies' | 'series' | 'sports';
}

const PLAYLIST_STORAGE_KEY = 'mi-player-playlist-url';

export const getStoredPlaylistUrl = (): string => {
  return localStorage.getItem(PLAYLIST_STORAGE_KEY) || '';
};

export const useIPTV = (m3uUrl?: string) => {
  // Use provided URL or fall back to stored URL
  const effectiveUrl = m3uUrl || getStoredPlaylistUrl();
  
  console.log('useIPTV hook called with URL:', effectiveUrl);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useIPTV useEffect running');
    
    const loadDemoChannels = () => {
      console.log('Loading demo channels - real channels will work in native app');
      const demoChannels: Channel[] = [
        {
          id: 'demo-1',
          name: 'BBC News',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/7iJVHmC.png',
          group: 'News'
        },
        {
          id: 'demo-2',
          name: 'Al Jazeera English',
          url: 'https://live-hls-web-aje.getaj.net/AJE/index.m3u8',
          logo: 'https://i.imgur.com/xEIhBDz.png',
          group: 'News'
        },
        {
          id: 'demo-3',
          name: 'France 24',
          url: 'https://static.france24.com/meta/android-icon-192x192.png',
          logo: 'https://i.imgur.com/EcMwBCN.png',
          group: 'News'
        },
        {
          id: 'demo-4',
          name: 'CNN',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/KGBSdOa.png',
          group: 'News'
        },
        {
          id: 'demo-5',
          name: 'Sky News',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/OUlToBV.png',
          group: 'News'
        },
        {
          id: 'demo-6',
          name: 'ESPN',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/qKvjKY8.png',
          group: 'Sports'
        },
        {
          id: 'demo-7',
          name: 'Fox Sports',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/YnzJ9Ck.png',
          group: 'Sports'
        },
        {
          id: 'demo-8',
          name: 'NBC Sports',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/oMRLjuC.png',
          group: 'Sports'
        },
        {
          id: 'demo-9',
          name: 'Discovery',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/vK2wvLq.png',
          group: 'Documentary'
        },
        {
          id: 'demo-10',
          name: 'National Geographic',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/BPQASMZ.png',
          group: 'Documentary'
        },
        {
          id: 'demo-11',
          name: 'History Channel',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/SJ9CnN7.png',
          group: 'Documentary'
        },
        {
          id: 'demo-12',
          name: 'HBO',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/LzxlLVi.png',
          group: 'Entertainment'
        },
        {
          id: 'demo-13',
          name: 'Comedy Central',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/g6VmEjF.png',
          group: 'Entertainment'
        },
        {
          id: 'demo-14',
          name: 'MTV',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/BwANwNZ.png',
          group: 'Entertainment'
        },
        {
          id: 'demo-15',
          name: 'Cartoon Network',
          url: 'https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8',
          logo: 'https://i.imgur.com/vYBhzGO.png',
          group: 'Kids'
        }
      ];
      setChannels(demoChannels.map((ch) => ({
        ...ch,
        type: ch.group?.toLowerCase().includes('sport') ? 'sports' : 'live',
      })));
      setError(null);
      setLoading(false);
    };
    
    const fetchM3U = async () => {
      console.log('fetchM3U function called');
      
      // No URL configured
      if (!effectiveUrl || !effectiveUrl.trim()) {
        console.log('No M3U URL provided, loading demo channels');
        loadDemoChannels();
        return;
      }
      
      // Check if running on native platform
      const isNative = Capacitor.isNativePlatform();

      try {
        setLoading(true);
        
        let content: string;
        
        if (isNative) {
          console.log('Fetching M3U using native HTTP...');
          // Dynamically import Capacitor HTTP
          const { Http } = await import('@capacitor/http');

          const response = await Http.request({
            method: 'GET',
            url: effectiveUrl,
            headers: {
              'User-Agent': 'Mozilla/5.0',
            },
          });

          if (response.status !== 200) {
            throw new Error(`Failed to fetch playlist. Status: ${response.status}`);
          }
          
          content = response.data;
        } else {
          // Web preview - try edge function proxy (streams and parses server-side)
          console.log('Fetching M3U using edge function proxy...');
          
          const { data, error } = await supabase.functions.invoke('fetch-m3u', {
            body: { url: effectiveUrl, maxChannels: 50000, maxBytesMB: 80 }
          });
          
          if (error) {
            console.error('Edge function error:', error);
            throw new Error(`Proxy error: ${error.message}`);
          }
          
          if (data?.blocked) {
            console.log('IPTV provider blocked proxy request, using demo channels');
            loadDemoChannels();
            return;
          }
          
          if (data?.error) {
            throw new Error(data.error);
          }
          
          // Edge function now returns pre-parsed channels with type
          if (data?.channels && Array.isArray(data.channels)) {
            console.log(`Received ${data.channels.length} pre-parsed channels from edge function`);
            const parsedChannels = data.channels
              .filter((ch: any) => ch.url && ch.name)
              .map((ch: any, idx: number) => ({
                id: `channel-${idx}`,
                name: ch.name,
                url: ch.url,
                logo: ch.logo || undefined,
                group: ch.group || 'Live TV',
                type: ch.type || 'live'
              }));
            
            if (parsedChannels.length === 0) {
              throw new Error('No valid channels found in playlist');
            }
            
            setChannels(parsedChannels);
            setError(null);
            setLoading(false);
            return;
          }
          
          throw new Error('Invalid response from proxy');
        }
        
        // Native path: parse locally
        console.log('M3U fetch successful, parsing channels...');
        const parsedChannels = parseM3U(content);
        
        if (parsedChannels.length === 0) {
          throw new Error('No channels found in playlist. The M3U file may be empty or invalid.');
        }
        
        setChannels(parsedChannels);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching M3U:', err);
        if (!isNative) {
          // Fall back to demo channels for web
          console.log('Falling back to demo channels');
          loadDemoChannels();
        } else {
          const errorMessage = err?.message || 'Failed to load channels. Please check your M3U URL and internet connection.';
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchM3U();
  }, [effectiveUrl]);

  return { channels, loading, error };
};

const parseM3U = (content: string): Channel[] => {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  const getContentType = (
    group: string = '',
    name: string = ''
  ): NonNullable<Channel['type']> => {
    const combined = `${group} ${name}`.toLowerCase();

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

    if (
      combined.includes('movie') ||
      combined.includes('movies') ||
      combined.includes('film') ||
      combined.includes('cinema') ||
      combined.includes('vod') ||
      combined.includes('on demand') ||
      combined.includes('on-demand')
    ) {
      return 'movies';
    }

    if (
      combined.includes('series') ||
      combined.includes('tv show') ||
      combined.includes('tvshow') ||
      combined.includes('episode') ||
      combined.includes('season')
    ) {
      return 'series';
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
        id: `channel-${channels.length}`,
        name,
        logo: logoMatch ? logoMatch[1] : undefined,
        group,
        type: getContentType(group, name),
      };
    } else if (line && !line.startsWith('#') && currentChannel.name) {
      currentChannel.url = line;

      // Include live + movies + series (native parsing)
      channels.push(currentChannel as Channel);

      currentChannel = {};
    }
  }

  return channels;
};
