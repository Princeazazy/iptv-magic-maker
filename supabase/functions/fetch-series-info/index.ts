import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// STB headers to mimic legitimate devices
const stbHeaders = {
  'User-Agent': 'IPTV Smarters Pro/3.0.0 (Linux; STB)',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive',
};

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

interface Episode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info?: {
    duration?: string;
    plot?: string;
    releaseDate?: string;
    rating?: string;
    movie_image?: string;
  };
  url: string;
}

interface Season {
  season_number: number;
  name: string;
  episodes: Episode[];
}

interface SeriesInfo {
  info: {
    name: string;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    releaseDate: string;
    rating: string;
    backdrop_path: string[];
  };
  seasons: Season[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { playlistUrl, seriesId } = body as { playlistUrl?: string; seriesId?: string };

    if (!playlistUrl || !seriesId) {
      return new Response(
        JSON.stringify({ error: 'playlistUrl and seriesId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const creds = parseXtreamCredentials(playlistUrl);
    if (!creds) {
      return new Response(
        JSON.stringify({ error: 'Invalid Xtream Codes URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { baseUrl, username, password } = creds;
    
    // Fetch series info from Xtream API
    const apiUrl = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${seriesId}`;
    
    console.log(`Fetching series info for series_id: ${seriesId}`);
    
    const response = await fetch(apiUrl, { headers: stbHeaders });
    
    if (!response.ok) {
      console.error('Failed to fetch series info:', response.status);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch series info from provider' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (!data || !data.info) {
      return new Response(
        JSON.stringify({ error: 'Invalid series data from provider' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform the data into our expected format
    const seriesInfo: SeriesInfo = {
      info: {
        name: data.info.name || '',
        cover: data.info.cover || '',
        plot: data.info.plot || '',
        cast: data.info.cast || '',
        director: data.info.director || '',
        genre: data.info.genre || '',
        releaseDate: data.info.releaseDate || '',
        rating: data.info.rating || '',
        backdrop_path: data.info.backdrop_path || [],
      },
      seasons: [],
    };

    // Process episodes by season
    if (data.episodes) {
      const episodesBySeason: Record<string, Episode[]> = {};
      
      // Xtream API returns episodes grouped by season number
      for (const [seasonNum, episodes] of Object.entries(data.episodes)) {
        if (!Array.isArray(episodes)) continue;
        
        episodesBySeason[seasonNum] = episodes.map((ep: any) => {
          const ext = ep.container_extension || 'mp4';
          return {
            id: String(ep.id),
            episode_num: ep.episode_num || 0,
            title: ep.title || `Episode ${ep.episode_num}`,
            container_extension: ext,
            info: {
              duration: ep.info?.duration || '',
              plot: ep.info?.plot || '',
              releaseDate: ep.info?.releasedate || ep.info?.air_date || '',
              rating: ep.info?.rating || '',
              movie_image: ep.info?.movie_image || '',
            },
            url: `${baseUrl}/series/${username}/${password}/${ep.id}.${ext}`,
          };
        });
      }
      
      // Convert to sorted seasons array
      const sortedSeasonNums = Object.keys(episodesBySeason)
        .map(Number)
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b);
      
      for (const seasonNum of sortedSeasonNums) {
        const episodes = episodesBySeason[String(seasonNum)] || [];
        // Sort episodes by episode number
        episodes.sort((a, b) => a.episode_num - b.episode_num);
        
        seriesInfo.seasons.push({
          season_number: seasonNum,
          name: `Season ${seasonNum}`,
          episodes,
        });
      }
    }

    console.log(`Found ${seriesInfo.seasons.length} seasons for series ${seriesId}`);

    return new Response(
      JSON.stringify(seriesInfo),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-series-info:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
