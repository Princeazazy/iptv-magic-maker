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
          
          // Check response status before parsing JSON
          if (!response.ok) {
            console.log('Provider blocks server requests, loading demo channels for browser preview');
            throw new Error('DEMO_MODE');
          }
          
          const data = await response.json();
          
          // Check if edge function returned an error
          if (data.error) {
            console.log('Edge function returned error, loading demo channels');
            throw new Error('DEMO_MODE');
          }
          
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
        // For browser/edge function, load demo data (provider blocks all non-device requests)
        if (typeof (window as any).Capacitor === 'undefined') {
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
          setChannels(demoChannels);
          setError(null);
        } else {
          const errorMessage = err?.message || 'Failed to load channels. Please check your M3U URL and internet connection.';
          setError(errorMessage);
        }
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
