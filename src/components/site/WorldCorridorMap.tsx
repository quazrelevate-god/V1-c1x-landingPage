import { useEffect, useRef, useState } from "react";

/*
 * Local reveal observer — deliberately NOT the shared `useInView`.
 *
 * That primitive was neutralised site-wide when section animations were stripped:
 * it returns `inView: true` on mount and its ref never attaches. The map's wave
 * reveal was still wired to it, so every region was already at full opacity before
 * the section came anywhere near the viewport — the animation ran, unseen, and
 * what you scrolled to was a finished static map.
 *
 * This is the one place that still wants a real trigger, so it gets its own rather
 * than un-neutering the shared hook and waking every other section back up.
 *
 * Threshold 0.5: the reveal starts when the map is half on screen, so the viewer
 * is looking at it when the corridors light up.
 */
function useRevealOnce<T extends HTMLElement>(threshold = 0.5) {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          io.disconnect(); // one-shot: the waves shouldn't replay on every pass
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, revealed]);

  return { ref, revealed };
}

type Dot = { x: number; y: number; t?: number };
type Region = { name: string; x: number; y: number; t: number };
type WorldData = { width: number; height: number; points: Dot[]; regions?: Region[] };
type Built = { base: string; live: string[]; soon: string[]; regions: Region[] };

/** Which way each label leans off its anchor, so neighbours don't collide. */
const LABEL_SIDE: Record<string, "left" | "right" | "above"> = {
  India: "right",
  "Middle East": "above",
  Africa: "left",
  Europe: "above",
  Australia: "right",
};

// The source art's frame is fixed, so the viewBox — and therefore the box's
// aspect ratio — are known without loading the 264 KB dot data. That lets the
// SVG reserve its height on first paint (no layout shift) while the heavy data
// is fetched lazily, only once the map nears the viewport.
const MAP_WIDTH = 238;
// Trim the empty southern ocean below the last highlighted landmass (Tasmania).
const height = 106;

/*
 * Dot radii, against a source grid pitch of 0.5 units.
 *
 * These were 0.32 / 0.38, i.e. diameters of 0.64 and 0.76 — 128% and 152% of the
 * pitch. Neighbouring dots overlapped, so landmasses fused into blobs and
 * coastlines lost their shape. Sized under half the pitch, each dot stands alone
 * and the continents resolve.
 */
const DOT_BASE = 0.17;
const DOT_LIVE = 0.21;
const DOT_SOON = 0.17;

const BASE = "#3A3F38";
const ACTIVE = "#9CAD1F";
const SOON = "#5E6B2A";

/** How many waves the highlighted corridors switch on across. */
const WAVES = 16;

const dotAt = (x: number, y: number, r: number) =>
  `M${x.toFixed(1)} ${y.toFixed(1)}m-${r} 0a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 -${r * 2} 0`;

/**
 * The base landmass is one static path. The highlighted corridors are split
 * into concentric waves radiating out from the India origin, so they can
 * switch on in sequence and read as the network populating.
 *
 * Built from the dot data on demand rather than at module load: the base path
 * alone is ~578 KB of coordinates — the single largest DOM payload on the page —
 * and it sits well below the fold, so there is nothing to gain from paying for
 * it (in the SSR document, the JS bundle, or main-thread build time) before the
 * visitor has scrolled anywhere near it.
 */
function buildPaths(data: WorldData): Built {
  let base = "";
  const live: Dot[] = [];
  const soon: Dot[] = [];

  for (const p of data.points) {
    if (p.y > height) continue;
    const t = p.t ?? 0;
    if (t === 1) live.push(p);
    else if (t === 2) soon.push(p);
    else base += dotAt(p.x, p.y, DOT_BASE);
  }

  // origin roughly on the Arabian Sea, between India and the Gulf
  const ox = 160;
  const oy = 62;
  const dist = (p: Dot) => Math.hypot(p.x - ox, p.y - oy);
  const spread = (pts: Dot[], r: number) => {
    const max = pts.reduce((m, p) => Math.max(m, dist(p)), 1);
    const waves: string[] = Array.from({ length: WAVES }, () => "");
    for (const p of pts) {
      const w = Math.min(Math.floor((dist(p) / max) * WAVES), WAVES - 1);
      waves[w] += dotAt(p.x, p.y, r);
    }
    return waves;
  };

  return { base, live: spread(live, DOT_LIVE), soon: spread(soon, DOT_SOON), regions: data.regions ?? [] };
}

const FULL_VIEW = `0 0 ${MAP_WIDTH} ${height}`;
/**
 * Narrow screens crop to the corridors that matter (Europe through Australia)
 * so the country shapes stay legible instead of shrinking to a smudge.
 */
const CORRIDOR_VIEW = "96 4 140 102";

/** Parses a viewBox string so HTML markers can be placed over the same frame. */
function frameOf(view: string) {
  const [vx, vy, vw, vh] = view.split(" ").map(Number) as [number, number, number, number];
  return { vx, vy, vw, vh };
}

