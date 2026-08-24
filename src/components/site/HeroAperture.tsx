import { useEffect, useId, useRef, useState } from "react";

/**
 * The opening reveal: the brand mark as a window onto the hero.
 *
 * A cover in the page's own background sits over the footage with the mark's
 * inner region punched out of it, so the video shows through the middle. The
 * opening grows from the centre of the pane at a constant rate until it has
 * cleared the screen, then the cover unmounts.
 *
 * This replaces the fly-through baked into the front of the clip, which was
 * unusable for two reasons: it is only ~15 frames, so scrubbing it stretched
 * looked stepped, and it is footage of a logo — at the size it reaches on the
 * way past, the gradient banded and the edges went soft. Drawn as vectors it
 * re-rasterises at whatever size it is on screen and stays clean at 3000px+,
 * and having no frames to run out of, it can be given as much scroll as the
 * pacing wants.
 */

const BOX = 18; // the mark's own viewBox edge

/**
 * The narrowest span across the aperture, in mark units.
 *
 * Measured, not eyeballed. It is tempting to take the inner edges' endpoints
 * (x = 4.88698 and 13.0926, giving 8.20562), but those edges are cubics whose
 * control points pull them further inwards: the true pinch sits at the middle
 * of each side, where the curve reaches x ≈ 5.381 / 12.598. Rasterising the
 * path at 100px per unit and walking out from the centre gives a minimum radius
 * of 3.60, so the real waist is 7.20.
 *
 * Using the endpoint figure makes `clearAt` ~14% too small, which leaves slivers
 * of cover down the edges of the screen at the moment the reveal is supposed to
 * be finished.
 */
const WAIST = 7.1966;

/**
 * The window: the concave region enclosed by the four ribbons' inner edges.
 *
 * Traced from the ribbons themselves — top inner edge right-to-left, then left
 * top-to-bottom, bottom left-to-right, right bottom-to-top. The four short
 * segments between them bridge the ~0.7-unit gaps where adjacent ribbon tips
 * meet at the corners; the ribbons overlap there, so the joins are covered.
 */
const APERTURE =
  "M16.1341 1.35123L10.6643 4.88673C9.6445 5.54589 8.33295 5.5459 7.31314 4.88673L1.84338 1.35123" +
  "L1.35148 1.84615L4.88698 7.31591C5.54614 8.33572 5.54614 9.64727 4.88698 10.6671L1.35148 16.1368" +
  "L1.84358 16.6302L7.31334 13.0947C8.33316 12.4356 9.64471 12.4355 10.6645 13.0947L16.1343 16.6302" +
  "L16.6281 16.1351L13.0926 10.6653C12.4335 9.64548 12.4335 8.33393 13.0926 7.31412L16.6281 1.84436Z";

/**
 * The four ribbons, each with the axis its bevel runs along: from the outer
 * edge inwards, so the rim highlight always faces the centre of the mark.
 */
const RIBBONS = [
  {
    key: "top",
    d: "M16.1341 1.35123L10.6643 4.88673C9.6445 5.54589 8.33295 5.5459 7.31314 4.88673L1.84338 1.35123L2.71685 0L8.18656 3.53545C8.67479 3.85102 9.30267 3.85101 9.7909 3.53545L15.2607 0L16.1341 1.35123Z",
    grad: { x1: 9, y1: 3.4, x2: 9, y2: 5.6 },
  },
  {
    key: "bottom",
    d: "M1.84358 16.6302L7.31334 13.0947C8.33316 12.4356 9.64471 12.4355 10.6645 13.0947L16.1343 16.6302L15.2608 17.9814L9.7911 14.446C9.30288 14.1304 8.67499 14.1304 8.18676 14.446L2.717 17.9814L1.84358 16.6302Z",
    grad: { x1: 9, y1: 14.6, x2: 9, y2: 12.4 },
  },
  {
    key: "right",
    d: "M16.6281 16.1351L13.0926 10.6653C12.4335 9.64548 12.4335 8.33393 13.0926 7.31412L16.6281 1.84436L17.9794 2.71783L14.4439 8.18754C14.1284 8.67576 14.1284 9.30365 14.4439 9.79188L17.9794 15.2616L16.6281 16.1351Z",
    grad: { x1: 14.6, y1: 9, x2: 12.4, y2: 9 },
  },
  {
    key: "left",
    d: "M1.35148 1.84615L4.88698 7.31591C5.54614 8.33572 5.54614 9.64727 4.88698 10.6671L1.35148 16.1368L0.000244179 15.2634L3.53569 9.79367C3.85126 9.30544 3.85126 8.67755 3.53569 8.18932L0.000244727 2.71957L1.35148 1.84615Z",
    grad: { x1: 3.4, y1: 9, x2: 5.6, y2: 9 },
  },
] as const;

