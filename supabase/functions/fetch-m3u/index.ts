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

    return null;
  } catch {
    return null;
  }
}

// Many providers give an Xtream-style M3U URL (get.php?username=...&password=...&type=m3u...).
// Using the Xtream JSON APIs for these often returns *huge* JSON arrays (40k+ items) that exceed function memory.
// For these URLs we should prefer streaming M3U parsing instead.
function isXtreamGetM3UUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    const type = (u.searchParams.get('type') || '').toLowerCase();
    return path.endsWith('/get.php') && type.includes('m3u');
  } catch {
    return false;
  }
}
type XtreamFetchResult = { items: any[]; total: number; tooLarge?: boolean };

const XTREAM_MAX_JSON_BYTES = 10 * 1024 * 1024; // 10MB safety cap per API response
const XTREAM_MAX_ITEMS_PER_RESPONSE = 50000; // Allow larger responses

function responseTooLarge(res: Response, maxBytes: number): boolean {
  const len = res.headers.get('content-length');
  if (!len) return false;
  const n = Number(len);
  return Number.isFinite(n) && n > maxBytes;
}

// Fetch and process Xtream Codes live streams (category-by-category to avoid huge payloads)
async function fetchXtreamLive(
  baseUrl: string,
  username: string,
  password: string,
  limit: number
): Promise<XtreamFetchResult> {
  try {
    console.log('Fetching Xtream live categories...');
    const categoriesRes = await fetch(
      `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`,
      { headers: { 'User-Agent': 'IPTV Smarters/1.0' } }
    );
    const categories = await categoriesRes.json();
    console.log(`Found ${categories?.length || 0} live categories`);

    const categoryMap = new Map<string, string>();
    const categoryIds: string[] = [];

    if (Array.isArray(categories)) {
      for (const cat of categories) {
        const id = String(cat.category_id);
        categoryIds.push(id);
        categoryMap.set(id, cat.category_name);
      }
    }

    const items: any[] = [];
    let total = 0;

    // Iterate categories until we have enough results.
    for (const categoryId of categoryIds) {
      if (items.length >= limit) break;

      const categoryName = categoryMap.get(categoryId) || 'Uncategorized';

      const url = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams&category_id=${encodeURIComponent(categoryId)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'IPTV Smarters/1.0' } });

      if (!res.ok) {
        console.error('Failed to fetch live streams for category:', categoryId, res.status, res.statusText);
        continue;
      }

      if (responseTooLarge(res, XTREAM_MAX_JSON_BYTES)) {
        console.warn('Live streams response too large (content-length), stopping early');
        return { items, total, tooLarge: true };
      }

      const streams = await res.json().catch(() => null);
      if (!Array.isArray(streams)) continue;

      total += streams.length;

      // If the server ignores category_id, this can still be huge. Bail out.
      if (streams.length > XTREAM_MAX_ITEMS_PER_RESPONSE) {
        console.warn(`Live streams category response too large (${streams.length}), stopping early`);
        return { items, total, tooLarge: true };
      }

      for (const stream of streams) {
        if (items.length >= limit) break;
        items.push({
          name: stream.name || 'Unknown Channel',
          url: `${baseUrl}/live/${username}/${password}/${stream.stream_id}.m3u8`,
          logo: stream.stream_icon || '',
          group: categoryName,
          type: getContentType(categoryName, stream.name || ''),
          stream_id: stream.stream_id,
          epg_channel_id: stream.epg_channel_id,
        });
      }
    }

    console.log(`Collected ${items.length} live items (limit=${limit})`);
    return { items, total };
  } catch (err) {
    console.error('Error fetching Xtream live streams:', err);
    return { items: [], total: 0 };
  }
}

