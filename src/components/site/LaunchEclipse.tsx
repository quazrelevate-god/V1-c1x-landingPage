import { useEffect, useId, useRef } from "react";
import { MARK_RIBBONS, MARK_TO_UNIT } from "@/lib/mark-geometry";

/* ===========================================================================
 * ANIMATION TIMINGS — every duration in this component is listed here.
 *
 * ORB (Part 2) — 6 animated elements: 5 blobs + 1 container
 *   blob 1        17s  ease-in-out  scale .95→1.05   drift ±8px x  ±6px y   delay  -3s
 *   blob 2        23s  ease-in-out  scale .90→1.08   drift ±12px x ±10px y  delay  -8s  (x opposite blob 3)
 *   blob 3        19s  ease-in-out  scale .92→1.06   drift ±10px x ±14px y  delay -13s  (x opposite blob 2)
 *   blob 4        29s  ease-in-out  scale .95→1.10   drift ±14px x ±8px y   delay -19s
 *   blob 5        31s  ease-in-out  scale 1.00→1.06  drift ±6px x  ±6px y   delay -24s
 *   swell         11s  ease-in-out  container opacity 0.85 → 1.0 → 0.85
 *   rotation      90s  linear       container, clockwise
 *
 * PRESERVED (Part 3) — unchanged by this revision
 *   specular sweep  10s  cycle; band crosses in 22% = 2.2s
 *   halo pulse       9s  ease-in-out
 *   volumetric rays 12s  ease-in-out, opacity only
 *   haze drift      45s  ease-in-out, translate only
 *   dust particles  25–40s each, staggered, 10 of them
 *   floor reflection     now breathes on the 11s swell (was the old 7s pulse)
 *
 * STATIC — never animated (Part 1)
 *   smoked tint, film grain, asymmetric edge hint, internal ambient gradient
 *
 * REDUCED MOTION (Part 4)
 *   blobs frozen at start; swell kept at half intensity 0.92 → 1.0 → 0.92;
 *   rotation dropped; sweep, halo, rays, haze and particles frozen.
 * ===========================================================================
 *
 * The mark as a smoked-glass object standing in front of a green source.
 *
 * Geometry comes from `MARK_RIBBONS` — the same four path strings as
 * `public/brand/corridor-one-x-mark.svg`, verified byte-identical. They are
 * inlined rather than referenced with `<img>` or `<use>` because a path must be
 * in this document for `clipPath`, `mask` and `filter` to target it; an
 * external file cannot be clipped or lit. Nothing rewrites or transforms the
 * data — every layer clips to it or derives from its alpha.
 *
 * Only `transform` and `opacity` animate. The blurs and the turbulence are
 * declared once and never recomputed per frame.
 */

/** Dust: 10 particles, 25–40s traversals, staggered. */
const PARTICLES = [
  { left: "18%", size: 1.5, delay: -2, dur: 31, drift: 6, op: 0.3 },
  { left: "27%", size: 1, delay: -11, dur: 38, drift: -4, op: 0.22 },
  { left: "36%", size: 2, delay: -19, dur: 26, drift: 3, op: 0.34 },
  { left: "44%", size: 1, delay: -5, dur: 34, drift: -7, op: 0.18 },
  { left: "52%", size: 1.5, delay: -27, dur: 29, drift: 5, op: 0.4 },
  { left: "60%", size: 1, delay: -14, dur: 40, drift: -3, op: 0.16 },
  { left: "68%", size: 2, delay: -8, dur: 25, drift: 8, op: 0.28 },
  { left: "75%", size: 1, delay: -22, dur: 36, drift: -5, op: 0.2 },
  { left: "83%", size: 1.5, delay: -30, dur: 32, drift: 4, op: 0.25 },
  { left: "90%", size: 1, delay: -16, dur: 28, drift: -6, op: 0.15 },
];

/** Part 2 blob table. Sizes are % of the orb container. */
const BLOBS = [
  { n: 1, size: 55, color: "#a8ff2e", op: 0.55, blur: 30 },
  { n: 2, size: 45, color: "#7cb518", op: 0.45, blur: 40 },
  { n: 3, size: 50, color: "#5a8a12", op: 0.4, blur: 45 },
  { n: 4, size: 70, color: "#4a5d1a", op: 0.3, blur: 60 },
  { n: 5, size: 90, color: "#2f3d10", op: 0.25, blur: 80 },
];

