/*
 * Where the videos are served from.
 *
 * Set VITE_MEDIA_BASE per environment (e.g. https://cdn.example.com, no
 * trailing slash) and every hero/loop clip is fetched from there — the CDN
 * (Cloudflare R2) origin that answers real HTTP 206 range requests, so the
 * scrubbed clips seek instead of downloading whole. Leave it unset — which is
 * how local dev and a fresh checkout run — and each clip falls back to its
 * Vite-bundled copy, so the site still works with no CDN. One variable, no code
 * change to roll back.
 *
 * Every clip on the CDN must be uploaded under its plain filename:
 *   hero-desktop.mp4      desktop scrub master
 *   hero-mobile.mp4       phone scrub cut
 *   hero-desktop-480.mp4  loop for the reduced-motion hero and the CTA backdrop
 *
 * Videos only. Posters stay bundled: they are tiny first-paint assets where a
 * second DNS + TLS handshake would cost more than it saves, and Vite's
 * content-hashed immutable caching already serves them well.
 */
export const MEDIA_BASE = import.meta.env["VITE_MEDIA_BASE"]?.replace(/\/+$/, "");

/**
 * The CDN URL for `file` (a plain filename that must exist at the media base)
 * when a base is configured, otherwise the Vite-bundled fallback URL.
 */
export function videoSrc(file: string, bundledFallback: string): string {
  return MEDIA_BASE ? `${MEDIA_BASE}/${file}` : bundledFallback;
}
