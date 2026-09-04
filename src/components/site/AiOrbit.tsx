import { useEffect, useRef, useState } from "react";
import { Search, Gauge, Repeat, ShieldAlert, Radar, Fingerprint, LineChart } from "lucide-react";
import RadialOrbitalTimeline, { type TimelineItem } from "@/components/ui/radial-orbital-timeline";
/*
 * Section footage — one cut per orientation.
 *
 * A single 3:1 ultra-wide used to serve both, which meant a phone got a ~125px
 * strip in an 812px pane and had to be scaled 1.8x to read, cropping roughly
 * half its width. Two purpose-cut sources remove that compromise: each already
 * matches the shape of the screen it plays on, so neither is zoomed or cropped.
 */
import mockDesktop from "@/assets/mock-desktop.mp4";
import mockMobile from "@/assets/mock-mobile.mp4";
import { assetSrc } from "@/lib/media";

/* Served from the CDN when VITE_MEDIA_BASE is set — these clips are the two
   heaviest assets on the site, and the only ones that need real 206 range
   responses to seek. The bundled imports remain as the fallback. */
const DESKTOP_CLIP = { src: assetSrc("orbit-desktop.mp4", mockDesktop) }; // 1920 x 1080, 16:9
const MOBILE_CLIP = { src: assetSrc("orbit-mobile.mp4", mockMobile) };    //  720 x 1280, 9:16 portrait

/** Below this the portrait cut plays. Same cutoff as the sun size. */
const ORBIT_MOBILE_MQ = "(max-width: 767px)";


/*
 * Scroll phases across the pinned section, in normalised progress (0..1).
 *   [0.00 → 0.38]  Reverse aperture. The logo's solid silhouette starts far larger
 *                  than the viewport — so the visitor arrives on an unbroken video
 *                  canvas with no shape visible — and shrinks to mark size.
 *   [0.38 → 0.55]  Silhouette cross-fades to the real lime mark. Copy rises.
 *   [0.55 → 0.80]  Orbit blooms — dashed ring + seven staggered planets.
 *   [0.80 → 1.00]  Free orbit. Auto-rotates. Pull-quote fades in.
 *
 * Pacing note. These fractions are only half the story — what the visitor feels is
 * fraction x runway, and the runway is set by the section height below.
 *
 * This section used to read as rushed even though its runway (220svh) was LONGER
 * than the hero's (200svh). The section length was never the problem. Three things
 * were: the headline move (the aperture) got 66svh against the hero's 90svh for
 * its expand; three separate transformations were stacked into the first two
 * thirds; and the final third was near-static, so the busy opening had a dead
 * stretch to be contrasted against.
 *
 * The runway is now 400svh and the beats are spread across it, so every one of
 * them gets more scroll than the hero's main beat:
 *   aperture 152svh · cross-fade 68svh · bloom 100svh · free orbit 80svh
 */
const P_APERTURE_END = 0.38;
const P_SUN_END = 0.55;
const P_ORBIT_END = 0.80;

/*
 * Final on-screen size of the mark.
 *
 * Smaller on a phone — at 96px it dominated the ring and pushed the labels to
 * the edges. The aperture's closing mask size is derived from the SAME value, so
 * the window always lands exactly on the mark; hard-coding one and not the other
 * is how they drift apart.
 */
const sunPx = (w: number) => (w < 768 ? 67 : 96);
/*
 * Starting mask size for the aperture, as a multiple of the viewport diagonal.
 *
 * The silhouette's concave edges dip in to 3.54/18, so only the middle ~60% of its
 * bounding box is guaranteed solid. To land the whole viewport inside solid area at
 * p=0 — 100% video, zero shape — this has to be roughly 1.8x the viewport diagonal.
 * 1.85 keeps a small margin over that without buying dead scroll.
 *
 * It used to be a flat 5000px, sized for a 2560x1440 screen "with room to spare".
 * That room was the bug: on a 1440x900 viewport the mask only starts biting at
 * ~3057px, so the whole 5000 → 3057 stretch changed nothing on screen. Solved
 * back through the easing that was 17.6% of the section — about 70svh, the best
 * part of a screen height — spent scrolling with the picture perfectly still.
 */
const APERTURE_COVER = 1.85;

/** Pre-measurement fallback. Covers any display; replaced on the first frame. */
const APERTURE_START_FALLBACK = 5000;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// The real SVG files from public/brand/. Vite serves /brand/* from the public folder.
/** Closed, filled silhouette — mask only. See the note in the file itself for why
 *  the shipping mark can't be used here: four corner gaps and a hollow centre. */
const X_SOLID_MASK = "/brand/corridor-one-x-mark-solid.svg";
const X_LIME_SVG = "/brand/corridor-one-x-mark-lime.svg";

