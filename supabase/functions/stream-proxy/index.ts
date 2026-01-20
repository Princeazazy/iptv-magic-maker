// Lovable Cloud backend function: stream-proxy
// Proxies IPTV streams (especially http://) through HTTPS + adds CORS.
// Also rewrites .m3u8 playlists so segments are fetched through this proxy.
// Based on nodecast-tv proxy approach.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 100;
const RATE_LIMIT_WINDOW_MS = 60000;

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }
  
  entry.count++;
  return true;
}

function getClientId(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         'unknown';
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
};

function isHttpUrl(input: string) {
  return /^https?:\/\//i.test(input);
}

function getProxyBase(req: Request) {
  const envSupabaseUrl = (globalThis as any).Deno?.env?.get?.("SUPABASE_URL") as string | undefined;
  if (envSupabaseUrl) {
    return new URL("functions/v1/stream-proxy", envSupabaseUrl).toString();
  }

  const projectRef =
    req.headers.get("sb-project-ref") ||
    req.headers.get("x-sb-project-ref") ||
    req.headers.get("x-supabase-project-ref");

  if (projectRef) {
    return `https://${projectRef}.supabase.co/functions/v1/stream-proxy`;
  }

  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(':', '') || "https";

  return `${proto}://${host}/functions/v1/stream-proxy`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientId = getClientId(req);
  if (!checkRateLimit(clientId)) {
    console.warn('Rate limit exceeded for client:', clientId);
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  const MAX_RETRIES = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const requestUrl = new URL(req.url);
      const upstreamUrl = requestUrl.searchParams.get("url") || "";

      if (!upstreamUrl || !isHttpUrl(upstreamUrl)) {
        return new Response(
          JSON.stringify({ error: "Missing or invalid url parameter" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const upstream = new URL(upstreamUrl);
      const proxyBase = getProxyBase(req);

      console.log("stream-proxy =>", upstreamUrl);

      // Default to IPTV-app-like headers (many providers block generic browser UAs in cloud proxies)
      const iptvHeaders: Record<string, string> = {
        "User-Agent": "IPTV Smarters Pro/3.0.0 (Linux; STB)",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
        "Connection": "keep-alive",
        "Origin": upstream.origin,
        "Referer": upstream.origin + "/",
        "X-Requested-With": "com.nst.iptvsmarterstvbox",
      };

      // Fallback to a standard browser header-set if the IPTV headers are rejected
      const browserHeaders: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": upstream.origin,
        "Referer": upstream.origin + "/",
      };

      // Forward Range header for video seeking support
      const rangeHeader = req.headers.get("range");
      if (rangeHeader) {
        iptvHeaders["Range"] = rangeHeader;
        browserHeaders["Range"] = rangeHeader;
      }

      // Attempt 1: IPTV headers
      let res = await fetch(upstreamUrl, {
        redirect: "follow",
        headers: iptvHeaders,
      });

      // Retry on 5xx errors
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        console.log(`[Proxy] Upstream 5xx error (attempt ${attempt}/${MAX_RETRIES}), retrying...`);
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }

      // Attempt 2 (only for auth-style blocks): browser headers
      if (!res.ok && (res.status === 401 || res.status === 403) && attempt < MAX_RETRIES) {
        console.log(`[Proxy] Got ${res.status} with IPTV headers, trying browser headers...`);
        res = await fetch(upstreamUrl, {
          redirect: "follow",
          headers: browserHeaders,
        });
      }

      if (!res.ok) {
        console.error("Upstream error:", res.status, res.statusText, upstreamUrl);

        return new Response(
          JSON.stringify({
            error: `Upstream error: ${res.status} ${res.statusText}`,
            upstream_status: res.status,
            upstream_url: upstreamUrl,
            hint:
              res.status === 403 || res.status === 401
                ? "This provider may block cloud/proxy playback. Works in native apps but not web."
                : undefined,
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return await processResponse(res, upstreamUrl, proxyBase, req);

    } catch (err) {
      lastError = err as Error;
      console.error(`Stream proxy error (attempt ${attempt}/${MAX_RETRIES}):`, (err as Error).message);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 500));
        continue;
      }
    }
  }

  // All retries failed
  return new Response(
    JSON.stringify({ error: lastError?.message || "Stream proxy failed after retries" }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});

async function processResponse(res: Response, upstreamUrl: string, proxyBase: string, req: Request): Promise<Response> {
  const contentType = res.headers.get("content-type") || "";
  const upstream = new URL(upstreamUrl);
  
  const isPlaylist =
    upstream.pathname.toLowerCase().endsWith(".m3u8") ||
    contentType.toLowerCase().includes("mpegurl");

  // Forward range-related headers
  const responseHeaders = new Headers(corsHeaders);
  
  const contentLength = res.headers.get("content-length");
  const contentRange = res.headers.get("content-range");
  const acceptRanges = res.headers.get("accept-ranges");
  
  if (contentLength) responseHeaders.set("Content-Length", contentLength);
  if (contentRange) responseHeaders.set("Content-Range", contentRange);
  if (acceptRanges) {
    responseHeaders.set("Accept-Ranges", acceptRanges);
  } else if (contentLength && !contentRange) {
    responseHeaders.set("Accept-Ranges", "bytes");
  }

  if (isPlaylist) {
    const text = await res.text();
    
    // Check if it's actually HLS
    if (!text.trim().startsWith("#EXTM3U")) {
      responseHeaders.set("Content-Type", contentType || "application/octet-stream");
      return new Response(text, { status: res.status, headers: responseHeaders });
    }

    // Get base URL for resolving relative paths
    const finalUrl = res.url || upstreamUrl;
    const finalUrlObj = new URL(finalUrl);
    const baseUrl = finalUrlObj.origin + finalUrlObj.pathname.substring(0, finalUrlObj.pathname.lastIndexOf('/') + 1);

    // Rewrite manifest like nodecast-tv
    const rewritten = text.split('\n').map(line => {
      const trimmed = line.trim();
      
      // Empty lines or comments (except URI= attributes)
      if (trimmed === '' || trimmed.startsWith('#')) {
        // Handle URI="..." in #EXT-X-KEY and similar tags
        if (trimmed.includes('URI=')) {
          return line.replace(/URI=["']([^"']+)["']/g, (match, p1) => {
            try {
              const absoluteUrl = new URL(p1, baseUrl).href;
              return `URI="${proxyBase}?url=${encodeURIComponent(absoluteUrl)}"`;
            } catch {
              return match;
            }
          });
        }
        return line;
      }

      // Stream URL lines
      try {
        let absoluteUrl: string;
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          absoluteUrl = trimmed;
        } else {
          absoluteUrl = new URL(trimmed, baseUrl).href;
        }
        return `${proxyBase}?url=${encodeURIComponent(absoluteUrl)}`;
      } catch {
        return line;
      }
    }).join('\n');

    responseHeaders.set("Content-Type", "application/vnd.apple.mpegurl");
    responseHeaders.set("Cache-Control", "no-store");
    
    return new Response(rewritten, { status: res.status, headers: responseHeaders });
  }

  // Binary content (video segments, keys, etc.)
  const isTsStream = upstream.pathname.toLowerCase().endsWith(".ts");
  
  if (isTsStream) {
    responseHeaders.set("Content-Type", "video/mp2t");
  } else if (contentType) {
    responseHeaders.set("Content-Type", contentType);
  } else {
    responseHeaders.set("Content-Type", "application/octet-stream");
  }
  
  responseHeaders.set("Cache-Control", "no-store");

  return new Response(res.body, { status: res.status, headers: responseHeaders });
}
