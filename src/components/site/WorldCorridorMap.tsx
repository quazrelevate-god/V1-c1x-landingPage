import { useEffect, useState } from "react";
import data from "./world-dots.json";
import { useInView } from "./primitives";

type Dot = { x: number; y: number; t?: number };
type Region = { name: string; x: number; y: number; t: number };

/** Which way each label leans off its anchor, so neighbours don't collide. */
const LABEL_SIDE: Record<string, "left" | "right" | "above"> = {
  India: "right",
  "Middle East": "above",
  Africa: "left",
  Europe: "above",
  Australia: "right",
};

const { width } = data;
// Trim the empty southern ocean below the last highlighted landmass (Tasmania).
const height = 106;

const BASE = "#3A3F38";
const ACTIVE = "#9CAD1F";
const SOON = "#5E6B2A";

/** How many waves the highlighted corridors switch on across. */
const WAVES = 16;

const dotAt = (x: number, y: number, r: number) =>
  `M${x.toFixed(1)} ${y.toFixed(1)}m-${r} 0a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 -${r * 2} 0`;

/**
 * The base landmass is one static path. The highlighted corridors are split
 * into concentric waves radiating out from the India–Gulf corridor, so they can
 * switch on in sequence and read as the network populating.
 */
function buildPaths() {
  let base = "";
  const live: Dot[] = [];
  const soon: Dot[] = [];

  for (const p of data.points as Dot[]) {
    if (p.y > height) continue;
    const t = p.t ?? 0;
    if (t === 1) live.push(p);
    else if (t === 2) soon.push(p);
    else base += dotAt(p.x, p.y, 0.32);
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

  return { base, live: spread(live, 0.38), soon: spread(soon, 0.32) };
}

const { base: basePath, live: liveWaves, soon: soonWaves } = buildPaths();

const regions = (data.regions ?? []) as Region[];

const FULL_VIEW = `0 0 ${width} ${height}`;
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
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const frame = frameOf(view);

  useEffect(() => {
    // Matches the hero's width cutoff: the full world map is unreadable on a phone
    // or tablet, so anything under a desktop viewport gets the corridor close-up.
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setView(mq.matches ? CORRIDOR_VIEW : FULL_VIEW);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <svg
        viewBox={view}
        className="h-auto w-full"
        role="img"
        aria-label="World map highlighting active regions in India, the Middle East and Africa, with Europe and Australia coming soon"
      >
        <path d={basePath} fill={BASE} opacity={0.85} />
        {soonWaves.map((d, i) => (
          <path
            key={`s${i}`}
            d={d}
            fill={SOON}
            style={{
              opacity: inView ? 0.7 : 0,
              transition: `opacity 420ms linear ${360 + i * 78}ms`,
            }}
          />
        ))}
        {liveWaves.map((d, i) => (
          <path
            key={`l${i}`}
            d={d}
            fill={ACTIVE}
            style={{
              opacity: inView ? 0.95 : 0,
              transition: `opacity 380ms linear ${i * 78}ms`,
            }}
          />
        ))}
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
                opacity: inView ? 1 : 0,
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
