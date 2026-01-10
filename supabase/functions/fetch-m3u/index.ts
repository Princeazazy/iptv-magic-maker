import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Determine content type from group/name
function getContentType(group: string, name: string): 'live' | 'movies' | 'series' | 'sports' {
  const combined = `${group} ${name}`.toLowerCase();
  
  // Sports detection
  if (combined.includes('sport') || combined.includes('football') || 
      combined.includes('soccer') || combined.includes('basketball') ||
      combined.includes('tennis') || combined.includes('cricket') ||
      combined.includes('boxing') || combined.includes('wrestling') ||
      combined.includes('nfl') || combined.includes('nba') ||
      combined.includes('mlb') || combined.includes('nhl') ||
      combined.includes('espn') || combined.includes('fox sport') ||
      combined.includes('bein') || combined.includes('sky sport')) {
    return 'sports';
  }
  
  // Movies detection
  if (combined.includes('movie') || combined.includes('film') || 
      combined.includes('cinema') || combined.includes('vod') ||
      combined.includes('on demand') || combined.includes('24/7') ||
      combined.includes('24-7')) {
    return 'movies';
  }
  
  // Series detection
  if (combined.includes('series') || combined.includes('tv show') ||
      combined.includes('episode') || combined.includes('season') ||
      combined.includes('netflix') || combined.includes('hbo max') ||
      combined.includes('amazon') || combined.includes('hulu')) {
    return 'series';
  }
  
  return 'live';
}

// Parse Xtream Codes credentials from M3U URL
function parseXtreamCredentials(url: string): { baseUrl: string; username: string; password: string } | null {
  try {
    const urlObj = new URL(url);
    const username = urlObj.searchParams.get('username');
    const password = urlObj.searchParams.get('password');
    
    if (username && password) {
      const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
      return { baseUrl, username, password };
    }
    
    // Try to parse from path like /get.php?username=X&password=Y
    // or /player_api.php?username=X&password=Y
    return null;
  } catch {
    return null;
  }
}

// Fetch Xtream Codes live streams
async function fetchXtreamLive(baseUrl: string, username: string, password: string): Promise<any[]> {
  try {
    console.log('Fetching Xtream live categories...');
    const categoriesRes = await fetch(
      `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`,
      { headers: { 'User-Agent': 'IPTV Smarters/1.0' } }
    );
    const categories = await categoriesRes.json();
    console.log(`Found ${categories?.length || 0} live categories`);
    
    console.log('Fetching Xtream live streams...');
    const streamsRes = await fetch(
      `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`,
      { headers: { 'User-Agent': 'IPTV Smarters/1.0' } }
    );
    const streams = await streamsRes.json();
    console.log(`Found ${streams?.length || 0} live streams`);
    
    if (!Array.isArray(streams)) return [];
    
    const categoryMap = new Map();
    if (Array.isArray(categories)) {
      categories.forEach((cat: any) => {
        categoryMap.set(cat.category_id, cat.category_name);
      });
    }
    
    return streams.map((stream: any) => ({
      name: stream.name || 'Unknown Channel',
      url: `${baseUrl}/live/${username}/${password}/${stream.stream_id}.m3u8`,
      logo: stream.stream_icon || '',
      group: categoryMap.get(stream.category_id) || 'Uncategorized',
      type: getContentType(categoryMap.get(stream.category_id) || '', stream.name || ''),
      stream_id: stream.stream_id,
      epg_channel_id: stream.epg_channel_id,
    }));
  } catch (err) {
    console.error('Error fetching Xtream live streams:', err);
    return [];
  }
}

