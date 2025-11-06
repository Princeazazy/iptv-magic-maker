import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching m3u from:', url);
    
    // Multiple user agents to try
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'VLC/3.0.18 LibVLC/3.0.18',
      'Lavf/58.76.100'
    ];
    
    // Retry logic with different user agents
    let lastError;
    for (let attempt = 1; attempt <= 4; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        console.log(`Attempt ${attempt} with user agent: ${userAgents[attempt - 1] || userAgents[0]}`);
        
        // Extract domain from URL for Referer header
        const urlObj = new URL(url);
        const referer = `${urlObj.protocol}//${urlObj.host}/`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': userAgents[attempt - 1] || userAgents[0],
            'Referer': referer,
            'Origin': referer.replace(/\/$/, ''),
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'identity',
            'Connection': 'keep-alive'
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
                error: `Failed to fetch m3u file: ${response.status} ${response.statusText}`,
                details: 'Try accessing the URL directly in your browser. If it works there, the IPTV provider may be blocking server requests.'
              }),
              { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          // Wait before retry with different user agent
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        const content = await response.text();
        console.log('Successfully fetched m3u, length:', content.length);
        
        if (!content || content.length === 0) {
          console.error('Empty content received');
          if (attempt === 4) {
            return new Response(
              JSON.stringify({ error: 'Empty content received from IPTV service' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          continue;
        }
        
        return new Response(
          JSON.stringify({ content }),
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
    
    throw lastError || new Error('Failed to fetch m3u after multiple attempts with different configurations');
  } catch (error) {
    console.error('Error in fetch-m3u:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
