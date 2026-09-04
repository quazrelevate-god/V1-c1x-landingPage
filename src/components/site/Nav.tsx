import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { scrollToSection, useSectionLink } from "@/lib/section-scroll";

/*
 * Which tone is behind the wordmark at this screen line?
 *
 * Every section declares `data-nav-tone`, so this is a straight lookup rather
 * than an inference. The last match in DOM order wins: sections later in the
 * document paint over earlier ones here — `main` carries z-10 over the hero's
 * z-0 — so the last one spanning this line is what is actually visible.
 *
 * An earlier version hit-tested with `elementsFromPoint` and read background
 * colours off the stack. It worked at the top of the page and then failed
 * further down, because that stack is full of transparent wrappers, gradient
 * overlays and `pointer-events: none` layers that it either skipped or
 * misread. Declaring the tone removes the guesswork entirely.
 */
function toneAtLine(y: number): "light" | "dark" | null {
  let tone: string | null = null;
  for (const el of document.querySelectorAll<HTMLElement>("[data-nav-tone]")) {
    const b = el.getBoundingClientRect();
    if (b.top <= y && b.bottom >= y) tone = el.dataset["navTone"] ?? null;
  }
  return tone === "light" || tone === "dark" ? tone : null;
}

/** Phones only, matching the cutoff the orbit and hero already use. */
const NAV_MOBILE_MQ = "(max-width: 767px)";

/*
 * How far you have to move before the nav changes its mind, in px.
 *
 * Without a threshold the smallest wobble — a trackpad settling, Lenis easing
 * out the last pixels of a flick — flips the direction and the bar twitches.
 */
const DIR_THRESHOLD = 8;

/** Above this the nav always shows: near the top there is nothing to reclaim. */
const DIR_TOP_ZONE = 80;

/** Sections on the landing page, and the two routes that are their own pages. */
type NavLink =
  | { label: string; hash: string; to?: undefined }
  | { label: string; to: "/about" | "/book-a-demo"; hash?: undefined };

/*
 * Ordered the way the page is, so reading the menu top to bottom is the same
 * walk as scrolling: Who It's For sits near the top of the landing page and FAQ
 * near the end, but the list had them fourth and fifth. The two real routes come
 * last, after everything that lives on `/`.
 *
 * The Logistics section still carries id="corridors" and is still reachable by
 * scrolling and by /#corridors — only its menu entry is gone.
 */
const links: NavLink[] = [
  { label: "Who It's For", hash: "who-its-for" },
  { label: "How It Works", hash: "how-it-works" },
  { label: "Money", hash: "money" },
  { label: "FAQ", hash: "faq" },
  { label: "About", to: "/about" },
  { label: "Book a Demo", to: "/book-a-demo" },
];

