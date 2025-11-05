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
    
    // Retry logic for network errors
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
      
      try {
        console.log(`Attempt ${attempt} to fetch m3u...`);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'X-Forwarded-For': '192.168.1.100',
            'X-Real-IP': '192.168.1.100',
            'Referer': url.split('/get.php')[0] + '/'
          },
          signal: controller.signal,
          redirect: 'follow'
        });
        
        clearTimeout(timeoutId);
        
        console.log(`Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          console.error(`Failed to fetch m3u on attempt ${attempt}:`, response.status, response.statusText);
          if (attempt === 3) {
            return new Response(
              JSON.stringify({ 
                error: `Failed to fetch m3u file: ${response.status} ${response.statusText}`,
                details: 'The IPTV service may be temporarily unavailable. Please try again later.'
              }),
              { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }

        const content = await response.text();
        console.log('Successfully fetched m3u, length:', content.length);
        
        if (!content || content.length === 0) {
          console.error('Empty content received');
          if (attempt === 3) {
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
        
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }
    }
    
    throw lastError || new Error('Failed to fetch m3u after 3 attempts');
  } catch (error) {
    console.error('Error in fetch-m3u:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