// Fetch Xtream Codes VOD (movies)
async function fetchXtreamMovies(baseUrl: string, username: string, password: string): Promise<any[]> {
  try {
    console.log('Fetching Xtream VOD categories...');
    const categoriesRes = await fetch(
      `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`,
      { headers: { 'User-Agent': 'IPTV Smarters/1.0' } }
    );
    const categories = await categoriesRes.json();
    console.log(`Found ${categories?.length || 0} VOD categories`);
    
    console.log('Fetching Xtream VOD streams...');
    const streamsRes = await fetch(
      `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams`,
      { headers: { 'User-Agent': 'IPTV Smarters/1.0' } }
    );
    const streams = await streamsRes.json();
    console.log(`Found ${streams?.length || 0} VOD streams`);
    
    if (!Array.isArray(streams)) return [];
    
    const categoryMap = new Map();
    if (Array.isArray(categories)) {
      categories.forEach((cat: any) => {
        categoryMap.set(cat.category_id, cat.category_name);
      });
    }
    
    return streams.map((stream: any) => ({
      name: stream.name || 'Unknown Movie',
      url: `${baseUrl}/movie/${username}/${password}/${stream.stream_id}.${stream.container_extension || 'mp4'}`,
      logo: stream.stream_icon || '',
      group: categoryMap.get(stream.category_id) || 'Movies',
      type: 'movies' as const,
      stream_id: stream.stream_id,
      rating: stream.rating,
      year: stream.year,
      plot: stream.plot,
      cast: stream.cast,
      director: stream.director,
      genre: stream.genre,
      duration: stream.duration,
      container_extension: stream.container_extension,
    }));
  } catch (err) {
    console.error('Error fetching Xtream VOD:', err);
    return [];
  }
}

// Fetch Xtream Codes series
async function fetchXtreamSeries(baseUrl: string, username: string, password: string): Promise<any[]> {
  try {
    console.log('Fetching Xtream series categories...');
    const categoriesRes = await fetch(
      `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_series_categories`,
      { headers: { 'User-Agent': 'IPTV Smarters/1.0' } }
    );
    const categories = await categoriesRes.json();
    console.log(`Found ${categories?.length || 0} series categories`);
    
    console.log('Fetching Xtream series...');
    const streamsRes = await fetch(
      `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_series`,
      { headers: { 'User-Agent': 'IPTV Smarters/1.0' } }
    );
    const streams = await streamsRes.json();
    console.log(`Found ${streams?.length || 0} series`);
    
    if (!Array.isArray(streams)) return [];
    
    const categoryMap = new Map();
    if (Array.isArray(categories)) {
      categories.forEach((cat: any) => {
        categoryMap.set(cat.category_id, cat.category_name);
      });
    }
    
    return streams.map((stream: any) => ({
      name: stream.name || 'Unknown Series',
      url: '', // Series need to be expanded to get episodes
      logo: stream.cover || '',
      group: categoryMap.get(stream.category_id) || 'Series',
      type: 'series' as const,
      series_id: stream.series_id,
      rating: stream.rating,
      year: stream.year,
      plot: stream.plot,
      cast: stream.cast,
      director: stream.director,
      genre: stream.genre,
      backdrop_path: stream.backdrop_path,
      last_modified: stream.last_modified,
      releaseDate: stream.releaseDate,
    }));
  } catch (err) {
    console.error('Error fetching Xtream series:', err);
    return [];
  }
}

