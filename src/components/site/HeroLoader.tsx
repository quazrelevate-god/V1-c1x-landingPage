import { XMark } from "./XMark";

/**
 * Holds the hero closed until its footage is actually there.
 *
 * The reveal, the callouts and the copy are all driven by scroll, so without a
 * gate they run whether or not the clip has arrived — the mark opens onto a
 * window with nothing behind it and the labels start naming a ship the visitor
 * cannot see yet. On a fast connection that is invisible; on a phone on mobile
 * data it is the whole first impression.
 *
 * The bar reports real buffered progress rather than an indeterminate spinner,
 * so a slow load reads as progress rather than as a hang. The caller is
 * responsible for releasing on a timeout as well as on readiness — see the note
 * there — because a gate that can only open on success is worse than the problem
 * it solves.
 */
export function HeroLoader({ progress, leaving }: { progress: number; leaving: boolean }) {
  const pct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);

  return (
    <div
      // Above everything including the nav: while this is up, the page is not
      // ready to be looked at or interacted with.
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[#0A0A0A] transition-opacity duration-500"
      style={{ opacity: leaving ? 0 : 1, pointerEvents: leaving ? "none" : undefined }}
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${pct} percent`}
    >
      <div className="c1x-loader-pulse w-[38vw] max-w-[190px] text-accent">
        <XMark />
      </div>

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto mb-6 w-full max-w-[220px] px-5">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-accent/15">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-center font-display text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase tabular-nums">
            Loading {pct}%
          </p>
        </div>
      </div>
    </div>
  );
}