const nodes: TimelineItem[] = [
  {
    id: 1,
    title: "Ingest",
    date: "Step 01",
    category: "Matches on more than commodity.",
    content:
      "The AI weighs commodity type, grade, volume, corridor, price expectation, and trust history together, not just a keyword search. It finds counterparties a manual search would miss.",
    icon: Search,
    relatedIds: [2, 7],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "Verify",
    date: "Step 02",
    category: "Works only with verified data.",
    content:
      "Every listing and requirement entering the model is tied to a verified entity, so matches are built on facts the network has already checked.",
    icon: Fingerprint,
    relatedIds: [1, 3],
    status: "completed",
    energy: 95,
  },
  {
    id: 3,
    title: "Score",
    date: "Step 03",
    category: "Ranks by likelihood to close.",
    content:
      "Every match is scored on fit and on both parties' verified track records, so the strongest, safest deals surface first.",
    icon: Gauge,
    relatedIds: [2, 4],
    status: "in-progress",
    energy: 88,
  },
  {
    id: 4,
    title: "Screen",
    date: "Step 04",
    category: "Flags risk before it costs you.",
    content:
      "The AI reads patterns across verified trade data to surface counterparty and delivery risk early, so a deal is protected before it's signed, not after it fails.",
    icon: ShieldAlert,
    relatedIds: [3, 5],
    status: "in-progress",
    energy: 80,
  },
  {
    id: 5,
    title: "Price",
    date: "Step 05",
    category: "Reads the corridor's real pricing.",
    content:
      "Live signals from closed trades across the network give both sides a grounded price band, so negotiation starts from evidence rather than guesswork.",
    icon: LineChart,
    relatedIds: [4, 6],
    status: "pending",
    energy: 72,
  },
  {
    id: 6,
    title: "Monitor",
    date: "Step 06",
    category: "Works while you don't.",
    content:
      "The market moves constantly. The AI monitors it continuously and alerts you the moment a matching, verified opportunity appears.",
    icon: Radar,
    relatedIds: [5, 7],
    status: "pending",
    energy: 65,
  },
  {
    id: 7,
    title: "Learn",
    date: "Step 07",
    category: "Learns from every closed deal.",
    content:
      "Each completed transaction sharpens the model: better matches, better pricing signals, better risk detection with every deal on the platform.",
    icon: Repeat,
    relatedIds: [6, 1],
    status: "pending",
    energy: 58,
  },
];

