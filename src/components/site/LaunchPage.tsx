import { useEffect, useState } from "react";
import { LaunchEclipse } from "@/components/site/LaunchEclipse";
import { LAUNCH_AT, remainingUntil, type Remaining } from "@/lib/launch";

/**
 * The launch page.
 *
 * Lives here rather than inside a route because two routes render it: `/` until
 * the launch instant passes, and `/launching` as a permanent preview. Keeping
 * one component means the preview cannot drift from what the domain actually
 * serves — which is the whole point of having a preview.
 */
const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/*
 * The counter is set as one instrument reading, not four stacked figures.
 *
 * The composition above it is doing the work, and a display-size countdown
 * would fight it — two things shouting at each other in the middle of a frame
 * that is mostly empty on purpose. So the figures are small, evenly weighted and
 * widely tracked to match the wordmark, and hierarchy is carried by colour
 * instead of size: the seconds sit in accent because they are the only part that
 * moves, and a moving digit at the same tone as the rest reads as instability
 * rather than as a pulse.
 */
function Counter({ left }: { left: Remaining | null }) {
  return (
    <div className="mt-11 flex items-start justify-center gap-6 sm:gap-9">
      {UNITS.map((u, i) => (
        <div key={u.key} className="flex flex-col items-center">
          <span
            className={`font-display text-[1.45rem] leading-none font-normal tabular-nums sm:text-[1.75rem] ${
              i === UNITS.length - 1 ? "text-accent" : "text-foreground/85"
            }`}
            style={{ letterSpacing: "0.06em" }}
          >
            {/* Dashes until the client has a clock. A figure rendered on the
                server is already stale by the time it paints, and mismatches
                on hydration. */}
            {left ? pad(left[u.key]) : "––"}
          </span>
          <span
            className="mt-3 font-display text-[0.55rem] text-muted-foreground/70 uppercase"
            style={{ letterSpacing: "0.3em", textIndent: "0.3em" }}
          >
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LaunchPage() {
  const [left, setLeft] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setLeft(remainingUntil(LAUNCH_AT, Date.now()));
    tick();
    /*
     * Realigned to the wall clock each tick rather than a flat 1000ms interval.
     * A fixed interval drifts against the system clock and against its own
     * timer throttling, so on a tab left open the seconds start skipping or
     * repeating. Waking just after each second boundary keeps the digit honest.
     */
    let id = 0;
    const schedule = () => {
      id = window.setTimeout(
        () => {
          tick();
          schedule();
        },
        1000 - (Date.now() % 1000) + 12,
      );
    };
    schedule();
    return () => clearTimeout(id);
  }, []);

  const launched = left !== null && left.days + left.hours + left.minutes + left.seconds === 0;

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#030403]">
      {/*
        The body is placed, not centred.

        The mark is the occluding body, so it is sized as an object in a frame
        rather than as a logo on a page: large enough to dominate, with enough
        black around it that the corona has somewhere to fall off to. Bounded on
        both axes so the framing survives a phone in portrait and a wide monitor
        without a second set of numbers.
      */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ top: "17svh", width: "min(52vw, 46svh, 30rem)", aspectRatio: "1" }}
      >
        <LaunchEclipse className="h-full w-full" />
      </div>

      {/*
        Grain over the whole frame, not over the body.

        Inside the eclipse component it painted a visible square across the
        composition, because a filtered <rect> covers its element box whatever
        the artwork inside it is doing. At page level there is no box to see: it
        is the film the whole image is shot on, which is what it should have been.
      */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,' +
            "%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E" +
            "%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E" +
            "%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E" +
            "%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/*
        The type sits over the body's lower half, where the gradient has already
        fallen to the page's own black — so it is legible without a scrim, and
        nothing has to be drawn behind it.
      */}
      <div className="relative flex min-h-svh flex-col items-center justify-end px-6 pb-[10svh] text-center">
        <h1
          className="font-display text-[clamp(1.15rem,3.6vw,2.1rem)] leading-none font-light text-foreground/90 uppercase"
          style={{ letterSpacing: "0.42em", textIndent: "0.42em" }}
        >
          {launched ? "We are live" : "Launching Soon"}
        </h1>

        <p
          className="mt-6 font-display text-[clamp(0.6rem,1.5vw,0.76rem)] text-accent uppercase"
          style={{ letterSpacing: "0.5em", textIndent: "0.5em" }}
        >
          Corridor One X
        </p>

        {!launched && <Counter left={left} />}

        <p
          className="mt-10 font-display text-[0.58rem] text-muted-foreground/55 uppercase"
          style={{ letterSpacing: "0.26em", textIndent: "0.26em" }}
        >
          04 September 2026 · 18:00 IST
        </p>
      </div>
    </main>
  );
}
