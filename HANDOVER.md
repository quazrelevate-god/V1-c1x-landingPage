# Corridor One X — Handover

Snapshot of where the site stands, what's mid-flight, and what's left. Written for
whoever (human or Claude) picks this up next.

## Stack

- TanStack Start + Vite + Nitro, React, Tailwind CSS
- Built and edited primarily through **Lovable** (GitHub-connected, commits land on `main`
  via the `gpt-engineer-app[bot]`)
- Deployed on **Vercel**, tracking `main`
- `@react-three/fiber` / `@react-three/drei` / `three` are installed but only used by the
  hero intro (see below)

## Repo delivery pattern (read this before editing)

Almost every commit in `git log` was authored by Lovable's bot, not pushed directly. The
working pattern that's held up across this project:

1. Edit through Lovable (chat or MCP), which commits straight to `main`.
2. If Lovable-uploaded media is involved, **verify it landed as a real binary**, not a
   `.asset.json` pointer. Lovable externalizes chat-uploaded assets to its own
   `/__l5e/assets-v1/...` CDN, which only resolves on Lovable's own hosting — Vercel builds
   will 404 on them. This has bitten the project twice already (hero images, then the hero
   video). Fix is the same each time: pull the real file via Lovable's dev server/MCP,
   delete the pointer, re-point the import. Consider adding a standing instruction to
   Lovable's project knowledge to always commit real files for chat uploads.
3. Direct `git push` to this repo from a sandboxed session may return 403 depending on the
   environment — if so, Lovable MCP → `main` is the fallback delivery route.

## Hero section — current state

`src/routes/index.tsx` renders `<Nav />` then `<Hero />`; section order is fixed per client
sign-off, don't reorder.

**On `main` right now:** a CSS-mask "portal" intro — the mark scales/fades using an SVG
mask rather than real 3D depth.

**Sitting uncommitted in the working tree** (not yet pushed anywhere): a revised version
that swaps the CSS mask for an actual 3D render of the mark, per client feedback that the
flat version didn't read as "flying through the logo." Changed files:

- `src/components/site/Hero.tsx` — modified. Scroll-driven intro (`INTRO_END = 0.34` of the
  section's scroll range), cross-fades into a scroll-scrubbed video hero, mobile fallback
  is a plain autoplay loop with no 3D.
- `src/components/site/Nav.tsx` — modified. Nav opacity now fades in sync with the intro
  (`INTRO_END` here must stay equal to the one in `Hero.tsx`).
- `src/components/site/XMarkScene.tsx` — new file. R3F `<Canvas>` rendering
  `public/models/x-mark.gltf` with a corrected lime `MeshStandardMaterial` (source material
  is metalness=1/roughness=1 and renders near-black unmodified) and a `-0.6` rad Y
  counter-rotation (the source geometry is baked at ~35° off-axis).

**This uncommitted three.js path is likely going to be superseded.** The client has
decided to hand-render the intro as a video instead of shipping a live three.js scene to
production. Once those renders are delivered:

1. Wire them into `Hero.tsx` as `<video>` elements in place of the `<XMarkScene>` Canvas,
   keeping the existing cross-fade-into-hero and nav-fade-in timing.
2. Delete `XMarkScene.tsx` and drop `@react-three/fiber` / `@react-three/drei` / `three`
   from `package.json` if nothing else in the app uses them.
3. Ship via the delivery route above.

**Video specs handed to the client for the self-render** (desktop + mobile, separate
files):

| | Desktop | Mobile |
|---|---|---|
| Frame | 1920×1080 (16:9) | 1080×1920 (9:16) |
| Codec | H.264, `yuv420p`, `faststart` | same |
| Audio | strip entirely | same |
| Target size | 4–8 MB | same |
| Background | `#0A0A0A` | same |
| Icon color | `#C4D82E` lime | same |
| Safe zone | keep the action inside the centered ~80% — the video will be `object-cover` cropped on odd viewport ratios | same |

**Two decisions still open, needed before wiring the final videos in:**

- Autoplay-once vs. scroll-scrubbed? Scrub needs dense keyframes (the existing
  `hero-scrub.mp4` uses ~0.417s intervals) and changes how `currentTime` is driven in
  `Hero.tsx`; autoplay is a much simpler swap.
- Remove the R3F code now (before videos arrive) or hold until the replacement is ready to
  ship in the same pass? Currently held — the uncommitted diff above is untouched pending
  the videos.

## Outstanding tasks (from the original brief, not started)

1. **Mobile responsiveness pass.** Full pass over every section — this has not been
   audited section-by-section yet, only the hero has explicit mobile handling.
2. **Global Corridors map performance.** `src/components/site/WorldCorridorMap.tsx`
   (used by `src/components/site/Logistics.tsx`) currently animates in ~3000 individually
   rendered SVG dots from `src/components/site/world-dots.json` one at a time — this is the
   main perf bottleneck on that section. Replace with a static, pre-baked SVG (no
   dot-by-dot reveal animation) and drop the per-dot render cost.
3. **Horizontal overflow.** Something on the page exceeds viewport width — audit for the
   offending element(s) and add an `overflow-x: hidden` safeguard at the layout root as a
   backstop.
4. **Stray files.** `s2.png` and `s3.png` are sitting in the repo root, unused — confirmed
   still present, safe to delete once you verify nothing references them.

## Known gotchas

- Local dev server (`vite`) may fail to bind in some sandboxed environments because
  Lovable's Vite config hard-binds IPv6 `::` — use a static file server + browser/Playwright
  for visual verification if `bun run dev` won't start.
- `bun.lock` can end up pinned to Lovable's private npm registry
  (`europe-west1-npm.pkg.dev`), which 403s outside Lovable's own infra. If installs fail,
  delete the lockfile and reinstall against `https://registry.npmjs.org` — all the packages
  involved are public.
- The security-sensitive tokens (GitHub PAT, Vercel token) that were pasted into chat
  earlier in this project were never used for anything and should be rotated if that
  hasn't happened already.