export function AiOrbit() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const apertureVideoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  /*
   * Vertical distance from the pane's centre to the mark's centre, in px.
   *
   * The aperture layer is exactly viewport-sized so the video renders at its
   * natural scale — blowing the layer up to 200vw/200vh to reach the mark meant
   * a 1280x720 source was being stretched past 2x, which is visible as
   * pixelation through the window. Instead the layer stays put and the *mask*
   * moves: this offset is fed into `mask-position`, so the window still closes
   * on the mark while the footage underneath is never upscaled to chase it.
   *
   * Measured rather than hard-coded because the mark sits at the centre of the
   * flex stage, whose height depends on the header and pull-quote above and
   * below it — and that changes with viewport and font metrics.
   */
  const [maskOffsetY, setMaskOffsetY] = useState(0);
  // Direct scroll → progress mapping. No easing, no rAF trailing loop — the scene
  // tracks the finger 1:1 so formation and deformation both feel instantaneous.
  // Scroll events are coalesced through a single rAF tick to avoid layout thrash.
  const raf = useRef(0);
  const [p, setP] = useState(0);
  const [sunSize, setSunSize] = useState(96);
  const [apertureStart, setApertureStart] = useState(APERTURE_START_FALLBACK);
  const [isMobile, setIsMobile] = useState(false);

  // Autoplay-on-muted normally works, but some contexts (backgrounded tabs, dev preview
  // panes) refuse it. Force a play() on mount, then again on the first user gesture, so
  // the aperture shows live motion rather than a frozen first frame.
  useEffect(() => {
    const kickPlay = () => {
      const v = apertureVideoRef.current;
      if (!v) return;
      v.play().catch(() => {
        /* refused; a later gesture will retry */
      });
    };
    kickPlay();
    const events: (keyof WindowEventMap)[] = ["pointerdown", "touchend", "click", "keydown"];
    events.forEach((e) => window.addEventListener(e, kickPlay, { capture: true, passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, kickPlay, true));
    };
  }, []);

  useEffect(() => {
    const compute = () => {
      raf.current = 0;
      const section = sectionRef.current;
      const pinned = pinnedRef.current;
      if (!section) return;
      const total = section.offsetHeight - (pinned ? pinned.offsetHeight : window.innerHeight);
      const raw = -section.getBoundingClientRect().top / Math.max(total, 1);
      setP(clamp01(raw));

      /*
       * Re-measure the mask offset here rather than once on mount.
       *
       * A one-shot measurement is read before layout has settled — web fonts swap
       * in, the video reports metadata, sticky engages — and any of those move the
       * stage's centre after the fact. The measurement then never runs again, the
       * offset stays at its stale value (0 in practice), and the aperture closes on
       * the pane's centre while the mark sits ~37px lower. That is the mismatch.
       *
       * Reading it on every frame we already touch keeps it correct by definition.
       * The rects are cheap and we are in a rAF the scroll handler already owns;
       * the state only updates when the value actually moves, so this does not add
       * renders while scrolling.
       */
      setSunSize((prev) => {
        const next = sunPx(window.innerWidth);
        return prev === next ? prev : next;
      });
      // Sized to THIS viewport, so the shape starts biting on the first scroll
      // rather than after a screenful of invisible shrinking.
      setApertureStart((prev) => {
        const next = Math.round(
          Math.hypot(window.innerWidth, window.innerHeight) * APERTURE_COVER,
        );
        return prev === next ? prev : next;
      });
      setIsMobile((prev) => {
        const next = window.matchMedia(ORBIT_MOBILE_MQ).matches;
        return prev === next ? prev : next;
      });

      const stage = stageRef.current;
      if (pinned && stage) {
        const p = pinned.getBoundingClientRect();
        const s = stage.getBoundingClientRect();
        const next = Math.round(s.top + s.height / 2 - (p.top + p.height / 2));
        setMaskOffsetY((prev) => (prev === next ? prev : next));
      }
    };
    const onScroll = () => {
      // Coalesce bursts of scroll events through a single rAF tick so we set state
      // at most once per frame — but never trailing behind by more than that frame.
      if (raf.current) return;
      raf.current = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Resize calls compute directly rather than going through onScroll, which
    // sits behind an rAF guard that can early-return. Breakpoint state — which
    // clip plays, the sun size — must be rewritten on every resize regardless.
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // ─── Phase 1: reverse aperture — the silhouette shrinks to mark size ──────
  /*
   * easeOutCubic, not easeInOutCubic.
   *
   * An ease-in-out leaves at zero rate: however well the start size is chosen,
   * the first stretch of scroll still moves the mask barely at all. Sizing alone
   * cut the dead scroll from ~70svh to ~21svh; this removes the rest, because
   * the shape now starts collapsing on the very first frame of the section.
   *
   * It also lands better. The fast opening reads as the aperture giving way, and
   * the long tail decelerates into the sun instead of arriving at speed.
   */
  const apertureShrink = easeOutCubic(clamp01(p / P_APERTURE_END));
  const apertureSizePx = lerp(apertureStart, sunSize, apertureShrink);

  /* Portrait cut on a portrait screen, landscape on landscape — each plays at
     native resolution, so neither is zoomed or cropped. */
  const clip = isMobile ? MOBILE_CLIP : DESKTOP_CLIP;

  // ─── Phase 2: silhouette → real lime mark + copy rises ────────────────────
  const p2 = clamp01((p - P_APERTURE_END) / (P_SUN_END - P_APERTURE_END));
  // One layer fades out exactly as the other fades in, so the two always sum to 1
  // and the mark never dips in density mid-cross-fade.
  const apertureOpacity = 1 - easeInOutCubic(p2); // 1 → 0
  const solidSun = easeInOutCubic(p2); // 0 → 1
  const copyReveal = easeOutCubic(clamp01((p - (P_APERTURE_END + 0.02)) / (P_SUN_END - P_APERTURE_END)));

  // ─── Phase 3: orbit bloom ─────────────────────────────────────────────────
  const orbitReveal = easeOutCubic(clamp01((p - P_SUN_END) / (P_ORBIT_END - P_SUN_END)));

  // ─── Phase 4: pull-quote + interactivity ──────────────────────────────────
  const pullQuote = clamp01((p - (P_ORBIT_END + 0.02)) / (1 - P_ORBIT_END - 0.02));
  const interactive = p >= P_ORBIT_END;

  return (
    <section
      ref={sectionRef}
      id="ai-orbit"
      data-nav-tone="dark"
      className="relative h-[500svh] bg-black"
      aria-label="How the AI works"
    >
      <div
        ref={pinnedRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden bg-black"
      >
        {/* REVERSE APERTURE — exactly viewport-sized, so the footage renders at
            its natural scale rather than being blown up to reach the mark.

            The mark sits a little below the pane's centre (the header takes space
            above it), so the mask — not the layer — is offset by `maskOffsetY` to
            land on it. Sizing the layer up to chase the mark is what caused the
            pixelation: a 1280x720 source stretched past 2x. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: apertureOpacity,
            WebkitMaskImage: `url(${X_SOLID_MASK})`,
            maskImage: `url(${X_SOLID_MASK})`,
            WebkitMaskSize: `${apertureSizePx}px ${apertureSizePx}px`,
            maskSize: `${apertureSizePx}px ${apertureSizePx}px`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: `50% calc(50% + ${maskOffsetY}px)`,
            maskPosition: `50% calc(50% + ${maskOffsetY}px)`,
            WebkitMaskMode: "alpha",
            maskMode: "alpha",
            willChange: "opacity, mask-size",
          } as React.CSSProperties}
        >
          <video
            ref={apertureVideoRef}
            // No scale: each cut already matches its screen's orientation, so
            // `contain` shows the whole frame with almost nothing left over.
            // key forces a remount when the source swaps — changing src alone can
            // leave the previous clip decoded and playing.
            key={clip.src}
            className="h-full w-full object-contain"
            style={{ objectPosition: "center" }}
            src={clip.src}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        </div>

        {/*
          Both letterbox bands are deliberately empty.

          The top band's prompt line went first — it collided with the fixed nav,
          which sits over the same strip. The bottom band's payoff line has now
          gone too, so the footage carries the section on its own and the bands
          are simply the dead space each clip leaves over.
        */}

        {/* CONTENT STACK — vertical flex column. Header / stage / footer split
            the pane height; the stage owns everything between the two. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center px-5 sm:px-6">
          {/* HEADER — eyebrow + headline only. */}
          <div
            className="mx-auto w-full max-w-2xl shrink-0 pt-[12svh] text-center"
            style={{
              opacity: copyReveal,
              transform: `translateY(${(1 - copyReveal) * 24}px)`,
            }}
          >
            <p className="font-display text-[0.72rem] uppercase tracking-[0.02em] text-muted-foreground">
              The Intelligence Layer
            </p>
            <h2 className="mt-3 font-display text-2xl leading-[1.15] font-medium tracking-[-0.03em] text-foreground md:text-3xl lg:text-4xl">
              The AI behind every match.
            </h2>
          </div>

          {/* STAGE — every centred layer lives in ONE grid cell, so the X-video
              mask, the lime sun and the orbit all resolve to the same origin and
              can never double-image or drift. flex-1 gives it all the space left
              between header and footer. */}
          <div
            ref={stageRef}
            className="relative w-full flex-1"
            style={{
              pointerEvents: interactive && orbitReveal > 0.95 ? "auto" : "none",
            }}
          >
            {/* All three layers are absolutely centred on THIS box.

                They used to be grid items sharing one cell. That broke the moment
                the aperture grew to 200vw/200vh: as the largest item it inflated
                the implicit grid track to its own size, the track then began at the
                stage's top-left and ran off the right and bottom, and the aperture's
                centre landed a full viewport down-and-right of the mark.

                Absolute centring takes all three out of track sizing entirely, so
                no layer's dimensions can move any other layer. left/top 50% plus a
                -50% self-translate puts every centre on the same point regardless
                of each element's size. */}

            {/* Orbit — explicit square so the component's internal `w-full`
                resolves against a real width instead of collapsing to zero. */}
            {/* z-40 puts the orbit — and therefore an expanded node's card —
                above the lime mark at z-30. Without it the mark painted over the
                card's text, because it came later in the stack. The planets sit at
                the ring radius so raising them costs nothing visually. */}
            <div className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 h-[470px] w-[470px] sm:h-[560px] sm:w-[560px] lg:h-[620px] lg:w-[620px]">
              <RadialOrbitalTimeline
                timelineData={nodes}
                hideCenter
                revealProgress={orbitReveal}
              />
            </div>

            {/* Solid lime sun — same centre, dead centre of the orbit. */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
              style={{ opacity: solidSun, width: sunSize, height: sunSize }}
            >
              <div
                aria-hidden
                className="absolute -inset-10 rounded-full bg-accent/10 blur-2xl"
                style={{ opacity: solidSun }}
              />
              <div
                aria-hidden
                className="absolute -inset-3 rounded-full bg-accent/20 blur-xl"
                style={{ opacity: solidSun }}
              />
              <img
                src={X_LIME_SVG}
                alt=""
                aria-hidden
                className="relative h-full w-full"
                draggable={false}
              />
            </div>
          </div>

          {/* FOOTER — pull quote. */}
          <div
            className="mx-auto w-full max-w-2xl shrink-0 pb-[8svh] text-center"
            style={{
              opacity: pullQuote,
              transform: `translateY(${(1 - pullQuote) * 16}px)`,
            }}
          >
            <p className="mx-auto font-display text-base leading-snug font-medium tracking-[-0.02em] text-accent md:text-lg">
              You decide the deal. The AI makes sure the right one reaches you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
