// Lovable Cloud backend function: stream-proxy
// Proxies IPTV streams (especially http://) through HTTPS + adds CORS.
// Also rewrites .m3u8 playlists so segments are fetched through this proxy.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isHttpUrl(input: string) {
  return /^https?:\/\//i.test(input);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestUrl = new URL(req.url);
    const upstreamUrl = requestUrl.searchParams.get("url") || "";

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
    const referer = `${upstream.protocol}//${upstream.host}/`;

    // Base URL of this proxy (no query string)
    requestUrl.search = "";
    const proxyBase = requestUrl.toString();

    console.log("stream-proxy =>", upstreamUrl);

    const res = await fetch(upstreamUrl, {
      redirect: "follow",
      headers: {
        // Many IPTV providers are picky about these
        "User-Agent": "IPTV Smarters/1.0",
        "Referer": referer,
        "Accept": "*/*",
        "Connection": "keep-alive",
      },
    });

    const contentType = res.headers.get("content-type") || "";
    const isPlaylist =
      upstream.pathname.toLowerCase().endsWith(".m3u8") ||
      contentType.toLowerCase().includes("mpegurl");

    if (isPlaylist) {
      const text = await res.text();

      // Rewrite every URI line to pass through proxy (handles relative + absolute)
      const rewritten = text
        .split(/\r?\n/)
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return line;
          try {
            const absolute = new URL(trimmed, upstreamUrl).toString();
            return `${proxyBase}?url=${encodeURIComponent(absolute)}`;
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