export function WorldCorridorMap() {
  const [view, setView] = useState(FULL_VIEW);
  const { ref, revealed } = useRevealOnce<HTMLDivElement>(0.5);
  const frame = frameOf(view);
  // Null until the dot data is imported and turned into paths (see below).
  const [built, setBuilt] = useState<Built | null>(null);

  useEffect(() => {
    // Matches the hero's width cutoff: the full world map is unreadable on a phone
    // or tablet, so anything under a desktop viewport gets the corridor close-up.
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setView(mq.matches ? CORRIDOR_VIEW : FULL_VIEW);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Build the dot field on the client, once, after hydration — NOT gated on
  // scroll. The map must be present wherever its section is, exactly as it was
  // when server-rendered; deferring only the *build* keeps its ~578 KB of path
  // data out of the SSR document and its 264 KB source out of the main bundle,
  // while the map's existence never rides on an observer firing. It's a dynamic
  // import, so it still lands after first paint rather than blocking it.
  useEffect(() => {
    let cancelled = false;
    import("./world-dots.json")
      .then((m) => {
        if (!cancelled) setBuilt(buildPaths((m.default ?? m) as WorldData));
      })
      .catch(() => {
        /* offline or chunk fetch failed — the map just doesn't populate */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const regions = built?.regions ?? [];

  return (
    <div ref={ref} className="relative w-full">
      <svg
        viewBox={view}
        className="h-auto w-full"
        role="img"
        aria-label="World map highlighting active regions in India, the Middle East and Africa, with Europe and Australia coming soon"
      >
        {built ? (
          <>
            {/* The base landmass is on the instant it builds — its visibility
                never rides on the reveal timing, so the map can't come up blank. */}
{/*
              userSpaceOnUse, spanning the map's own coordinates — not the default
              objectBoundingBox. The live regions are drawn as 16 separate wave
              paths, and a bounding-box gradient would restart inside each one, so
              the ramp would visibly reset wave by wave. In user space all 16 read
              from a single gradient laid across the whole map.
            */}
            <defs>
              <linearGradient
                id="c1x-live-grad"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={height}
              >
                <stop offset="0%" stopColor="#D4E84A" />
                <stop offset="55%" stopColor="#9CAD1F" />
                <stop offset="100%" stopColor="#6E7D12" />
              </linearGradient>
            </defs>

            <path d={built.base} fill={BASE} opacity={0.85} />
            {built.soon.map((d, i) => (
              <path
                key={`s${i}`}
                d={d}
                fill={SOON}
                style={{
                  opacity: revealed ? 0.7 : 0,
                  transition: `opacity 420ms linear ${360 + i * 78}ms`,
                }}
              />
            ))}
            {built.live.map((d, i) => (
              <path
                key={`l${i}`}
                d={d}
                fill="url(#c1x-live-grad)"
                style={{
                  opacity: revealed ? 0.95 : 0,
                  transition: `opacity 380ms linear ${i * 78}ms`,
                }}
              />
            ))}
          </>
        ) : null}
      </svg>

      {/*
        Region markers ride over the SVG as HTML rather than <text>, so the type
        stays at a readable size whether the map is showing the whole world or
        the mobile corridor crop.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {regions.map((r, i) => {
          const left = ((r.x - frame.vx) / frame.vw) * 100;
          const top = ((r.y - frame.vy) / frame.vh) * 100;
          if (left < -4 || left > 104 || top < -4 || top > 104) return null;
          const live = r.t === 1;
          const side = LABEL_SIDE[r.name] ?? "right";
          return (
            <div
              key={r.name}
              className="absolute flex items-center gap-1.5 transition-opacity duration-500"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform:
                  side === "left"
                    ? "translate(-100%, -50%)"
                    : side === "above"
                      ? "translate(-50%, -140%)"
                      : "translate(0, -50%)",
                opacity: revealed ? 1 : 0,
                transitionDelay: `${1250 + i * 110}ms`,
              }}
            >
              {side === "left" ? <RegionLabel name={r.name} live={live} /> : null}
              <span className="relative flex h-1.5 w-1.5 shrink-0 items-center justify-center">
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ background: live ? ACTIVE : SOON }}
                />
                {live ? (
                  <span
                    className="corridor-ping absolute inset-0 rounded-full"
                    style={{ background: ACTIVE }}
                  />
                ) : null}
              </span>
              {side === "left" ? null : <RegionLabel name={r.name} live={live} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RegionLabel({ name, live }: { name: string; live: boolean }) {
  return (
    // A dark pill keeps the type readable where it crosses the dot field.
    <span
      className="rounded-full px-1.5 py-0.5 font-display text-[0.58rem] leading-none tracking-[0.02em] whitespace-nowrap uppercase sm:text-[0.7rem]"
      style={{
        color: live ? ACTIVE : SOON,
        background: "color-mix(in oklab, var(--background) 78%, transparent)",
        border: `1px solid color-mix(in oklab, ${live ? ACTIVE : SOON} 26%, transparent)`,
      }}
    >
      {name}
    </span>
  );
}
