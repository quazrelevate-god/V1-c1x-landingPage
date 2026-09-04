import { useEffect, useRef, useState } from "react";

import { useSectionLink } from "@/lib/section-scroll";
import slide1 from "@/assets/hero-slides/slide-1.png";
import slide2 from "@/assets/hero-slides/slide-2.png";
import slide3 from "@/assets/hero-slides/slide-3.png";
import slide4 from "@/assets/hero-slides/slide-4.png";

const headline = "Trade direct. No unverified hands in between.";
const subhead =
  "Corridor One X connects verified producers, exporters, and importers directly. AI matching, autonomous settlement, and escrow-secured payment.";

const slides = [slide1, slide2, slide3, slide4];
const SLIDE_INTERVAL_MS = 4000;

/** Cut-out harbour scene, sky removed. Served from public/, so no bundler import. */

/*
 * Three scroll beats across the pinned range (p 0..1).
 *
 *   [0.00 → 0.45]  Expand. The card grows out to full bleed: insets close to
 *                  zero, corners sharpen, elevation shadow fades. The off-white
 *                  page behind it is fully covered by the end.
 *   [0.45 → 0.55]  Hold. Full bleed and crisp. A beat of stillness so the
 *                  expansion has somewhere to land before the next move starts.
 *   [0.55 → 1.00]  Bury. The hero blurs, dims and eases back while the section
 *                  below climbs over it. It is occluded, never scrolled away.
 */
const P_EXPAND_END = 0.45;
const P_HOLD_END = 0.55;

/*
 * When the nav drops in: exactly the hold beat.
 *
 * Derived from the two beat markers rather than given its own numbers, so the
 * nav cannot drift out of step if the beats are ever retimed. The card finishes
 * expanding at P_EXPAND_END and only begins burying at P_HOLD_END, so the whole
 * entrance happens while the card is sitting still at full bleed — it follows
 * the card into place rather than racing it there.
 *
 * Being derived from scroll position rather than fired as a one-shot event, it
 * reverses on the way back up for free.
 */
const P_NAV_IN_START = P_EXPAND_END;
const P_NAV_IN_END = P_HOLD_END;

/*
 * Resting geometry per breakpoint. These MUST mirror the card's Tailwind classes
 * exactly — those classes are what render before this effect runs and what stands
 * under reduced motion, so any drift between the two shows as a jump on first
 * scroll.
 *
 * The top inset is much deeper than the others: that band of cream page is what
 * the ghost-type marquee sits in.
 */
const rest = (w: number) =>
  w < 640
    ? { x: 16, top: 44, bottom: 28, radius: 20 }
    : w < 768
      ? { x: 56, top: 44, bottom: 56, radius: 32 }
      : w < 1024
        ? { x: 56, top: 52, bottom: 56, radius: 32 }
        : { x: 56, top: 72, bottom: 56, radius: 32 };

/* Ghost marquee: the slowest, furthest-back layer. Lags at half the scroll rate. */
const GHOST_RATE = 0.5;
const GHOST_MAX_PX = 160;

/*
 * Alternates Indian origin ports with international destinations, and the
 * alternation is the point — it reads as corridors rather than as a list. Keep
 * the pairing if you edit this: every odd entry is an origin, every even one a
 * destination.
 */
const PORTS = [
  "Kandla", "Rotterdam",
  "Mundra", "Jebel Ali",
  "Tuticorin", "Hamburg",
  "Kakinada", "Singapore",
  "Chennai", "Antwerp",
  "Krishnapatnam", "Mombasa",
  "Visakhapatnam", "Colombo",
  "Nhava Sheva", "Durban",
];

/* Hair spaces (U+200A) either side of the middot — tighter than a word space,
   so the separator reads as punctuation rather than as a gap. */
const SEP = " · ";

/* One copy of the loop, trailing separator included so the join at the seam is
   identical to every other join. Rendered twice in the track, so animating to
   -50% lands exactly one copy along and the seam is invisible. */
const GHOST_SEQUENCE = `${PORTS.join(SEP)}${SEP}`;

/* Bury depth. Scale stays shallow on purpose — the pane is full bleed by then, so
   anything more reveals the section background down its edges. */
const BURY_BLUR_PX = 14;
const BURY_BRIGHTNESS = 0.5;
const BURY_SCALE = 0.97;


const MOBILE_MQ = "(max-width: 767px)";
const MOBILE_AMPLITUDE = 0.4;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function HeroCta() {
  return (
    <a
      href="/book-a-demo"
      className="inline-block rounded-md border border-transparent bg-accent px-6 py-3.5 text-center font-display text-sm font-medium tracking-tight text-accent-foreground hover:bg-accent-hover"
    >
      Book a Demo
    </a>
  );
}

