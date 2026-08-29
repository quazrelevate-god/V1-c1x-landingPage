/**
 * The Corridor One X mark as raw path data.
 *
 * XMark renders the mark as a finished, single-colour glyph, which is the right
 * shape for the shipped pages and useless for anything that needs the geometry
 * itself. Material work wants the same four ribbons in several roles at once —
 * as an SVG `clipPath` driving a CSS `backdrop-filter`, as fill for lighting
 * passes, as stroke for edges, as the source a glow is derived from — and none
 * of those can be had from a component that only paints.
 *
 * So the coordinates live here and XMark is left alone. Every shipped page
 * renders XMark; changing its shape to serve pages that are not deployed would
 * be the wrong trade.
 */

/** The mark is authored in an 18-unit square. */
export const MARK_BOX = 18;

/**
 * Normalises the 18-unit paths into the 0..1 space a `clipPath` needs when it
 * is declared with `clipPathUnits="objectBoundingBox"` — which is what lets one
 * clip serve an element at any size the layout gives it.
 */
export const MARK_TO_UNIT = 1 / MARK_BOX;

/** Top, bottom, right, left — each ribbon of the mark, in order. */
export const MARK_RIBBONS = [
  "M16.1341 1.35123L10.6643 4.88673C9.6445 5.54589 8.33295 5.5459 7.31314 4.88673L1.84338 1.35123L2.71685 0L8.18656 3.53545C8.67479 3.85102 9.30267 3.85101 9.7909 3.53545L15.2607 0L16.1341 1.35123Z",
  "M1.84358 16.6302L7.31334 13.0947C8.33316 12.4356 9.64471 12.4355 10.6645 13.0947L16.1343 16.6302L15.2608 17.9814L9.7911 14.446C9.30288 14.1304 8.67499 14.1304 8.18676 14.446L2.717 17.9814L1.84358 16.6302Z",
  "M16.6281 16.1351L13.0926 10.6653C12.4335 9.64548 12.4335 8.33393 13.0926 7.31412L16.6281 1.84436L17.9794 2.71783L14.4439 8.18754C14.1284 8.67576 14.1284 9.30365 14.4439 9.79188L17.9794 15.2616L16.6281 16.1351Z",
  "M1.35148 1.84615L4.88698 7.31591C5.54614 8.33572 5.54614 9.64727 4.88698 10.6671L1.35148 16.1368L0.000244179 15.2634L3.53569 9.79367C3.85126 9.30544 3.85126 8.67755 3.53569 8.18932L0.000244727 2.71957L1.35148 1.84615Z",
] as const;