/*
 * Floating nav — a mark and a menu button, nothing else.
 *
 * There is deliberately no bar: no background, no border, no backdrop blur. The
 * full-width chrome was cutting a band across every section it passed over and
 * clipping the top of anything sitting near the viewport edge. Two floating
 * elements leave the composition underneath intact.
 *
 * Renders on `/`, `/about` and `/book-a-demo`. On the two inner pages it is
 * seated from the first frame; on the landing page it drops in behind the hero
 * card — see the reveal note below.
 *
 * pointer-events are off on the wrapper and back on for the controls, so the
 * empty space between them never intercepts a click on the page beneath.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const wordRef = useRef<HTMLSpanElement>(null);
  /** True while the wordmark is over a dark backdrop, so it should paint light. */
  const [onDark, setOnDark] = useState(true);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onSectionClick = useSectionLink();
  /** Phones only: true while the last meaningful move was downward. */
  const [hiddenByScroll, setHiddenByScroll] = useState(false);

  /*
   * `mix-blend-mode: difference` is the obvious way to do this and it does not
   * work here: the nav is `position: fixed`, which creates its own stacking
   * context, and that isolates the blend — the type composites against the
   * header's transparent backdrop rather than the page, so it stayed pure white
   * and vanished on the cream sections.
   *
   * Sampling what is actually behind it does work, and gives the same result:
   * near-black over light, near-white over dark.
   */
  useEffect(() => {
    let raf = 0;

    const sample = () => {
      raf = 0;
      const word = wordRef.current;
      if (!word) return;
      const r = word.getBoundingClientRect();
      const tone = toneAtLine(r.top + r.height / 2);
      if (tone) setOnDark(tone === "dark");
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(sample);
    };

    sample();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /*
   * Phones reclaim the strip the nav occupies: scroll down and it leaves, scroll
   * back up — even slightly — and it returns.
   *
   * Direction is a discrete flip, not a continuous value, so this is React state
   * rather than another CSS variable: it re-renders only when the direction
   * actually changes, not on every frame of every scroll.
   *
   * It rides on a SEPARATE element from the hero reveal. Both want to translate
   * the nav vertically, but the hero's value changes every frame and must not be
   * eased, while this one is a 0/1 flip that must be. Stacking them on one
   * element would force one transition to serve both, and the nav would lag
   * behind the hero card on its way in.
   */
  useEffect(() => {
    const mq = window.matchMedia(NAV_MOBILE_MQ);
    let raf = 0;
    let last = window.scrollY;

    const sample = () => {
      raf = 0;
      const y = window.scrollY;
      const dy = y - last;

      if (!mq.matches || y <= DIR_TOP_ZONE) {
        last = y;
        setHiddenByScroll(false);
        return;
      }
      if (Math.abs(dy) < DIR_THRESHOLD) return; // ignore the wobble, keep `last`
      last = y;
      setHiddenByScroll(dy > 0);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(sample);
    };

    sample();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /*
   * Arriving at the landing page with a hash — from /about, from a shared link,
   * or from a reload — needs the scroll re-applied after the page settles.
   *
   * The browser resolves the anchor once, on first paint. At that moment the
   * hero video, the section artwork and the display face have not loaded, and
   * every one of them changes the height of the page above the target, so the
   * jump lands short. Re-running it as each of those settles is what makes a
   * deep link reliable rather than approximately right.
   */
  useEffect(() => {
    if (pathname !== "/") return;
    const id = decodeURIComponent(window.location.hash.replace("#", ""));
    if (!id) return;

    let cancelled = false;
    const settle = () => {
      if (!cancelled) scrollToSection(id, false);
    };

    const raf = requestAnimationFrame(settle);
    void document.fonts?.ready.then(settle).catch(() => {});
    const t = window.setTimeout(settle, 600);
    window.addEventListener("load", settle, { once: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener("load", settle);
    };
  }, [pathname]);

  /*
   * The nav's entrance on the landing page.
   *
   * Hero writes `--nav-reveal` every frame: 0 while the hero card is still
   * expanding, 1 once it has filled the viewport. The nav rides that value down
   * from above and stays seated for the rest of the page — and because the value
   * is derived from scroll position rather than fired as a one-shot event,
   * scrolling back up lifts it away again with no extra code.
   *
   * The fallback differs by route, and deliberately: on `/` it is 0, so the nav
   * is hidden on the very first frame before Hero's effect has run — a fallback
   * of 1 there would flash it on screen and then snatch it away. Every other
   * route has no hero to drive the value, so it stays seated at 1.
   *
   * At reveal 0 the header sits entirely above the viewport — its own height
   * up, measured 84px — so nothing of it overlaps the hero and it cannot
   * intercept a click meant for the card underneath.
   */
  const onLanding = pathname === "/";
  const reveal = onLanding ? "var(--nav-reveal, 0)" : "1";
  // Never hide the bar the menu is hanging off — the panel would leave with it.
  const navHidden = hiddenByScroll && !open;

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
      style={{
        transform: `translate3d(0, calc((${reveal} - 1) * 100%), 0)`,
        opacity: reveal,
      }}
    >
      {/*
        Direction layer. Separate from the header's hero-reveal transform so the
        eased 0/1 flip below never has to share a transition with the hero's
        per-frame value above.
      */}
      <div
        className="transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: navHidden ? "translate3d(0, -100%, 0)" : "translate3d(0, 0, 0)" }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-start justify-between px-5 py-5 sm:px-8 sm:py-7">
          {/*
          The lockup is split into the mark and the wordmark.

          It was one PNG carrying both, with the wordmark baked in as white — so
          over the light sections the text disappeared into the background. The
          mark keeps its lime and its glow; only the wordmark needed to react.

          The wordmark takes the inverse of whatever is behind it: near-black
          over the cream sections, near-white over the dark ones, picked from the
          section's declared tone as it scrolls past.
        */}
          <Link
            to="/"
            aria-label="Corridor One X home"
            className="pointer-events-auto flex items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            {/*
            The mark keeps its lime on every background, but lime on cream is a
            weak pairing — both are light, so the shape lost its edge on the
            light sections. A soft dark bloom sits behind it there and fades out
            over the dark sections, where the mark already separates on its own.
          */}
            <span className="relative inline-flex items-center">
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-2 rounded-full bg-black blur-lg transition-opacity duration-200"
                style={{ opacity: onDark ? 0 : 0.38 }}
              />
              <img
                src="/brand/corridor-one-x-mark-lime.svg"
                alt=""
                aria-hidden
                className="relative h-6 w-auto sm:h-7"
              />
            </span>
            <span
              ref={wordRef}
              className="font-display text-[1.05rem] font-medium tracking-[-0.01em] transition-colors duration-200 sm:text-[1.2rem]"
              style={{ color: onDark ? "#FFFFFF" : "#0B0B0B" }}
            >
              Corridor One X
            </span>
          </Link>

          <div className="pointer-events-auto relative">
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              // Bare glyph: no disc, no border, no backdrop. The circle read as a
              // button chip sitting on top of the artwork rather than part of it.
              // h-11 w-11 stays for the tap target even though nothing paints there.
              // Colour follows the same tone as the wordmark so it survives both
              // the cream and the dark sections.
              className="grid h-11 w-11 place-items-center transition-colors duration-200"
              style={{ color: onDark ? "#FFFFFF" : "#0B0B0B" }}
            >
              {open ? (
                <X className="h-5 w-5" strokeWidth={2.25} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2.25} />
              )}
            </button>

            {/* Panel hangs off the button rather than spanning the viewport. */}
            {open && (
              <div className="absolute right-0 top-full mt-3 w-56 rounded-xl border border-border bg-background/95 shadow-2xl backdrop-blur-xl">
                <ul className="flex flex-col px-4 py-2">
                  {links.map((l) => (
                    <li key={l.label}>
                      {l.hash !== undefined ? (
                        <a
                          href={`/#${l.hash}`}
                          onClick={(e) => onSectionClick(e, l.hash, () => setOpen(false))}
                          className="block py-3 font-display text-[0.95rem] tracking-tight text-foreground transition-colors duration-200 hover:text-accent"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          to={l.to}
                          onClick={() => setOpen(false)}
                          className="block py-3 font-display text-[0.95rem] tracking-tight text-foreground transition-colors duration-200 hover:text-accent"
                        >
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
