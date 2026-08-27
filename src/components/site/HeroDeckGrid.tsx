/**
 * The container wireframe, drawn rather than filmed.
 *
 * This used to be footage: a 1.4 MB clip scrubbed by scroll. Phones had to pull
 * the whole file down before a single seek would land, because the origin
 * answers a Range request with the entire file and a 200 — so the first visit
 * sat on one frame for as long as the download took, and only a second visit,
 * served from cache, scrubbed at all. Clients were reporting twenty to forty
 * seconds and two attempts.
 *
 * A still plus this is about 128 KB and cannot fail to seek, because there is
 * nothing to seek. It also scales: the linework is vector, so it stays crisp at
 * any density instead of being a 720px-wide video upscaled onto a 3x screen.
 *
 * Geometry is measured, not eyeballed. Sampling the lime pixels of the final
 * video frame and fitting a line to each edge of the stack gives two straight
 * edges — the deck is a plain quadrilateral in this projection:
 *
 *     left  x% = 1.063 * y% + 8.22
 *     right x% = 0.976 * y% + 29.90
 *
 * over y 12.4% -> 56.5% of the frame. Every box below is generated from those.
 *
 * The first fit came out ~15% oversized because it was taken from the drawn
 * wireframe's 2D silhouette, which is not the deck: those boxes have height, so
 * a scanline through them catches the top face of one and the base of the next.
 * These numbers come from matching the generated grid's bounding box back to the
 * reference frame's, checked by overlaying one on the other.
 */

/** Fitted edges of the container stack, in percent of the frame. */
const LEFT_M = 1.063;
const LEFT_B = 8.22;
const RIGHT_M = 0.976;
const RIGHT_B = 29.9;

/** Where the stack begins (bow) and ends (stern), in percent of frame height. */
const Y_START = 12.4;
const Y_END = 56.5;

/** Screen-space extrusion that gives each box its height. */
const RISE_X = 1.0;
const RISE_Y = 3.5;

/** Boxes along the deck, matching the rhythm of the original render. */
const BLOCKS = 9;
/** Divisions across the top of each box. */
const COLUMNS = 3;

const leftAt = (y: number) => LEFT_M * y + LEFT_B;
const rightAt = (y: number) => RIGHT_M * y + RIGHT_B;
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

type P = readonly [number, number];
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const rise = (p: P): P => [p[0] - RISE_X, p[1] - RISE_Y];
const d = (pts: P[], close = true) =>
  `M${pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join("L")}${close ? "Z" : ""}`;

function Box({ index, reveal }: { index: number; reveal: number }) {
  const y0 = Y_START + ((Y_END - Y_START) * index) / BLOCKS;
  const y1 = Y_START + ((Y_END - Y_START) * (index + 1)) / BLOCKS;

  // Footprint on the deck, bow edge first.
  const bl: P = [leftAt(y0), y0];
  const br: P = [rightAt(y0), y0];
  const fr: P = [rightAt(y1), y1];
  const fl: P = [leftAt(y1), y1];
  const [tl, tr, tfr, tfl] = [bl, br, fr, fl].map(rise) as [P, P, P, P];

  // Drawn in, not faded in: the stroke runs on from the bow end of each box, so
  // the stack reads as being built rather than switched on.
  const draw = clamp01(reveal);
  const strokeStyle = {
    strokeDasharray: 1,
    strokeDashoffset: 1 - draw,
    // pathLength normalises every path to 1 so one offset drives them all,
    // regardless of how long each individual edge happens to be.
    pathLength: 1,
  } as const;

  const columns = Array.from({ length: COLUMNS - 1 }, (_, i) => {
    const t = (i + 1) / COLUMNS;
    return [lerp(tl, tr, t), lerp(tfl, tfr, t)] as const;
  });

  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.15}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      style={{ opacity: draw > 0 ? 1 : 0 }}
    >
      {/* top face */}
      <path d={d([tl, tr, tfr, tfl])} {...strokeStyle} />
      {/* the two side faces that face the camera */}
      <path d={d([fl, fr, tfr, tfl])} {...strokeStyle} />
      <path d={d([bl, fl, tfl, tl])} {...strokeStyle} />
      {/* divisions across the top, so it reads as containers not a crate */}
      {columns.map(([a, b], i) => (
        <path key={i} d={d([a, b], false)} {...strokeStyle} strokeWidth={0.7} opacity={0.75} />
      ))}
    </g>
  );
}

/**
 * @param progress 0 -> 1 across the whole stack, bow to stern.
 */
export function HeroDeckGrid({ progress }: { progress: number }) {
  const p = clamp01(progress);

  return (
    <svg
      aria-hidden
      /*
       * 80x100 is the still's own 4:5 frame, and "slice" crops it exactly as
       * object-fit: cover crops the image beneath — anchored to the top, which
       * is what the image is set to as well.
       *
       * This has to match or the two drift apart: on a short viewport the band's
       * height ceiling makes it shallower than 4:5, the image loses some of its
       * bottom, and a grid drawn in plain 0-100 percentages would stay put while
       * the ship it is meant to sit on moved under it.
       */
      viewBox="0 0 80 100"
      preserveAspectRatio="xMidYMin slice"
      className="pointer-events-none absolute inset-0 h-full w-full text-accent"
    >
      {/* geometry is authored in percent of frame width; 0.8 maps it into the
          4:5 viewBox above without touching the measured numbers */}
      <g transform="scale(0.8 1)">
        {Array.from({ length: BLOCKS }, (_, i) => {
          // Each box owns a slice of the run and overlaps its neighbour slightly,
          // so the build reads as continuous rather than as nine separate events.
          const start = (i / BLOCKS) * 0.82;
          const span = 0.82 / BLOCKS;
          return <Box key={i} index={i} reveal={(p - start) / (span * 1.9)} />;
        })}
      </g>
    </svg>
  );
}
