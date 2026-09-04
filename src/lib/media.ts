/*
 * Where the heavy assets are served from.
 *
 * Set VITE_MEDIA_BASE per environment (e.g. https://cdn.example.com, no
 * trailing slash) and every clip and full-bleed image below is fetched from
 * there — a Cloudflare R2 origin that answers real HTTP 206 range requests, so
 * the scrubbed clips seek instead of downloading whole. Railway answers a Range
 * request with the entire file and a 200, which is why this exists.
 *
 * Leave it unset — which is how local dev and a fresh checkout run — and every
 * asset falls back to its Vite-bundled copy, so the site works with no CDN at
 * all. One variable, no code change to roll back, and nothing to fix if the CDN
 * is ever unreachable.
 *
 * Every file must be uploaded under its PLAIN name, exactly as listed:
 *
 *   orbit-desktop.mp4     section 3 footage, 16:9
 *   orbit-mobile.mp4      section 3 footage, 9:16
 *   hero-slide-1.webp     hero slideshow, in order
 *   hero-slide-2.webp
 *   hero-slide-3.webp
 *   hero-slide-4.webp
 *   bento-1.webp          How It Works cards, in order
 *   bento-2.webp
 *   bento-3.webp
 *   bento-4.webp
 *   hero-desktop-480.mp4  CTA backdrop loop
 *
 * Plain names rather than Vite's content hashes is the point: a re-encoded or
 * re-cut file can be re-uploaded over the top and every page picks it up with
 * no rebuild and no deploy.
 *
 * The logo and the two posters stay bundled deliberately. They are tiny
 * first-paint assets where a second DNS + TLS handshake would cost more than it
 * saves, and Vite's content-hashed immutable caching already serves them well.
 */
export const MEDIA_BASE = import.meta.env["VITE_MEDIA_BASE"]?.replace(/\/+$/, "");

/**
 * The CDN URL for `file` (a plain filename that must exist at the media base)
 * when a base is configured, otherwise the Vite-bundled fallback URL.
 *
 * Pass the bundled import as `bundledFallback` — keeping the import is what
 * makes the fallback work, and it costs nothing at runtime when the CDN is on.
 */
export function assetSrc(file: string, bundledFallback: string): string {
  return MEDIA_BASE ? `${MEDIA_BASE}/${file}` : bundledFallback;
}

/** @deprecated Use {@link assetSrc}; kept so existing call sites keep building. */
export const videoSrc = assetSrc;
