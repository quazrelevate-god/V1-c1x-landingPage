import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

/*
 * Content types worth gzipping. The SSR document is the one that matters — it is
 * served uncompressed and dominated by inline SVG path data, so it compresses by
 * roughly 8x — but the list also covers the JSON/text a route can return. Binary
 * media (video, images, fonts) is already compressed and is skipped.
 */
const COMPRESSIBLE_TYPE =
  /^(?:text\/(?:html|plain|css|javascript|xml)|application\/(?:json|xml|javascript|manifest\+json)|image\/svg\+xml)\b/i;

/**
 * Whether the client asked for gzip and did not explicitly opt out with q=0.
 * Range requests carry `identity` for byte-exact seeking, which this respects.
 */
function acceptsGzip(request: Request): boolean {
  const accept = (request.headers.get("accept-encoding") ?? "").toLowerCase();
  if (!accept.includes("gzip")) return false;
  return !/gzip\s*;\s*q=0(?:\.0+)?(?![.\d])/.test(accept);
}

/*
 * Compress qualifying responses at the edge of our handler.
 *
 * Nitro pre-compresses the static assets in .output/public at build time, which
 * is why the JS and CSS arrive gzipped — but the streamed SSR HTML never passed
 * through that path and shipped raw (≈870 KB on the landing route). This wraps
 * the response body in the standard CompressionStream, which keeps the response
 * streaming rather than buffering it whole, and works on both the Node and
 * Workers runtimes Nitro can target. Anything already encoded, partial (206),
 * bodiless (204/304) or a non-text type is passed straight through.
 */
function withCompression(request: Request, response: Response): Response {
  if (typeof CompressionStream === "undefined") return response;
  if (!response.body) return response;
  if (response.status === 204 || response.status === 206 || response.status === 304) {
    return response;
  }
  if (response.headers.has("content-encoding") || response.headers.has("content-range")) {
    return response;
  }
  if (!COMPRESSIBLE_TYPE.test(response.headers.get("content-type") ?? "")) return response;
  if (!acceptsGzip(request)) return response;

  const compressed = response.body.pipeThrough(new CompressionStream("gzip"));
  const headers = new Headers(response.headers);
  headers.set("content-encoding", "gzip");
  // The length no longer describes the compressed stream; let it go chunked.
  headers.delete("content-length");
  const vary = headers.get("vary");
  if (!vary) {
    headers.set("vary", "Accept-Encoding");
  } else if (!/\baccept-encoding\b/i.test(vary)) {
    headers.set("vary", `${vary}, Accept-Encoding`);
  }
  return new Response(compressed, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withCompression(request, await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return withCompression(
        request,
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