/**
 * A blob's radial falloff.
 *
 * `radial-gradient(closest-side circle, COLOR, transparent)` ramps alpha in a
 * straight line from centre to edge, and a linear ramp is exactly what the eye
 * picks out as a boundary — five overlapping discs each with a readable rim,
 * rather than one soft field. These stops approximate a gaussian instead, so
 * the alpha leaves the centre slowly, falls fastest through the middle and
 * arrives at zero flat. There is no edge to find, and where two blobs overlap
 * the screen blend produces a gradient rather than a lens shape.
 *
 * Colour, size, blur and element opacity are untouched — this changes only the
 * shape of the curve between the centre and transparent.
 */
const FALLOFF = [
  [0, 1],
  [0.22, 0.82],
  [0.42, 0.52],
  [0.62, 0.26],
  [0.8, 0.09],
  [1, 0],
] as const;

/** #rrggbb -> rgba(r, g, b, a) */
function tint(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const blobBackground = (color: string) =>
  `radial-gradient(closest-side circle, ${FALLOFF.map(
    ([stop, a]) => `${tint(color, a)} ${(stop * 100).toFixed(0)}%`,
  ).join(", ")})`;

/**
 * Thickness.
 *
 * The mark is a flat path, so the only way to give it a body is to build one:
 * the shape is stamped repeatedly, each copy nudged a little further down and
 * right and painted darker than the last, and the real face is drawn on top of
 * the stack. What you see between the face and the deepest copy is a side wall.
 *
 * Twelve steps rather than three or four. A shallow stack leaves visible
 * banding down the wall — each stamp reads as its own contour line — and the
 * count has to be high enough that the steps are closer together than the
 * shape's own edge softness before it reads as a continuous surface.
 *
 * The wall darkens toward the bottom because it is turning away from a source
 * that is above and behind the object; the top face is the only part angled
 * back toward it, which is what the green surface gradient then sits on.
 */
const EXTRUDE_STEPS = 12;
/** Per-step offset in viewBox units. 12 × 0.04 ≈ 0.48 of an 18-unit box. */
const EXTRUDE_STEP_Y = 0.04;
const EXTRUDE_STEP_X = 0.012;

/** Side-wall shade at depth `t` (0 = just under the face, 1 = deepest). */
function wallShade(t: number) {
  const near = [13, 18, 10]; // #0d120a
  const far = [3, 5, 3]; // #030503
  const c = near.map((n, i) => Math.round(n + (far[i]! - n) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/**
 * How much of the source the logo lets through.
 *
 * 1 = fully solid: the mark blocks the light completely and reads as a
 * silhouette, with the glow escaping only around it and through the hollow
 * centre. Lower values let the body itself light up — 0.75 was tried and went
 * too far, putting green on the arms instead of behind them.
 *
 * Applied as one group opacity rather than by thinning each layer's fill: the
 * face is a stack of six passes (wall, base, radial, top surface, grain, rim),
 * and thinning them individually compounds — six layers at 0.75 each is nowhere
 * near 0.75 overall, and the ones underneath wash out first.
 */
const LOGO_OPACITY = 1;

/**
 * The eclipse crescent.
 *
 * An even glow all round the mark reads as a lamp behind a coin. Light breaking
 * over one limb and dying below it reads as a body with something bright behind
 * it — which is the whole difference between "logo on a glow" and an eclipse.
 * This fades the source out below the mark's waist.
 *
 * `maskSize` and `maskRepeat` are set explicitly and are not optional: a CSS
 * mask tiles by default, so past the element box the same gradient repeats and
 * puts visible bands across the composition. Learned the hard way on the rays
 * layer, which did exactly that.
 */
const TOP_FADE =
  "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.95) 26%, rgba(0,0,0,0.55) 48%," +
  "rgba(0,0,0,0.18) 66%, rgba(0,0,0,0.04) 80%, transparent 92%)";

const crescent = {
  maskImage: TOP_FADE,
  WebkitMaskImage: TOP_FADE,
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
} as const;

export function LaunchEclipse({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const id = (n: string) => `lg-${n}-${uid}`;
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /*
     * Pause rather than unmount. `animation-play-state` freezes every keyframe
     * mid-phase for one style recalc; tearing the layers down would restart all
     * ten particles and all five blobs from their origin, which reads as a jolt
     * when the visitor returns to the tab.
     */
    const sync = () => {
      stage.current?.setAttribute("data-paused", document.hidden ? "true" : "false");
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return (
    <div ref={stage} className={`lg-stage ${className}`} data-paused="false" aria-hidden>
      <style>{`
        .lg-stage { position: relative; isolation: isolate; }
        .lg-stage > * { position: absolute; inset: 0; }

        /* One rule pauses the entire stage on visibilitychange. */
        .lg-stage[data-paused="true"] * { animation-play-state: paused !important; }

        /* ================= PART 2 — the orb ================= */

        /*
         * Container: 120% of the logo, anchored ABOVE its centre.
         *
         * top:50% put the source directly behind the middle of the mark, which
         * lights all four arms about equally and reads as an evenly backlit
         * cutout. Sitting it at 34% makes the light break over the top arms and
         * fall away down the frame, so the lower half stays in shadow — an
         * object standing in front of a floodlight that is above and behind it,
         * rather than one pasted on a symmetrical glow.
         *
         * This is the only value that moved: every blob keeps its own colour,
         * size, blur, opacity, duration, delay and drift, and the 90s rotation
         * is untouched. will-change still lives here and nowhere else.
         */
        .lg-orb {
          position: absolute;
          left: 50%; top: 34%;
          width: 120%; height: 120%;
          transform: translate(-50%, -50%);
          will-change: transform;
        }
        /* Rotation on an inner wrapper so the centring translate on .lg-orb is
           not competing with the spin on the same transform property. */
        .lg-orb-spin { position: absolute; inset: 0; animation: lg-spin 90s linear infinite; }
        .lg-orb-swell { position: absolute; inset: 0; animation: lg-swell 11s ease-in-out infinite; }

        @keyframes lg-spin { to { transform: rotate(360deg); } }
        @keyframes lg-swell { 0%, 100% { opacity: .85; } 50% { opacity: 1; } }

        .lg-blob {
          position: absolute;
          left: 50%; top: 50%;
          border-radius: 50%;
          mix-blend-mode: screen;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        /* Each blob's own loop. The -50% centring is composed into every
           keyframe, so the translate values below are the drift itself. */
        @keyframes lg-b1 {
          0%, 100% { transform: translate(-50%, -50%) translate(-8px, 6px) scale(.95); }
          50%      { transform: translate(-50%, -50%) translate(8px, -6px) scale(1.05); }
        }
        @keyframes lg-b2 {
          0%, 100% { transform: translate(-50%, -50%) translate(12px, -10px) scale(.90); }
          50%      { transform: translate(-50%, -50%) translate(-12px, 10px) scale(1.08); }
        }
        @keyframes lg-b3 {
          0%, 100% { transform: translate(-50%, -50%) translate(-10px, 14px) scale(.92); }
          50%      { transform: translate(-50%, -50%) translate(10px, -14px) scale(1.06); }
        }
        @keyframes lg-b4 {
          0%, 100% { transform: translate(-50%, -50%) translate(14px, 8px) scale(.95); }
          50%      { transform: translate(-50%, -50%) translate(-14px, -8px) scale(1.10); }
        }
        @keyframes lg-b5 {
          0%, 100% { transform: translate(-50%, -50%) translate(-6px, -6px) scale(1.00); }
          50%      { transform: translate(-50%, -50%) translate(6px, 6px) scale(1.06); }
        }
        .lg-b1 { animation-name: lg-b1; animation-duration: 17s; animation-delay: -3s; }
        .lg-b2 { animation-name: lg-b2; animation-duration: 23s; animation-delay: -8s; }
        .lg-b3 { animation-name: lg-b3; animation-duration: 19s; animation-delay: -13s; }
        .lg-b4 { animation-name: lg-b4; animation-duration: 29s; animation-delay: -19s; }
        .lg-b5 { animation-name: lg-b5; animation-duration: 31s; animation-delay: -24s; }

        /* ================= PART 3 — preserved ================= */

        /* floor now breathes on the 11s swell, not the old 7s pulse */
        @keyframes lg-swell-floor { 0%, 100% { opacity: .85; } 50% { opacity: 1; } }
        .lg-floor { animation: lg-swell-floor 11s ease-in-out infinite; }

        /* rim light breathes with the 11s global swell, so the mark brightens
           in step with the source lighting it. Group opacity only — never the
           individual stops. */
        @keyframes lg-rim { 0%, 100% { opacity: .85; } 50% { opacity: 1; } }
        .lg-rim { animation: lg-rim 11s ease-in-out infinite; }

        @keyframes lg-halo { 0%, 100% { opacity: .68; } 50% { opacity: 1; } }
        .lg-halo { animation: lg-halo 9s ease-in-out infinite; }

        @keyframes lg-rays { 0%, 100% { opacity: .16; } 50% { opacity: .30; } }
        .lg-rays { animation: lg-rays 12s ease-in-out infinite; }

        @keyframes lg-haze {
          0%   { transform: translate3d(-3%, 2%, 0); }
          50%  { transform: translate3d(3%, -2%, 0); }
          100% { transform: translate3d(-3%, 2%, 0); }
        }
        .lg-haze { animation: lg-haze 45s ease-in-out infinite; will-change: transform; }

        @keyframes lg-sweep {
          0%   { transform: translate3d(-160%, 0, 0); opacity: 0;
                 animation-timing-function: cubic-bezier(.4, 0, .2, 1); }
          1%   { opacity: .85; }
          20%  { opacity: .85; }
          22%  { transform: translate3d(160%, 0, 0); opacity: 0; }
          100% { transform: translate3d(160%, 0, 0); opacity: 0; }
        }
        .lg-sweep-band {
          position: absolute; inset: -25% -60%;
          background: linear-gradient(105deg,
            transparent 42%,
            rgba(124,181,24,.05) 47%,
            rgba(168,255,46,.13) 50%,
            rgba(124,181,24,.05) 53%,
            transparent 58%);
          animation: lg-sweep 10s linear infinite;
          will-change: transform, opacity;
        }

        @keyframes lg-drift {
          0%   { transform: translate3d(0, 12%, 0); opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translate3d(var(--dx), -108%, 0); opacity: 0; }
        }
        .lg-dot {
          position: absolute; bottom: -4px; border-radius: 9999px;
          background: #a8ff2e;
          animation: lg-drift linear infinite;
          will-change: transform, opacity;
        }

        /* ================= PART 4 — reduced motion =================
           Blobs freeze at their start. The swell survives at half intensity.
           Rotation is dropped. Sweep, halo, rays, haze and particles freeze —
           frozen, not removed, so the scene stays visually rich. */
        @keyframes lg-swell-rm { 0%, 100% { opacity: .92; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .lg-stage, .lg-stage * { animation: none !important; }
          .lg-orb-swell { animation: lg-swell-rm 11s ease-in-out infinite !important; }
          .lg-rim   { opacity: .92; }
          .lg-halo  { opacity: .8; }
          .lg-rays  { opacity: .24; }
          .lg-floor { opacity: .95; }
        }
      `}</style>

      {/* ---------- environment, behind everything ---------- */}

      <div
        className="lg-rays"
        style={{
          inset: "-40%",
          /* A conic-gradient covers its whole element box at full strength and
             stops dead at the edge, which put a visible rectangle across the
             composition. Feathered here. no-repeat is explicit: a CSS mask
             tiles by default, and that repeat turns one soft gradient into
             visible bands. */
          maskImage: "radial-gradient(closest-side, #000 22%, transparent 76%)",
          WebkitMaskImage: "radial-gradient(closest-side, #000 22%, transparent 76%)",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "conic-gradient(from 200deg at 50% 46%," +
              "transparent 0deg, rgba(124,181,24,.16) 18deg, transparent 40deg," +
              "transparent 120deg, rgba(124,181,24,.12) 143deg, transparent 166deg," +
              "transparent 250deg, rgba(74,93,26,.16) 274deg, transparent 300deg)",
          }}
        />
      </div>

      <div className="lg-haze" style={{ inset: "-30%" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 45% at 38% 40%, rgba(74,93,26,.20), transparent 70%)," +
              "radial-gradient(50% 40% at 66% 58%, rgba(124,181,24,.13), transparent 72%)",
          }}
        />
      </div>

      {/* ---------- PART 2: the living orb, behind the logo ---------- */}
      <div className="lg-orb" style={crescent}>
        <div className="lg-orb-swell">
          <div className="lg-orb-spin">
            {BLOBS.map((b) => (
              <div
                key={b.n}
                className={`lg-blob lg-b${b.n}`}
                style={{
                  width: `${b.size}%`,
                  height: `${b.size}%`,
                  opacity: b.op,
                  filter: `blur(${b.blur}px)`,
                  background: blobBackground(b.color),
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Outer halo hugging the silhouette. Pre-baked filter; only opacity moves. */}
      <svg viewBox="0 0 18 18" className="lg-halo" style={{ overflow: "visible", ...crescent }}>
        <defs>
          <filter id={id("halo")} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="b" />
            <feFlood floodColor="#7cb518" floodOpacity="0.72" result="f" />
            <feComposite in="f" in2="b" operator="in" result="wide" />
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.11" result="b2" />
            <feFlood floodColor="#d4ff6b" floodOpacity="0.92" result="f2" />
            <feComposite in="f2" in2="b2" operator="in" result="tight" />
            <feMerge>
              <feMergeNode in="wide" />
              <feMergeNode in="tight" />
            </feMerge>
          </filter>
        </defs>
        <g filter={`url(#${id("halo")})`}>
          {MARK_RIBBONS.map((d, i) => (
            <path key={i} d={d} fill="#000" />
          ))}
        </g>
      </svg>

      {/* Clip source for the HTML sweep layer, in objectBoundingBox units. */}
      <svg width="0" height="0" style={{ position: "absolute" }} focusable="false">
        <defs>
          <clipPath id={id("clip")} clipPathUnits="objectBoundingBox">
            {MARK_RIBBONS.map((d, i) => (
              <path key={i} d={d} transform={`scale(${MARK_TO_UNIT})`} />
            ))}
          </clipPath>
        </defs>
      </svg>

      {/* ---------- PART 1: the logo, four static texture layers ---------- */}
      <svg viewBox="0 0 18 18" style={{ overflow: "visible", opacity: LOGO_OPACITY }}>
        <defs>
          {/* Clip in user-space units, for the layers drawn inside this SVG. */}
          <clipPath id={id("mark")} clipPathUnits="userSpaceOnUse">
            {MARK_RIBBONS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </clipPath>

          {/* L1 — internal depth: centre lighter than the arm tips, as if the
                 source behind is faintly transmitting through the glass. */}
          <radialGradient id={id("l1")} cx="9" cy="9" r="9" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#151a10" stopOpacity="0.35" />
            <stop offset="1" stopColor="#050705" stopOpacity="0.35" />
          </radialGradient>

          {/* L2 — film grain. Static: animating turbulence flickers. */}
          <filter id={id("l2")} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
          </filter>

          {/* L3 — radial rim light on the stroke.

                 userSpaceOnUse, not the spec's percentages: gradientUnits
                 defaults to objectBoundingBox, and the stroke is applied to the
                 four ribbons individually — so percentages would centre a
                 separate gradient on each ribbon's own box rather than one
                 gradient on the logo. cx/cy/r of 9 in the 18-unit viewBox is
                 exactly the 50%/50%/50% that was asked for, measured against
                 the mark instead of against each arm.

                 Edges nearest the core read brightest and the outer tips fall
                 to almost nothing, so the mark is lit *by* the source behind it
                 rather than outlined independently of it. */}
          <radialGradient id={id("rim")} cx="9" cy="9" r="9" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a8ff2e" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#7cb518" stopOpacity="0.70" />
            <stop offset="55%" stopColor="#4a5d1a" stopOpacity="0.45" />
            <stop offset="85%" stopColor="#2a3818" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#0a0f08" stopOpacity="0.05" />
          </radialGradient>

          {/* Top surface — the face angled back toward the source. Green,
                 falling to nothing by the middle of the mark, so only the upper
                 faces catch it and the lower ones stay in shadow. */}
          <linearGradient
            id={id("top")}
            x1="0"
            y1="0"
            x2="0"
            y2="18"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#7cb518" stopOpacity="0.22" />
            <stop offset="0.28" stopColor="#4a5d1a" stopOpacity="0.10" />
            <stop offset="0.55" stopColor="#4a5d1a" stopOpacity="0" />
            <stop offset="1" stopColor="#4a5d1a" stopOpacity="0" />
          </linearGradient>

          {/* L4 — internal diagonal ambient bounce. */}
          <linearGradient
            id={id("l4")}
            x1="0"
            y1="0"
            x2="18"
            y2="18"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#1a2010" stopOpacity="0.15" />
            <stop offset="1" stopColor="#1a2010" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Side wall — deepest stamp first, so shallower copies paint over it. */}
        <g>
          {Array.from({ length: EXTRUDE_STEPS }, (_, k) => {
            const depth = EXTRUDE_STEPS - k; // 12 (deepest) down to 1
            const t = depth / EXTRUDE_STEPS;
            return (
              <g
                key={`ex${k}`}
                transform={`translate(${(EXTRUDE_STEP_X * depth).toFixed(3)} ${(
                  EXTRUDE_STEP_Y * depth
                ).toFixed(3)})`}
                fill={wallShade(t)}
              >
                {MARK_RIBBONS.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
            );
          })}
        </g>

        {/* L1 — smoked glass tint: flat base, then internal radial depth. */}
        {MARK_RIBBONS.map((d, i) => (
          <path key={`l1a${i}`} d={d} fill="#0a0f08" />
        ))}
        {MARK_RIBBONS.map((d, i) => (
          <path key={`l1b${i}`} d={d} fill={`url(#${id("l1")})`} />
        ))}

        {/* Top surface — sits on the face, under the grain and the rim. */}
        {MARK_RIBBONS.map((d, i) => (
          <path key={`top${i}`} d={d} fill={`url(#${id("top")})`} />
        ))}

        {/* L2 — grain, clipped to the mark. Static, overlay, 0.08. */}
        <g clipPath={`url(#${id("mark")})`} style={{ mixBlendMode: "overlay", opacity: 0.2 }}>
          <rect x="0" y="0" width="18" height="18" filter={`url(#${id("l2")})`} />
        </g>

        {/* L3 — 1px inner stroke, top-left facing edges only.
               Stroked at 2px and clipped to the path: a stroke straddles the
               outline, so clipping keeps only its inner half — which is what
               makes this read as an inner stroke of exactly 1px. */}
        <g className="lg-rim" clipPath={`url(#${id("mark")})`}>
          {MARK_RIBBONS.map((d, i) => (
            <path
              key={`l3${i}`}
              d={d}
              fill="none"
              stroke={`url(#${id("rim")})`}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* L4 — internal diagonal ambient gradient. */}
        {MARK_RIBBONS.map((d, i) => (
          <path key={`l4${i}`} d={d} fill={`url(#${id("l4")})`} />
        ))}
      </svg>

      {/* PART 3 — specular sweep, clipped to the mark */}
      <div className="lg-sweep" style={{ clipPath: `url(#${id("clip")})`, overflow: "hidden" }}>
        <div className="lg-sweep-band" />
      </div>

      {/* PART 3 — floor reflection, now on the 11s swell */}
      <div
        className="lg-floor"
        style={{
          inset: "auto -14% -16% -14%",
          height: "34%",
          background:
            "radial-gradient(closest-side ellipse at 50% 0%," +
            "rgba(124,181,24,.364), rgba(74,93,26,.14) 55%, transparent 80%)",
        }}
      />

      {/* PART 3 — dust */}
      <div style={{ inset: "-10%", overflow: "hidden" }}>
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="lg-dot"
            style={
              {
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.op,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
                "--dx": `${p.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