// Fetch Xtream Codes VOD (movies) (category-by-category to avoid huge payloads)
async function fetchXtreamMovies(
  baseUrl: string,
  username: string,
  password: string,
  limit: number
): Promise<XtreamFetchResult> {
  try {
    console.log('Fetching Xtream VOD categories...');
    const categoriesRes = await fetch(
      `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`,
      { headers: { 'User-Agent': 'IPTV Smarters/1.0' } }
    );
    const categories = await categoriesRes.json();
    console.log(`Found ${categories?.length || 0} VOD categories`);

    const categoryMap = new Map<string, string>();
    const categoryIds: string[] = [];

    if (Array.isArray(categories)) {
      for (const cat of categories) {
        const id = String(cat.category_id);
        categoryIds.push(id);
        categoryMap.set(id, cat.category_name);
      }
    }

    const items: any[] = [];
    let total = 0;

    for (const categoryId of categoryIds) {
      if (items.length >= limit) break;

      const categoryName = categoryMap.get(categoryId) || 'Movies';
      const url = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams&category_id=${encodeURIComponent(categoryId)}`;

      const res = await fetch(url, { headers: { 'User-Agent': 'IPTV Smarters/1.0' } });
      if (!res.ok) {
        console.error('Failed to fetch VOD streams for category:', categoryId, res.status, res.statusText);
        continue;
      }

      if (responseTooLarge(res, XTREAM_MAX_JSON_BYTES)) {
        console.warn('VOD streams response too large (content-length), stopping early');
        return { items, total, tooLarge: true };
      }

      const streams = await res.json().catch(() => null);
      if (!Array.isArray(streams)) continue;

      total += streams.length;
      if (streams.length > XTREAM_MAX_ITEMS_PER_RESPONSE) {
        console.warn(`VOD streams category response too large (${streams.length}), stopping early`);
        return { items, total, tooLarge: true };
      }

      for (const stream of streams) {
        if (items.length >= limit) break;
        items.push({
          name: stream.name || 'Unknown Movie',
          url: `${baseUrl}/movie/${username}/${password}/${stream.stream_id}.${stream.container_extension || 'mp4'}`,
          logo: stream.stream_icon || '',
          group: categoryName,
          type: 'movies' as const,
          stream_id: stream.stream_id,
          rating: stream.rating,
          year: stream.year,
          container_extension: stream.container_extension,
        });
      }
    }

    console.log(`Collected ${items.length} movie items (limit=${limit})`);
    return { items, total };
  } catch (err) {
    console.error('Error fetching Xtream VOD:', err);
    return { items: [], total: 0 };
  }
}

// Fetch Xtream Codes series (category-by-category to avoid huge payloads)
async function fetchXtreamSeries(
  baseUrl: string,
  username: string,
  password: string,
  limit: number
): Promise<XtreamFetchResult> {
  try {
    console.log('Fetching Xtream series categories...');
    const categoriesRes = await fetch(
      `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_series_categories`,
      { headers: { 'User-Agent': 'IPTV Smarters/1.0' } }
    );
    const categories = await categoriesRes.json();
    console.log(`Found ${categories?.length || 0} series categories`);

    const categoryMap = new Map<string, string>();
    const categoryIds: string[] = [];

    if (Array.isArray(categories)) {
      for (const cat of categories) {
        const id = String(cat.category_id);
        categoryIds.push(id);
        categoryMap.set(id, cat.category_name);
      }
    }

    const items: any[] = [];
    let total = 0;

    for (const categoryId of categoryIds) {
      if (items.length >= limit) break;

      const categoryName = categoryMap.get(categoryId) || 'Series';
      const url = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_series&category_id=${encodeURIComponent(categoryId)}`;

      const res = await fetch(url, { headers: { 'User-Agent': 'IPTV Smarters/1.0' } });
      if (!res.ok) {
        console.error('Failed to fetch series for category:', categoryId, res.status, res.statusText);
        continue;
      }

      if (responseTooLarge(res, XTREAM_MAX_JSON_BYTES)) {
        console.warn('Series response too large (content-length), stopping early');
        return { items, total, tooLarge: true };
      }

      const streams = await res.json().catch(() => null);
      if (!Array.isArray(streams)) continue;

      total += streams.length;
      if (streams.length > XTREAM_MAX_ITEMS_PER_RESPONSE) {
        console.warn(`Series category response too large (${streams.length}), stopping early`);
        return { items, total, tooLarge: true };
      }

      for (const stream of streams) {
        if (items.length >= limit) break;
        items.push({
          name: stream.name || 'Unknown Series',
          url: '',
          logo: stream.cover || '',
          group: categoryName,
          type: 'series' as const,
          series_id: stream.series_id,
          rating: stream.rating,
          year: stream.year,
        });
      }
    }

    console.log(`Collected ${items.length} series items (limit=${limit})`);
    return { items, total };
  } catch (err) {
    console.error('Error fetching Xtream series:', err);
    return { items: [], total: 0 };
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
    const body = await req.json().catch(() => ({}));
    const {
      url,
      maxChannels = 100000,
      maxBytesMB = 100,
      maxReturnPerType = 50000, // Increased to load all content
      preferXtreamApi = false,
    } = (body ?? {}) as Record<string, unknown>;

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const safeMaxReturnPerType =
      typeof maxReturnPerType === 'number' && Number.isFinite(maxReturnPerType)
        ? Math.min(Math.max(maxReturnPerType, 0), 100000) // Increased cap to 100k
        : 50000;

    const rawMaxChannels = typeof maxChannels === 'number' ? maxChannels : Number(maxChannels);
    const safeMaxChannels = Number.isFinite(rawMaxChannels)
      ? Math.min(Math.max(rawMaxChannels, 0), 500000) // Increased to 500k
      : 100000;

    // We only return up to maxReturnPerType per type; parsing far beyond that is wasted compute.
    // Allow much larger amounts now
    const stopAfterChannels = safeMaxReturnPerType > 0
      ? Math.min(safeMaxChannels, Math.max(10000, safeMaxReturnPerType * 4))
      : safeMaxChannels;

    const rawMaxBytesMB = typeof maxBytesMB === 'number' ? maxBytesMB : Number(maxBytesMB);
    const safeMaxBytesMB = Number.isFinite(rawMaxBytesMB)
      ? Math.min(Math.max(rawMaxBytesMB, 1), 40)
      : 20;

    console.log('Processing URL:', url);

    // Check if this is an Xtream Codes URL
    const xtreamCreds = parseXtreamCredentials(url);
    const isGetM3U = isXtreamGetM3UUrl(url);

    // If preferXtreamApi is enabled, use Xtream JSON APIs with pagination params to keep memory usage low.
    // This is useful when providers block downloading the M3U from our backend.
    if (xtreamCreds && preferXtreamApi) {
      console.log('preferXtreamApi=true, fetching via Xtream API (paged)...');
      const { baseUrl, username, password } = xtreamCreds;

      const limit = safeMaxReturnPerType || 50000;
      console.log(`Using limit of ${limit} per content type`);

      const [liveResult, moviesResult, seriesResult] = await Promise.all([
        fetchXtreamLive(baseUrl, username, password, limit),
        fetchXtreamMovies(baseUrl, username, password, limit),
        fetchXtreamSeries(baseUrl, username, password, limit),
      ]);

      const returnedChannels = [
        ...liveResult.items,
        ...moviesResult.items,
        ...seriesResult.items,
      ];

      return new Response(
        JSON.stringify({
          channels: returnedChannels,
          totalParsed: returnedChannels.length,
          totalAvailable: liveResult.total + moviesResult.total + seriesResult.total,
          isXtream: true,
          counts: {
            live: liveResult.items.length,
            movies: moviesResult.items.length,
            series: seriesResult.items.length,
          },
          totals: {
            live: liveResult.total,
            movies: moviesResult.total,
            series: seriesResult.total,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Fall back to M3U parsing (preferred for resource safety)
    if (xtreamCreds && !preferXtreamApi) {
      console.log('Xtream credentials detected, but using streaming M3U parsing (preferXtreamApi=false)');
    }
    if (xtreamCreds && isGetM3U) {
      console.log('Xtream get.php M3U detected, using streaming M3U parsing to avoid huge JSON API payloads');
    }

    console.log('Using M3U parsing...');

    const userAgents = [
      'IPTV Smarters/1.0',
      'okHttp/4.9.0',
      'Dalvik/2.1.0 (Linux; U; Android 11; SM-G960F Build/R16NW)',
      'VLC/3.0.18 LibVLC/3.0.18',
    ];

    let lastError;
    for (let attempt = 1; attempt <= 4; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

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
            // If this looks like an Xtream-style URL, fall back to the Xtream API (paged) instead of giving up.
            // Many providers block datacenter fetching of get.php M3U, but allow player_api.php.
            if (xtreamCreds) {
              console.log(`M3U fetch blocked (${response.status}). Falling back to Xtream API (paged)...`);
              const { baseUrl, username, password } = xtreamCreds;
              const limit = safeMaxReturnPerType || 50000;

              const [liveResult, moviesResult, seriesResult] = await Promise.all([
                fetchXtreamLive(baseUrl, username, password, limit),
                fetchXtreamMovies(baseUrl, username, password, limit),
                fetchXtreamSeries(baseUrl, username, password, limit),
              ]);

              const returnedChannels = [
                ...liveResult.items,
                ...moviesResult.items,
                ...seriesResult.items,
              ];

              if (returnedChannels.length > 0) {
                return new Response(
                  JSON.stringify({
                    channels: returnedChannels,
                    totalParsed: returnedChannels.length,
                    totalAvailable: liveResult.total + moviesResult.total + seriesResult.total,
                    isXtream: true,
                    m3u_blocked: true,
                    upstream_status: response.status,
                    counts: {
                      live: liveResult.items.length,
                      movies: moviesResult.items.length,
                      series: seriesResult.items.length,
                    },
                    totals: {
                      live: liveResult.total,
                      movies: moviesResult.total,
                      series: seriesResult.total,
                    },
                  }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
                );
              }
            }

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

          if (channels.length >= stopAfterChannels || bytesRead >= maxBytes) {
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
          live: channels.filter((c) => c.type === 'live').length,
          movies: channels.filter((c) => c.type === 'movies').length,
          series: channels.filter((c) => c.type === 'series').length,
          sports: channels.filter((c) => c.type === 'sports').length,
        };

        console.log('Channel counts by type:', counts);

        const returnedChannels = safeMaxReturnPerType > 0
          ? [
              ...channels.filter((c) => c.type === 'live').slice(0, safeMaxReturnPerType),
              ...channels.filter((c) => c.type === 'sports').slice(0, safeMaxReturnPerType),
              ...channels.filter((c) => c.type === 'movies').slice(0, safeMaxReturnPerType),
              ...channels.filter((c) => c.type === 'series').slice(0, safeMaxReturnPerType),
            ]
          : channels;

        return new Response(
          JSON.stringify({ channels: returnedChannels, totalParsed: channels.length, isXtream: false, counts }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
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