type Props = {
  /** 0 = closed on the mark, 1 = cleared the pane. Above 1 the cover unmounts. */
  progress: number;
  /** Fraction of the pane's height the mark spans at progress 0. */
  startFraction?: number;
};

export function HeroAperture({ progress, startFraction = 0.31 }: Props) {
  const uid = useId().replace(/:/g, "");
  const hostRef = useRef<HTMLDivElement>(null);
  /*
   * Measured off its own container rather than the window.
   *
   * The mark is a window onto the footage, so it has to be centred on the
   * footage — and on a phone that is a band across the top of the pane, not the
   * pane itself. Centring on the viewport put the opening below the video
   * entirely and it revealed page background. Measuring the host also means an
   * orientation change or a browser-chrome resize re-derives clearAt for free,
   * which a one-off window read would not.
   */
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const sync = () => {
      const r = el.getBoundingClientRect();
      setBox((prev) =>
        prev && Math.abs(prev.w - r.width) < 0.5 && Math.abs(prev.h - r.height) < 0.5
          ? prev
          : { w: r.width, h: r.height },
      );
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const t = Math.min(Math.max(progress, 0), 1);
  // The host has to stay mounted for the observer to have something to measure,
  // so only the drawn cover goes away once the opening has cleared.
  const done = t >= 1;

  if (!box || done) {
    return <div ref={hostRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10" />;
  }

  const { w, h } = box;
  // Edge length at which the aperture's pinch has passed the furthest corner.
  const clearAt = (Math.hypot(w, h) * BOX) / WAIST;
  const startSize = startFraction * h;
  // Linear: equal scroll buys equal growth, no easing.
  const size = startSize + t * (clearAt * 1.02 - startSize);
  const place = `translate(${w / 2} ${h / 2}) scale(${size / BOX}) translate(-9 -9)`;

  const holeId = `c1x-hole-${uid}`;
  const bloomId = `c1x-bloom-${uid}`;

  /*
   * The bloom is the one genuinely expensive thing here, and its cost grows with
   * the mark: a blur authored in mark units keeps a constant *proportion*, so by
   * the time the mark is 1600px the filter is blurring a 25px radius over a
   * region of that size, every frame, on a phone — which would cost more than
   * the stutter this reveal exists to remove.
   *
   * So the radius is pinned in pixels instead (divide by the current scale), and
   * dropped once the mark is large enough that a 7px glow on it is invisible
   * anyway. The cutoff can't pop for the same reason it's safe to make.
   */
  const scale = size / BOX;
  const GLOW_PX = 7;
  const bloom = size < startSize * 3;
  const stdDeviation = GLOW_PX / scale;

  return (
    <div ref={hostRef} aria-hidden className="pointer-events-none absolute inset-0 z-30">
      <svg
        // Sized in real pixels every frame rather than scaled with a CSS
        // transform: a transform rasterises once and stretches, so the mark goes
        // soft exactly when it is largest. Re-sizing makes the browser
        // re-rasterise at the size actually on screen.
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="absolute inset-0"
      >
        <defs>
          {/*
          A mask, not fill-rule="evenodd" on the cover rect: the aperture is
          authored in mark units and needs its own placing transform, which a
          subpath merged into the cover's own path data cannot carry.
        */}
          <mask id={holeId} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
            <rect x="0" y="0" width={w} height={h} fill="white" />
            <path d={APERTURE} transform={place} fill="black" />
          </mask>

          {bloom ? (
            <filter id={bloomId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={stdDeviation} result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ) : null}

          {/*
          userSpaceOnUse with no gradientTransform. The ribbons live inside the
          group that carries `place`, so this resolves in mark units already —
          adding the transform here would apply it twice and skew every bevel
          into one diagonal ramp across the whole mark.
        */}
          {RIBBONS.map((r) => (
            <linearGradient
              key={r.key}
              id={`c1x-${r.key}-${uid}`}
              gradientUnits="userSpaceOnUse"
              x1={r.grad.x1}
              y1={r.grad.y1}
              x2={r.grad.x2}
              y2={r.grad.y2}
            >
              <stop offset="0" stopColor="#A9BB20" />
              <stop offset="0.55" stopColor="#D3E52E" />
              <stop offset="1" stopColor="#F0FF5C" />
            </linearGradient>
          ))}
        </defs>

        <path d={`M0 0H${w}V${h}H0Z`} fill="#0A0A0A" mask={`url(#${holeId})`} />

        {/* The bloom sits on the inner group so its radius is expressed in mark
            units, which is what lets it be pinned to a fixed pixel size above. */}
        <g transform={place}>
          <g {...(bloom ? { filter: `url(#${bloomId})` } : {})}>
            {RIBBONS.map((r) => (
              <path key={r.key} d={r.d} fill={`url(#c1x-${r.key}-${uid})`} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