// Parse M3U content as we stream it
function parseM3UContent(chunk: string, existingChannels: { name: string; url: string; logo: string; group: string; type: string }[], partialLine: string): {
  channels: { name: string; url: string; logo: string; group: string; type: string }[];
  remainingPartial: string;
} {
  const content = partialLine + chunk;
  const lines = content.split('\n');
  
  const remainingPartial = chunk.endsWith('\n') ? '' : lines.pop() || '';
  
  let currentChannel: { name: string; url: string; logo: string; group: string; type: string } | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('#EXTINF:')) {
      const nameMatch = trimmedLine.match(/,(.+)$/);
      const logoMatch = trimmedLine.match(/tvg-logo="([^"]+)"/);
      const groupMatch = trimmedLine.match(/group-title="([^"]+)"/);
      
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
      const group = groupMatch ? groupMatch[1] : 'Uncategorized';
      const type = getContentType(group, name);
      
      currentChannel = {
        name,
        url: '',
        logo: logoMatch ? logoMatch[1] : '',
        group,
        type
      };
    } else if (currentChannel && trimmedLine && !trimmedLine.startsWith('#')) {
      currentChannel.url = trimmedLine;
      existingChannels.push(currentChannel);
      currentChannel = null;
    }
  }
  
  return { channels: existingChannels, remainingPartial };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, maxChannels = 100000, maxBytesMB = 100 } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing URL:', url);
    
    // Check if this is an Xtream Codes URL
    const xtreamCreds = parseXtreamCredentials(url);
    
    if (xtreamCreds) {
      console.log('Detected Xtream Codes format, fetching via API...');
      const { baseUrl, username, password } = xtreamCreds;
      
      // Fetch all content types in parallel
      const [liveChannels, movies, series] = await Promise.all([
        fetchXtreamLive(baseUrl, username, password),
        fetchXtreamMovies(baseUrl, username, password),
        fetchXtreamSeries(baseUrl, username, password),
      ]);
      
      console.log(`Xtream API results: ${liveChannels.length} live, ${movies.length} movies, ${series.length} series`);
      
      const allChannels = [...liveChannels, ...movies, ...series];
      
      return new Response(
        JSON.stringify({ 
          channels: allChannels, 
          totalParsed: allChannels.length,
          isXtream: true,
          counts: {
            live: liveChannels.length,
            movies: movies.length,
            series: series.length,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fall back to M3U parsing for non-Xtream URLs
    console.log('Using M3U parsing...');
    
    const rawMaxBytesMB = typeof maxBytesMB === 'number' ? maxBytesMB : Number(maxBytesMB);
    const safeMaxBytesMB = Number.isFinite(rawMaxBytesMB)
      ? Math.min(Math.max(rawMaxBytesMB, 1), 200)
      : 100;

    const userAgents = [
      'IPTV Smarters/1.0',
      'okHttp/4.9.0',
      'Dalvik/2.1.0 (Linux; U; Android 11; SM-G960F Build/R16NW)',
      'VLC/3.0.18 LibVLC/3.0.18',
    ];

    let lastError;
    for (let attempt = 1; attempt <= 4; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      try {
        console.log(`Attempt ${attempt} with user agent: ${userAgents[attempt - 1] || userAgents[0]}`);

        const urlObj = new URL(url);
        const referer = `${urlObj.protocol}//${urlObj.host}/`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': userAgents[(attempt - 1) % userAgents.length] || userAgents[0],
            'Referer': referer,
            'Accept': '*/*',
            'Accept-Encoding': 'identity',
            'Connection': 'keep-alive',
          },
          signal: controller.signal,
          redirect: 'follow'
        });

        clearTimeout(timeoutId);

        console.log(`Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          console.error(`Failed to fetch m3u on attempt ${attempt}:`, response.status, response.statusText);
          if (attempt === 4) {
            return new Response(
              JSON.stringify({
                blocked: true,
                upstream_status: response.status,
                error: `Failed to fetch m3u file: ${response.status} ${response.statusText}`,
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            );
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        const channels: { name: string; url: string; logo: string; group: string; type: string }[] = [];
        let partialLine = '';
        let bytesRead = 0;
        const maxBytes = safeMaxBytesMB * 1024 * 1024;

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          bytesRead += value.length;
          const chunk = decoder.decode(value, { stream: true });

          const result = parseM3UContent(chunk, channels, partialLine);
          partialLine = result.remainingPartial;

          if (channels.length >= maxChannels || bytesRead >= maxBytes) {
            console.log(`Stopping early: ${channels.length} channels, ${bytesRead} bytes read`);
            reader.cancel();
            break;
          }
        }

        console.log(`Parsed ${channels.length} channels from M3U stream`);
        
        if (channels.length === 0) {
          console.error('No channels parsed');
          if (attempt === 4) {
            return new Response(
              JSON.stringify({ error: 'No channels found in playlist' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          continue;
        }
        
        // Count by type
        const counts = {
          live: channels.filter(c => c.type === 'live').length,
          movies: channels.filter(c => c.type === 'movies').length,
          series: channels.filter(c => c.type === 'series').length,
          sports: channels.filter(c => c.type === 'sports').length,
        };
        
        console.log('Channel counts by type:', counts);
        
        return new Response(
          JSON.stringify({ channels, totalParsed: channels.length, isXtream: false, counts }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error(`Fetch error on attempt ${attempt}:`, fetchError);
        lastError = fetchError;
        
        if (attempt < 4) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError || new Error('Failed to fetch m3u after multiple attempts');
  } catch (error) {
    console.error('Error in fetch-m3u:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
