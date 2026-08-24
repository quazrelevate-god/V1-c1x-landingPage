# Serving the hero master from a CDN

The landscape hero clip (`src/assets/hero-desktop.mp4`, 7.4 MB) can be served
from an external origin instead of the app's own bundle. Set `VITE_MEDIA_BASE`
and the hero fetches `<base>/hero-desktop.mp4`; leave it unset and it uses the
bundled copy, which is what local dev does.

Nothing else moves. See "What stays bundled" at the bottom for why.

---

## Why bother

Not for the reason you'd expect. Railway already serves from a Singapore edge
(`x-railway-edge: sin1`) with `cache-control: public, max-age=31536000,
immutable`, so latency and caching are already fine.

The problem is **byte ranges**. Railway ignores them:

```
$ curl -sI -H 'Range: bytes=100-199' <railway>/assets/hero-desktop-<hash>.mp4
HTTP/2 200
content-length: 7450645          # asked for 100 bytes, got all 7.4 MB
```

With no range support the browser reports the clip as unseekable, so
`src/components/site/Hero.tsx` falls back to downloading the whole file as a
blob before the scroll-scrub runs smoothly. R2 answers properly:

```
$ curl -sI -H 'Range: bytes=100-199' <r2>/hero-desktop.mp4
HTTP/1.1 206 Partial Content
Content-Range: bytes 100-199/7450645
Accept-Ranges: bytes
```

That is the whole point of this. **If a candidate origin returns 200 to the
first command, it buys you nothing** — check before wiring it up.

---

## Setup

### 1. Put the domain on Cloudflare

R2 custom domains only work for zones Cloudflare hosts. If you bought the domain
elsewhere, add it in the Cloudflare dashboard (*Add a site*) and repoint the
nameservers at your registrar. Propagation is usually under an hour but can take
longer; the zone must read **Active** before step 2 will work.

### 2. Connect the domain to the bucket

Dashboard → **R2** → your bucket → **Settings** → **Public access** → **Custom
Domains** → **Connect Domain**. Use a subdomain, e.g. `cdn.example.com`.

Cloudflare creates the CNAME itself and issues a certificate. It takes a few
minutes to go **Active** — until then you'll get TLS errors, which is expected
and not worth debugging.

Once it's live you can turn off the `r2.dev` public URL. That one is
rate-limited and Cloudflare advises against production use.

### 3. Upload the clip

Only `hero-desktop.mp4` is needed. Either drag it into the bucket in the
dashboard, or:

```bash
npx wrangler r2 object put <bucket>/hero-desktop.mp4 \
  --file=src/assets/hero-desktop.mp4 \
  --content-type=video/mp4 \
  --cache-control "public, max-age=31536000, immutable"
```

### 4. Set Cache-Control — don't skip this

R2 sends **no `Cache-Control` header** of its own. Railway currently sends
`immutable`, so without this step the swap makes repeat visits *worse*: the
browser revalidates instead of skipping the request outright.

Either set it per-object as above, or add a **Cache Rule** (Rules → Caching)
scoped to the CDN hostname with an explicit Browser TTL.

### 5. Verify before pointing the app at it

```bash
curl -sI -H 'Range: bytes=0-1' https://cdn.example.com/hero-desktop.mp4
```

Expect `206`, a `Content-Range`, and a `Cache-Control`. If you see `200`, stop —
steps 2–4 aren't done and switching over would be a downgrade.

### 6. Point the app at it

Railway → the `web` service → **Variables**:

```
VITE_MEDIA_BASE=https://cdn.example.com
```

No trailing slash. This is a `VITE_` variable, so unlike `DEMO_WEBHOOK_URL` it
is deliberately compiled into the browser bundle — it's a public asset URL, not
a secret. It's read at **build** time, so it only takes effect on a fresh
deploy, which setting the variable triggers anyway.

To roll back, clear the variable and redeploy.

---

## Replacing the video later

R2 object names carry no content hash, so a CDN and the browsers that have
already cached it will happily keep serving the old bytes.

Use the base as the version prefix. Publish to `v2/hero-desktop.mp4` and set:

```
VITE_MEDIA_BASE=https://cdn.example.com/v2
```

New URL, no purge needed, and the previous version stays reachable for rollback.

---

## What stays bundled, and why

| Asset | Size | Served from |
|---|---:|---|
| `hero-desktop.mp4` | 7.4 MB | CDN when `VITE_MEDIA_BASE` is set |
| `hero-mobile.mp4` | 1.6 MB | bundle |
| `hero-loop.mp4` | 2.4 MB | bundle |
| `hero-port.jpg` | 176 KB | bundle |
| `logo.png` | 36 KB | bundle |
| `hero-open-poster.jpg` | 16 KB | bundle |
| `hero-mobile-poster.jpg` | 12 KB | bundle |

- **The two posters paint before any video arrives.** Moving a 12 KB file to a
  second origin adds a DNS lookup, TCP connect and TLS handshake — roughly
  200–300 ms — to the first thing the visitor sees. That is a net loss.
- **`hero-loop.mp4` and `hero-port.jpg` only render under
  `prefers-reduced-motion`.** A normal visitor never downloads them, so moving
  them would speed up nobody.
- **Everything except the master is ~2% of shipped bytes**, and bundling keeps
  Vite's content-hashed `immutable` caching, which a CDN origin gives up.

Note that `hero-desktop.mp4` is still emitted into the build output even when
the CDN is in use — the import remains as the fallback path. It costs deploy
image size, not visitor bandwidth: with the variable set, no browser requests
it.

## Assets that ship to nobody

These sit in `src/assets/` but are referenced by no rendered component, so they
never reach a browser. Don't bother uploading them; they're candidates for
deletion instead (git history keeps them):

`hero-scrub.mp4` (7.3 MB) · `freight-sea.png` (1.6 MB) · `freight-road.png`
(1.3 MB) · `freight-air.png` (688 KB) · `cargo-container.glb` (308 KB) ·
`c1x-hero-bg.png` (140 KB) · `problem.jpg` (116 KB, imported in `Problem.tsx`
but never used, so Rollup drops it) · `who-*.jpg` (180 KB) · `logo-ink.png`
(36 KB)
