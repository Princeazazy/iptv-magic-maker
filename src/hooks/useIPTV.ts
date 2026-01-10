import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { getStoredPlaylistUrl } from '@/lib/playlistStorage';

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  type?: 'live' | 'movies' | 'series' | 'sports';
  // Extended metadata for movies/series
  stream_id?: number;
  series_id?: number;
  rating?: string;
  year?: string;
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  duration?: string;
  container_extension?: string;
  backdrop_path?: string[];
}

export const useIPTV = (m3uUrl?: string) => {
  // Use provided URL or fall back to stored URL
  const effectiveUrl = m3uUrl || getStoredPlaylistUrl();
  
  console.log('useIPTV hook called with URL:', effectiveUrl);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to trigger a refresh without reloading the app
  const refresh = useCallback(() => {
    console.log('Refreshing channels...');
    setRefreshKey(prev => prev + 1);
  }, []);

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
          // Web preview - use edge function proxy with reasonable limits
          console.log('Fetching M3U using edge function proxy...');
          const { data, error } = await supabase.functions.invoke('fetch-m3u', {
            body: { 
              url: effectiveUrl, 
              maxChannels: 50000, 
              maxBytesMB: 100, 
              maxReturnPerType: 10000 // Limit for web preview to prevent timeouts
            }
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
            console.log('Counts:', data.counts);
            
            // For series, we need to allow empty URLs since they need episode expansion
            const parsedChannels = data.channels
              .filter((ch: any) => ch.name && (ch.url || ch.type === 'series'))
              .map((ch: any, idx: number) => ({
                id: `channel-${idx}`,
                name: ch.name,
                url: ch.url || '',
                logo: ch.logo || undefined,
                group: ch.group || 'Live TV',
                type: ch.type || 'live',
                // Preserve extended metadata
                stream_id: ch.stream_id,
                series_id: ch.series_id,
                rating: ch.rating,
                year: ch.year,
                plot: ch.plot,
                cast: ch.cast,
                director: ch.director,
                genre: ch.genre,
                duration: ch.duration,
                container_extension: ch.container_extension,
                backdrop_path: ch.backdrop_path,
              }));
            
            if (parsedChannels.length === 0) {
              throw new Error('No valid channels found in playlist');
            }
            
            console.log(`Mapped ${parsedChannels.length} channels with types:`, {
              live: parsedChannels.filter((c: Channel) => c.type === 'live').length,
              movies: parsedChannels.filter((c: Channel) => c.type === 'movies').length,
              series: parsedChannels.filter((c: Channel) => c.type === 'series').length,
              sports: parsedChannels.filter((c: Channel) => c.type === 'sports').length,
            });
            
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
        const errorMessage = err?.message || 'Failed to load channels';
        console.log('Error details:', errorMessage);
        
        if (!isNative) {
          // Fall back to demo channels for web
          console.log('Falling back to demo channels due to error');
          loadDemoChannels();
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchM3U();
  }, [effectiveUrl, refreshKey]);

  return { channels, loading, error, refresh };
};

const parseM3U = (content: string): Channel[] => {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  const getContentType = (
    group: string = '',
    name: string = ''
  ): NonNullable<Channel['type']> => {
    const groupLower = group.toLowerCase();
    const nameLower = name.toLowerCase();
    const combined = `${groupLower} ${nameLower}`;

    // Sports detection (can appear in name)
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

    // Series detection (mostly group-driven)
    if (
      groupLower.includes('series') ||
      groupLower.includes('tv show') ||
      groupLower.includes('tvshow') ||
      groupLower.includes('episode') ||
      groupLower.includes('season') ||
      groupLower.includes('netflix') ||
      groupLower.includes('hbo') ||
      groupLower.includes('amazon') ||
      groupLower.includes('prime') ||
      groupLower.includes('hulu')
    ) {
      return 'series';
    }

    // Movies/VOD detection: ONLY treat as movies when the GROUP looks like VOD.
    // This prevents live channels like "Nile Cinema" / "Top Movies" from being misclassified.
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
