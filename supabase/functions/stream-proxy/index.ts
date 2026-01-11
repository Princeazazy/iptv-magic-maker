// Lovable Cloud backend function: stream-proxy
// Proxies IPTV streams (especially http://) through HTTPS + adds CORS.
// Also rewrites .m3u8 playlists so segments are fetched through this proxy.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 100; // max requests per window (higher for streaming)
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
};

function isHttpUrl(input: string) {
  return /^https?:\/\//i.test(input);
}

function getProxyBase(req: Request) {
  const url = new URL(req.url);

  // Most reliable when the runtime provides the full public path.
  // Example: https://<project>.supabase.co/functions/v1/stream-proxy
  if (url.pathname.includes('/functions/v1/') && url.pathname.includes('/stream-proxy')) {
    return `${url.origin}${url.pathname}`;
  }

  // Fallback: rebuild a stable public URL from forwarded headers.
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}/functions/v1/stream-proxy`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientId = getClientId(req);
  if (!checkRateLimit(clientId)) {
    console.warn('Rate limit exceeded for client:', clientId);
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  try {
    const requestUrl = new URL(req.url);
    const upstreamUrl = requestUrl.searchParams.get("url") || "";
    const refererOverride = requestUrl.searchParams.get("ref") || "";

    if (!upstreamUrl || !isHttpUrl(upstreamUrl)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid url parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const upstream = new URL(upstreamUrl);
    const referer = refererOverride && isHttpUrl(refererOverride)
      ? refererOverride
      : `${upstream.protocol}//${upstream.host}/`;

    const proxyBase = getProxyBase(req);

    console.log("stream-proxy =>", upstreamUrl);

    const range = req.headers.get('range');

    const baseHeaders: Record<string, string> = {
      // Many IPTV providers are picky about these
      "Referer": referer,
      "Accept": "*/*",
      "Accept-Encoding": "identity",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    };
    if (range) baseHeaders["Range"] = range;

    const userAgents = [
      "IPTV Smarters Pro/1.0",
      "IPTV Smarters/1.0",
      "okHttp/4.9.0",
      "Dalvik/2.1.0 (Linux; U; Android 11; SM-G960F Build/R16NW)",
      "VLC/3.0.18 LibVLC/3.0.18",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ];

    const fetchWithRetries = async () => {
      let lastRes: Response | null = null;
      for (const ua of userAgents) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        try {
          const res = await fetch(upstreamUrl, {
            redirect: "follow",
            headers: { ...baseHeaders, "User-Agent": ua },
            signal: controller.signal,
          });
          if (res.ok) return res;
          lastRes = res;
          // Retry on common "blocked"/gateway statuses.
          if (![401, 403, 429, 500, 502, 503, 504].includes(res.status)) {
            return res;
          }
        } catch {
          // ignore and retry
        } finally {
          clearTimeout(timeout);
        }
      }
      return lastRes;
    };

    const res = await fetchWithRetries();

    if (!res || !res.ok) {
      const status = res?.status ?? 0;
      const statusText = res?.statusText ?? 'Fetch failed';
      const preview = res ? await res.clone().text().catch(() => "") : "";
      console.error("Upstream error:", status, statusText, upstreamUrl);
      return new Response(
        JSON.stringify({
          error: `Upstream error: ${status} ${statusText}`,
          upstream_status: status,
          upstream_url: upstreamUrl,
          preview: preview.slice(0, 300),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const contentType = res.headers.get("content-type") || "";
    const isPlaylist =
      upstream.pathname.toLowerCase().endsWith(".m3u8") ||
      contentType.toLowerCase().includes("mpegurl");

    if (isPlaylist) {
      const text = await res.text();

      // Rewrite every URI line to pass through proxy (handles relative + absolute)
      // Add `ref` so segment requests can send a correct Referer header (some providers require it).
      const rewritten = text
        .split(/\r?\n/)
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return line;
          try {
            const absolute = new URL(trimmed, upstreamUrl).toString();
            return `${proxyBase}?url=${encodeURIComponent(absolute)}&ref=${encodeURIComponent(upstreamUrl)}`;
          } catch {
            return line;
          }
        })
        .join("\n");

      return new Response(rewritten, {
        status: res.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-store",
        },
      });
    }

    // Pass-through for segments (ts/m4s/mp4/etc.)
    const passthroughHeaders = new Headers(corsHeaders);
    if (contentType) passthroughHeaders.set("Content-Type", contentType);

    // Avoid caching for IPTV streams
    passthroughHeaders.set("Cache-Control", "no-store");

    return new Response(res.body, {
      status: res.status,
      headers: passthroughHeaders,
    });
  } catch (error) {
    console.error("Error in stream-proxy:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
