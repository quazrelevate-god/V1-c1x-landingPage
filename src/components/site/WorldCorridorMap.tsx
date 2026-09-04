import { useEffect, useRef, useState } from "react";

import baseLayer from "@/assets/map/world-base.webp";
import liveLayer from "@/assets/map/world-live.webp";
import soonLayer from "@/assets/map/world-soon.webp";

/*
 * The dot field is three flat images, not 12,226 vectors.
 *
 * It used to be built at runtime: 12,226 points concatenated into 777 KB of SVG
 * path data across 33 <path> elements, 32 of which then animated their opacity
 * on a stagger. An SVG is one rendering context, so each of those fades forced
 * the browser to re-rasterise the entire thing — including the 565 KB static
 * landmass that never animated at all. No engine rasterises that much geometry
 * at 60fps, which is why a ~2 second reveal arrived as a handful of stills, and
 * why it looked identical on phone, tablet and desktop: it was CPU vector work,
 * not anything the GPU could absorb.
 *
 * Baked to WebP the same artwork is 31 KB, the 263 KB dot JSON stops shipping
 * altogether, and the reveal is a mask sweeping across a texture — which is the
 * kind of work a compositor does for free.
 */

/** Local reveal observer. Threshold 0.5 so the ripple starts once you can see it. */
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
          io.disconnect(); // one-shot: the ripple shouldn't replay on every pass
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, revealed]);

  return { ref, revealed };
}

type Region = { name: string; x: number; y: number; t: number };

/** Which way each label leans off its anchor, so neighbours don't collide. */
const LABEL_SIDE: Record<string, "left" | "right" | "above"> = {
  India: "right",
  "Middle East": "above",
  Africa: "left",
  Europe: "above",
  Australia: "right",
};

/* Five markers, inlined. They used to arrive with the dot data, which meant
   downloading 263 KB of coordinates to place five labels. */
const REGIONS: Region[] = [
  { name: "India", x: 175.46, y: 55.34, t: 1 },
  { name: "Middle East", x: 153.13, y: 51.75, t: 1 },
  { name: "Africa", x: 131.75, y: 67.32, t: 1 },
  { name: "Europe", x: 129.51, y: 25.06, t: 2 },
  { name: "Australia", x: 214.37, y: 91.34, t: 2 },
];

/** The baked artwork's own frame. Every layout number below is in these units. */
const MAP_WIDTH = 238;
const MAP_HEIGHT = 106;

const ACTIVE = "#9CAD1F";
const SOON = "#5E6B2A";

const FULL_VIEW = { vx: 0, vy: 0, vw: MAP_WIDTH, vh: MAP_HEIGHT };
/** Narrow screens crop to the corridors that matter, so shapes stay legible. */
const CORRIDOR_VIEW = { vx: 96, vy: 4, vw: 140, vh: 102 };

/*
 * Where the ripple starts: the Arabian Sea, between India and the Gulf — the
 * same origin the old wave ordering radiated from, so the reveal still reads as
 * the network spreading out of the corridor rather than arriving from a corner.
 */
const ORIGIN_X = 160;
const ORIGIN_Y = 62;

/** Long enough to read as a spreading wave, short enough not to hold the eye. */
const RIPPLE_MS = 1500;

export function WorldCorridorMap() {
  const { ref, revealed } = useRevealOnce<HTMLDivElement>(0.5);
  const [frame, setFrame] = useState(FULL_VIEW);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setFrame(mq.matches ? CORRIDOR_VIEW : FULL_VIEW);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /*
   * The crop, done in CSS rather than by an SVG viewBox.
   *
   * Each layer is the whole map, scaled so the visible frame fills the box and
   * offset so the frame's origin sits at the box's origin — arithmetically the
   * same thing a viewBox does, which is what keeps the marker maths below
   * unchanged.
   */
  const layer: React.CSSProperties = {
    position: "absolute",
    width: `${(MAP_WIDTH / frame.vw) * 100}%`,
    height: `${(MAP_HEIGHT / frame.vh) * 100}%`,
    left: `${(-frame.vx / frame.vw) * 100}%`,
    top: `${(-frame.vy / frame.vh) * 100}%`,
    maxWidth: "none",
  };

  /*
   * The droplet.
   *
   * A radial gradient mask whose radius is driven by one custom property, so the
   * whole reveal is a single interpolating value rather than 32 staggered
   * transitions. The soft band between the opaque core and the transparent edge
   * is what gives it a wavefront instead of a hard expanding disc.
   *
   * `--c1x-ripple` is registered in styles.css with @property; without that
   * registration a custom property is just a string and cannot interpolate, so
   * the mask would jump rather than sweep.
   */
  const ox = ((ORIGIN_X - frame.vx) / frame.vw) * 100;
  const oy = ((ORIGIN_Y - frame.vy) / frame.vh) * 100;
  const rippleMask: React.CSSProperties = {
    ...layer,
    ["--c1x-ripple" as string]: revealed ? "180%" : "0%",
    transition: `--c1x-ripple ${RIPPLE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
    WebkitMaskImage: `radial-gradient(circle at ${ox}% ${oy}%, #000 calc(var(--c1x-ripple) * 0.62), rgba(0,0,0,0.45) calc(var(--c1x-ripple) * 0.85), transparent var(--c1x-ripple))`,
    maskImage: `radial-gradient(circle at ${ox}% ${oy}%, #000 calc(var(--c1x-ripple) * 0.62), rgba(0,0,0,0.45) calc(var(--c1x-ripple) * 0.85), transparent var(--c1x-ripple))`,
  };

  return (
    <div ref={ref} className="relative w-full">
      {/* The box reserves its height from the frame's aspect, so nothing shifts
          when the images decode. */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: `${frame.vw} / ${frame.vh}` }}
        role="img"
        aria-label="World map highlighting active regions in India, the Middle East and Africa, with Europe and Australia coming soon"
      >
        <img src={baseLayer} alt="" aria-hidden decoding="async" style={{ ...layer, opacity: 0.85 }} />
        <img src={soonLayer} alt="" aria-hidden decoding="async" style={rippleMask} />
        <img src={liveLayer} alt="" aria-hidden decoding="async" style={rippleMask} />
      </div>

      {/*
        Region markers ride over the map as HTML rather than baked-in type, so
        the labels stay at a readable size whether the map is showing the whole
        world or the mobile corridor crop.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {REGIONS.map((r, i) => {
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
                // Each marker lands just after the wavefront has passed it.
                transitionDelay: `${400 + i * 140}ms`,
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
