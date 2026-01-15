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

  // IMPORTANT:
  // The edge runtime may expose an internal hostname for req.url (e.g. edge-runtime.*).
  // If we use that for playlist rewriting, segment URLs will point to the wrong host and
  // can return 401.

  // 1) Prefer the canonical public project URL from environment (most reliable).
  const envSupabaseUrl = (globalThis as any).Deno?.env?.get?.("SUPABASE_URL") as string | undefined;
  if (envSupabaseUrl) {
    return new URL("functions/v1/stream-proxy", envSupabaseUrl).toString();
  }

  // 2) Fall back to project ref headers (when available).
  const projectRef =
    req.headers.get("sb-project-ref") ||
    req.headers.get("x-sb-project-ref") ||
    req.headers.get("x-supabase-project-ref");

  if (projectRef) {
    return `https://${projectRef}.supabase.co/functions/v1/stream-proxy`;
  }

  // 3) Final fallback: use forwarded/public host headers.
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(':', '') || "https";

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
      // Mimic Android APK requests to bypass web restrictions
      "Referer": referer,
      "Origin": `${upstream.protocol}//${upstream.host}`,
      "Accept": "*/*",
      "Accept-Encoding": "identity",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "X-Requested-With": "com.nst.iptvsmarterstvbox",
      "Accept-Language": "en-US,en;q=0.9",
      // Some providers check these
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors", 
      "Sec-Fetch-Site": "same-origin",
    };
    if (range) baseHeaders["Range"] = range;

    // Prioritize Android APK User-Agents to bypass web restrictions
    const userAgents = [
      "Dalvik/2.1.0 (Linux; U; Android 13; Pixel 7 Pro Build/TQ3A.230805.001)",
      "okhttp/4.12.0",
      "IPTV Smarters Pro/3.1.5",
      "TiviMate/4.7.0 (Linux; Android 12; SM-S908B)",
      "GSE SMART IPTV/7.4 (Android 11; TV)",
      "Kodi/20.2 (Linux; Android 12; SHIELD Android TV Build/SQ3A.220705.003.A1)",
      "ExoPlayer/2.19.1 (Linux; Android 13) ExoPlayerLib/2.19.1",
      "VLC/3.5.4 LibVLC/3.0.18 (Android 12; armv8l)",
      "Perfect Player IPTV/1.6.0.1 (Linux; Android 10)",
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
    const isTsStream = upstream.pathname.toLowerCase().endsWith(".ts");

    if (isPlaylist) {
      const text = await res.text();

      // Rewrite every URI line to pass through proxy (handles relative + absolute)
      // NOTE: We intentionally return a RELATIVE URL here.
      // If we emit an absolute origin, some runtimes will use an internal hostname
      // (e.g. edge-runtime.*) which breaks segment fetching with 401s.
      // A relative URL ensures the client fetches segments from the same public host
      // that served this playlist.
      const rewritten = text
        .split(/\r?\n/)
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return line;
          try {
            const absolute = new URL(trimmed, upstreamUrl).toString();
            return `?url=${encodeURIComponent(absolute)}&ref=${encodeURIComponent(upstreamUrl)}`;
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

    // For TS streams (continuous transport stream), set appropriate content type
    const passthroughHeaders = new Headers(corsHeaders);
    if (isTsStream) {
      passthroughHeaders.set("Content-Type", "video/mp2t");
    } else if (contentType) {
      passthroughHeaders.set("Content-Type", contentType);
    }

    // Allow caching for video segments, but not for live streams
    passthroughHeaders.set("Cache-Control", "no-store");

    // For large streams, pass through the body directly
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
