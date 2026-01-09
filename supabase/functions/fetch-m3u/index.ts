import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Parse M3U content as we stream it, extracting channels incrementally
// Returns parsed channels array to avoid keeping full content in memory
function parseM3UContent(chunk: string, existingChannels: { name: string; url: string; logo: string; group: string }[], partialLine: string): {
  channels: { name: string; url: string; logo: string; group: string }[];
  remainingPartial: string;
} {
  const content = partialLine + chunk;
  const lines = content.split('\n');
  
  // Keep the last line as partial if it doesn't end with newline
  const remainingPartial = chunk.endsWith('\n') ? '' : lines.pop() || '';
  
  let currentChannel: { name: string; url: string; logo: string; group: string } | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('#EXTINF:')) {
      // Parse channel info
      const nameMatch = trimmedLine.match(/,(.+)$/);
      const logoMatch = trimmedLine.match(/tvg-logo="([^"]+)"/);
      const groupMatch = trimmedLine.match(/group-title="([^"]+)"/);
      
      currentChannel = {
        name: nameMatch ? nameMatch[1].trim() : 'Unknown Channel',
        url: '',
        logo: logoMatch ? logoMatch[1] : '',
        group: groupMatch ? groupMatch[1] : 'Uncategorized'
      };
    } else if (currentChannel && trimmedLine && !trimmedLine.startsWith('#')) {
      // This is the URL line
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
    const { url, maxChannels = 5000 } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching m3u from:', url, 'maxChannels:', maxChannels);
    
    // Multiple user agents to try - IPTV-specific ones
    const userAgents = [
      'IPTV Smarters/1.0',
      'okHttp/4.9.0',
      'Dalvik/2.1.0 (Linux; U; Android 11; SM-G960F Build/R16NW)',
      'VLC/3.0.18 LibVLC/3.0.18',
    ];
    
    let lastError;
    for (let attempt = 1; attempt <= 4; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
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

        // Stream the response body to parse channels incrementally
        // This avoids loading the entire 68MB+ file into memory
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        const channels: { name: string; url: string; logo: string; group: string }[] = [];
        let partialLine = '';
        let bytesRead = 0;
        const maxBytes = 10 * 1024 * 1024; // Process max 10MB to stay within limits

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          bytesRead += value.length;
          const chunk = decoder.decode(value, { stream: true });
          
          const result = parseM3UContent(chunk, channels, partialLine);
          partialLine = result.remainingPartial;
          
          // Stop if we have enough channels or processed enough data
          if (channels.length >= maxChannels || bytesRead >= maxBytes) {
            console.log(`Stopping early: ${channels.length} channels, ${bytesRead} bytes read`);
            reader.cancel();
            break;
          }
        }

        console.log(`Parsed ${channels.length} channels from stream`);
        
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
        
        // Return parsed channels directly instead of raw content
        return new Response(
          JSON.stringify({ channels, totalParsed: channels.length }),
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