function HeroSecondaryCta() {
  const onSectionClick = useSectionLink();
  return (
    <a
      href="/#how-it-works"
      onClick={(e) => onSectionClick(e, "how-it-works")}
      className="inline-block rounded-md border border-border px-6 py-3.5 text-center font-display text-sm font-medium tracking-tight text-foreground hover:border-accent/50 hover:text-accent"
    >
      See How It Works
    </a>
  );
}

export function Hero() {
  const [index, setIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const buryRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const ghostBandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    /*
     * Reduced motion: never subscribe, never write a style. The card's Tailwind
     * classes already describe the resting frame — inset, rounded, unblurred — so
     * doing nothing leaves a correct, complete composition on screen.
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // The nav's entrance is scroll-driven, and nothing below this line will
      // run to drive it. Seat it immediately rather than leaving it hidden for
      // the whole page.
      document.documentElement.style.setProperty("--nav-reveal", "1");
      return;
    }

    const mobileMq = window.matchMedia(MOBILE_MQ);
    let raf = 0;
    let inView = false;

    const apply = () => {
      raf = 0;
      const pinned = pinnedRef.current;
      const bury = buryRef.current;
      const card = cardRef.current;
      const ghost = ghostRef.current;
      if (!pinned || !bury || !card) return;

      const paneH = pinned.offsetHeight;
      const range = Math.max(section.offsetHeight - paneH, 1);
      const p = clamp01(-section.getBoundingClientRect().top / range);

      const mobile = mobileMq.matches;
      const amp = mobile ? MOBILE_AMPLITUDE : 1;
      const r = rest(window.innerWidth);

      /*
       * The ghost band's height IS the card's resting top inset — that is what
       * makes the card's edge the crop line. Driving it from the same rest() call
       * that positions the card keeps them from ever disagreeing.
       *
       * It used to be declared separately in CSS media queries. The two then
       * desynchronised on resize: the band picked up its new breakpoint height
       * immediately while the card kept a stale inline top from the previous
       * width, and the crop silently stopped happening.
       */
      const band = ghostBandRef.current;
      if (band) band.style.height = `${r.top}px`;

      // ── Beat 1: expand ────────────────────────────────────────────────────
      const e = easeInOutCubic(clamp01(p / P_EXPAND_END));
      card.style.left = `${lerp(r.x, 0, e).toFixed(1)}px`;
      card.style.right = `${lerp(r.x, 0, e).toFixed(1)}px`;
      const cardTopNow = lerp(r.top, 0, e);
      card.style.top = `${cardTopNow.toFixed(1)}px`;

      /*
       * The hero is the one section whose tone changes mid-scroll: it opens as
       * the cream page with an inset card, then the card expands over the whole
       * viewport. The nav's wordmark sits ~33px down, so once the card's top
       * edge climbs past that line the wordmark is over dark artwork rather than
       * cream, and it has to flip. Every other section declares a fixed tone.
       */
      section.dataset["navTone"] = cardTopNow < 40 ? "dark" : "light";

      /*
       * The nav's entrance, published as a CSS variable rather than React state.
       * This runs every frame of the hero; a setState here would re-render the
       * nav on each one. As a custom property the browser just re-resolves a
       * transform, and Nav never re-renders at all.
       */
      const navIn = clamp01((p - P_NAV_IN_START) / (P_NAV_IN_END - P_NAV_IN_START));
      document.documentElement.style.setProperty("--nav-reveal", navIn.toFixed(3));
      card.style.bottom = `${lerp(r.bottom, 0, e).toFixed(1)}px`;
      card.style.borderRadius = `${lerp(r.radius, 0, e).toFixed(1)}px`;
      card.style.boxShadow = `0 24px 60px -20px rgba(0,0,0,${lerp(0.35, 0, e).toFixed(3)})`;

      // Ghost type is the furthest-back layer: it lags at half the scroll rate,
      // so it drifts down the screen more slowly than anything in front of it.
      if (ghost) {
        const ghostY = Math.min(p * range * GHOST_RATE, GHOST_MAX_PX) * amp;
        ghost.style.transform = `translate3d(0, ${ghostY.toFixed(2)}px, 0)`;
      }

      // ── Beat 3: bury ──────────────────────────────────────────────────────
      const b = easeInOutCubic(clamp01((p - P_HOLD_END) / (1 - P_HOLD_END)));
      bury.style.filter = `blur(${(b * BURY_BLUR_PX).toFixed(2)}px) brightness(${lerp(1, BURY_BRIGHTNESS, b).toFixed(3)})`;
      bury.style.transform = `scale(${lerp(1, BURY_SCALE, b).toFixed(4)})`;
    };

    const onScroll = () => {
      if (!inView || raf) return;
      raf = requestAnimationFrame(apply);
    };

    // Only pay for scroll work while the hero is actually on screen.
    const io = new IntersectionObserver((entries) => {
      inView = entries[0]?.isIntersecting ?? false;
      if (inView) apply();
    });
    io.observe(section);

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Resize calls apply() directly rather than going through onScroll, which
    // returns early when the hero is out of view. Breakpoint geometry has to be
    // rewritten on every resize whether or not the section is on screen —
    // otherwise a width change while scrolled away leaves stale insets behind.
    window.addEventListener("resize", apply);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", apply);
      if (raf) cancelAnimationFrame(raf);
      // Leaving on another route: nothing there drives this, and every other
      // page wants its nav from the first frame.
      document.documentElement.style.setProperty("--nav-reveal", "1");
    };
  }, []);

  return (
    /*
     * 300svh of runway against a 100svh pinned pane gives 200svh of scroll to
     * spend on the three beats.
     *
     * No `overflow-hidden` here: it would make this the scroll container and kill
     * the stickiness of the pane inside. The pane clips instead.
     *
     * bg-background so the sliver revealed by the bury scale reads as depth
     * rather than as a gap.
     */
    <section
      ref={sectionRef}
      id="top"
      data-nav-tone="light"
      className="relative z-0 h-[300svh] w-full bg-background"
    >
      <style>{`
        .c1x-ghost {
          /*
           * Pre-hydration / reduced-motion fallback only. The live height is
           * written from rest() in the scroll effect, so the band and the card's
           * top inset can never disagree. Keep this equal to rest()'s smallest
           * tier, and keep the card's Tailwind top-* classes equal to rest() too
           * — those three are what render before any JS runs.
           */
          height: 44px;
          font-family: "Big Shoulders Display", "Oswald", "Arial Narrow", sans-serif;
          font-weight: 700;
          /* One ramp across all breakpoints — the face is tall and narrow enough
             that it no longer needs a separate small-screen size. */
          font-size: clamp(2.25rem, 4.5vw, 5.5rem);
          letter-spacing: 0em;
          word-spacing: -0.06em;
          line-height: 1;
          text-transform: uppercase;
          white-space: nowrap;
          /* Set directly, never via opacity, so it composites predictably. */
          color: #E5DCCB;
        }
        /* Fallback tiers, mirroring rest(). JS overwrites these once mounted. */
        @media (min-width: 768px) {
          .c1x-ghost { height: 52px; }
        }
        @media (min-width: 1024px) {
          .c1x-ghost { height: 72px; }
        }
        .c1x-ghost-track {
          animation: c1x-ghost-drift 65s linear infinite;
        }
        /* Two identical copies in the track, so -50% is exactly one copy along
           and the loop has no visible seam. */
        @keyframes c1x-ghost-drift {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .c1x-ghost-track { animation: none; }
        }
      `}</style>

      <div ref={pinnedRef} className="sticky top-0 h-[100svh] min-h-[560px] w-full overflow-hidden">
        {/* Everything that gets buried lives in here, so blur and dim land on the
            whole composition at once. Kept off the sticky element itself — a
            filter there would complicate its containing block. */}
        <div
          ref={buryRef}
          className="absolute inset-0"
          style={{ willChange: "filter, transform", transformOrigin: "center" }}
        >
          {/* LAYER 1 — page backdrop. Covered completely once the card expands. */}
          <div aria-hidden className="absolute inset-0" style={{ background: "#F4F1EA" }} />

          {/*
            LAYER 1.5 — ghost type.

            Oversized port names sitting on the cream band above the card, cropped
            by the card's top edge so only the upper part of the letterforms reads.
            Sits above the backdrop, below the card, and buries with everything
            else because it lives inside the bury wrapper.

            Height matches the card's resting top inset exactly, and the track is
            bottom-aligned to it, so the crop line IS the card edge. As the card
            expands upward it simply covers this — no separate exit needed.

            Colour is set directly rather than via opacity so it composites
            predictably over the cream.
          */}
          <div
            ref={ghostBandRef}
            aria-hidden
            className="c1x-ghost pointer-events-none absolute inset-x-0 top-0 z-0 flex select-none items-end"
          >
            <div ref={ghostRef} style={{ willChange: "transform" }}>
              {/*
                Drops the line so the card's edge crosses it near the baseline,
                leaving 85% of the cap height showing above the card.

                This value is metric-dependent, not a constant, and it has to
                account for half-leading. Measured for Big Shoulders Display:
                  ascent 0.972em, descent 0.222em, cap height 0.800em
                With line-height 1 the em box (1.194em) overflows the line box, so
                half-leading is (1 - 1.194)/2 = -0.097em. That puts the baseline at
                  bandBottom + T - 0.125em
                and since the band's bottom IS the card edge, hidden = T - 0.125em.
                For 15% of the cap hidden: T = 0.15(0.80) + 0.125 = 0.245em.

                Ignoring half-leading is what made an earlier value of 0.13em look
                right on paper while actually leaving ~99% of the glyph showing.

                In em, so it tracks the clamped font size across breakpoints.
              */}
              <div style={{ transform: "translateY(0.245em)" }}>
                <div className="c1x-ghost-track flex w-max whitespace-nowrap">
                  <span>{GHOST_SEQUENCE}</span>
                  <span>{GHOST_SEQUENCE}</span>
                </div>
              </div>
            </div>
          </div>

          {/*
            LAYER 2 — the hero card. This IS the hero: nav, copy and CTAs inside.

            The Tailwind insets and radius are the resting frame and the reduced
            motion frame; the scroll effect overrides them inline as it expands.
          */}
          <div
            ref={cardRef}
            // Top inset is far deeper than the others — that cream band is where
            // the ghost marquee sits. Left/right/bottom are unchanged.
            // z-10 keeps the card over the ghost (z-0) and under the cut-out (z-20).
            className="absolute inset-x-4 top-11 bottom-7 z-10 overflow-hidden rounded-[20px] sm:inset-x-14 sm:bottom-14 sm:rounded-[32px] md:top-[52px] lg:top-[72px]"
            style={{ boxShadow: "0 24px 60px -20px rgba(0,0,0,0.35)" }}
          >
            {/* Slideshow track: each slide is 100% wide; the track translates left. */}
            <div
              className="absolute inset-0 flex h-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{
                width: `${slides.length * 100}%`,
                transform: `translateX(-${(index * 100) / slides.length}%)`,
              }}
            >
              {slides.map((src, i) => (
                <div key={src} className="relative h-full shrink-0" style={{ width: `${100 / slides.length}%` }}>
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            {/* Readability scrims — unchanged. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, color-mix(in oklab, var(--background) 92%, transparent) 0%, color-mix(in oklab, var(--background) 55%, transparent) 45%, transparent 85%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, color-mix(in oklab, var(--background) 88%, transparent) 0%, color-mix(in oklab, var(--background) 45%, transparent) 46%, transparent 78%)",
              }}
            />

            {/* Nav pinned top, copy pinned bottom-left, the gap between them
                absorbed by a flexible spacer so neither crowds. */}
            <div className="relative z-10 flex h-full flex-col">
              {/* Nav lives in the fixed floating header now, not in the card. */}
              <div className="flex-1" />

              <div className="w-full px-6 pb-10 sm:px-10 sm:pb-14">
                <div className="w-full max-w-2xl">
                  <h1 className="font-display text-[2rem] leading-[1.05] font-medium tracking-[-0.035em] text-foreground sm:text-[3rem] lg:text-[3.5rem]">
                    {headline}
                  </h1>
                  <p className="mt-6 max-w-md font-sans text-[0.88rem] leading-relaxed text-secondary-foreground sm:text-[0.95rem]">
                    {subhead}
                  </p>
                  <div className="mt-9 flex flex-wrap items-center gap-3 sm:mt-10">
                    <HeroCta />
                    <HeroSecondaryCta />
                  </div>

                  <div className="mt-9 flex gap-2 sm:mt-10">
                    {slides.map((_, i) => (
                      <span
                        key={i}
                        aria-hidden
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                          width: i === index ? "28px" : "10px",
                          background:
                            i === index
                              ? "var(--accent)"
                              : "color-mix(in oklab, var(--foreground) 30%, transparent)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*
            LAYER 3 — cut-out foreground — removed.

            It pointed at /images/hero-foreground.png, which has never existed:
            public/images/ is empty. Chrome and Firefox paint a missing image as
            nothing, so the layer looked merely inert. WebKit does not — Safari
            on iPhone, iPad and macOS drew the element's box and a broken-image
            placeholder over the hero, which is the faint rectangle and the small
            blue "?" that showed up in the composition.

            Reinstating it means adding the artwork to public/images/ first, then
            an <img> with the ref, the guard entry and the FG_LEAD_PX transform
            below restored together.
          */}
        </div>
      </div>
    </section>
  );
}
