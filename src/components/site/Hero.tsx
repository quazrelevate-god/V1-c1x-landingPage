import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MEDIA_BASE, videoSrc } from "@/lib/media";
// hero-desktop.mp4's own opening frame. The scrub sits at t=0 until you move, so
// the poster has to be that same frame or the hero visibly jumps once the 7.4 MB
// clip finishes loading.
import heroOpenPoster from "@/assets/hero-open-poster.jpg";
import heroDesktopVideo from "@/assets/hero-desktop.mp4";
// Phones scrub a purpose-built 4:5 portrait cut (720x900, 1.5 MB) instead of the
// 1920x1080 master (7.4 MB). The crop is baked into the encode and keyframes sit
// every 5 frames so a seek never has to decode far — the two things that made
// scrubbing the master on a phone stutter. It is also trimmed to open on the
// ship, which the aperture depends on; see the note above PORTRAIT_BAND.
import heroPortraitVideo from "@/assets/hero-mobile.mp4";
import heroPortraitPoster from "@/assets/hero-mobile-poster.jpg";
import { APERTURE_END, PHONE_MQ } from "@/lib/hero-timing";
import { HeroAperture } from "./HeroAperture";
import { HeroLoader } from "./HeroLoader";

/*
 * How long the loading gate will wait before opening regardless.
 *
 * A gate that only opens on success is worse than the problem it solves: a
 * failed decode, a dead connection or a browser that simply declines to preload
 * would leave the visitor on a black screen with a bar that never fills. This is
 * the ceiling, not the expectation — a cached load clears it in milliseconds.
 *
 * Generous, because what it is waiting for is the whole clip rather than merely
 * a playable prefix: 1.5 MB over a weak mobile connection can genuinely take ten
 * seconds, and opening early lands the visitor back on the stuck first frame
 * this gate exists to prevent. Serving the clip from an origin that honours
 * range requests removes the wait altogether — see docs/cdn-setup.md.
 */
const GATE_TIMEOUT_MS = 20000;

/*
 * Wait this long before showing the gate at all.
 *
 * Repeat visits serve the clip from cache and are ready almost immediately;
 * without this the loader would appear and vanish in the same breath, which
 * reads as a flicker rather than as loading.
 */
const GATE_GRACE_MS = 220;

/**
 * Height of the portrait band on phones.
 *
 * 125vw is the 4:5 cut's own aspect, so wherever it wins the clip is shown whole
 * with no second crop — which is every iPhone from the 13 mini up, including the
 * Pro Max sizes.
 *
 * The 58svh ceiling only bites on short viewports (iPhone SE, older Androids),
 * and it has to exist: the copy under the band lives inside a sticky,
 * overflow-hidden pane, so anything pushed past the fold there can never be
 * scrolled to — it is simply lost, CTA included. Where the ceiling does bite the
 * copy tightens too (see the max-height rules in HeroCopy).
 */
const PORTRAIT_BAND = "min(125vw, 58svh)";

const headline = "Trade direct. Settle certain. No unverified hands in between.";
const subhead =
  "Corridor One X connects verified producers, exporters, and importers directly. AI matching, autonomous settlement, and escrow-secured payment. The deal you agree to is the deal that closes.";

const clamp = (v: number) => Math.min(Math.max(v, 0), 1);

/* The ship completes its run well before the section ends… */
const SCRUB_END = 0.72;
/* …then the foreground dissolves… */
const OUTRO_AT = 0.7;
const OUTRO_LEN = 0.14;
/* …and the footage sinks to a dim backdrop for the Problem section. */
const DIM_AT = 0.76;
const DIM_LEN = 0.2;

/*
 * Phones open on the vector aperture instead of the clip's own fly-through.
 *
 * The fly-through is over by t≈0.5s of a 7.17s clip — 7% of the timeline, which
 * a linear scroll mapping turns into 7% of the scroll: about 86px, when an
 * ordinary swipe travels 400-800px. The whole moment landed between two
 * rendered frames, which is why it read as a skip rather than an animation.
 * Making the section taller can't fix that; 7% of a bigger number is still 7%,
 * and the fly-through would need a hero roughly ten screens tall to get a
 * comfortable swipe.
 *
 * So the reveal is drawn rather than scrubbed. It gets APERTURE_END of the
 * section to itself — ~440px, a full unhurried swipe — and the ship is what
 * shows through the growing window.
 *
 * The portrait cut is trimmed to begin after the fly-through rather than being
 * seeked past it. Seeking past it left the clip's first frame — and so its
 * poster — on the logo, and that poster is exactly what fills the aperture's
 * window for as long as the clip is still arriving. The opening therefore showed
 * the vector mark growing with a second, softer copy of the same mark visible
 * through it, which is the last thing this reveal wants. Cutting the frames away
 * makes the poster the ship, so the window shows the right thing from the first
 * paint, before a single byte of video has landed.
 */

function HeroCta() {
  return (
    <a
      href="/book-a-demo"
      // transparent border so this sits at exactly the same height as the ghost
      // button beside it, which gains 2px from its own border
      className="inline-block rounded-md border border-transparent bg-accent px-6 py-3.5 text-center font-display text-sm font-medium tracking-tight text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-hover active:bg-accent-pressed"
    >
      Book a Demo
    </a>
  );
}

function HeroSecondaryCta() {
  return (
    <a
      href="/#how-it-works"
      className="inline-block rounded-md border border-border px-6 py-3.5 text-center font-display text-sm font-medium tracking-tight text-foreground transition-colors duration-300 hover:border-accent/50 hover:text-accent"
    >
      See How It Works
    </a>
  );
}

function Overlay() {
  return (
    <>
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
    </>
  );
}

// Anchored to the stacked containers on deck (cargo runs diagonally
// from upper-left to lower-right of the ship as the wireframe reveals).
const CALLOUTS = [
  { label: "Verified", at: 0.3, x: "56%", y: "17%" },
  { label: "Matched", at: 0.44, x: "64%", y: "32%" },
  { label: "Secured", at: 0.58, x: "72%", y: "49%" },
];

/*
 * The portrait cut frames the ship on the diagonal — bow high on the left, stern
 * low on the right — which leaves the lower-left corner as open water. These
 * anchors put each dot on the hull and let the label run back into that empty
 * water, so the labels balance the frame instead of stacking up in the corner
 * the ship already occupies. Landscape anchors can't be reused: they're placed
 * against the full 16:9 frame, and in this crop they'd sit off the right edge.
 */
// y values track the hull's centreline through the crop, sampled off the encoded
// frame (x% -> hull mid y%: 32->18, 50->46, 68->47, 74->51), so each dot lands on
// the deck rather than in the water beside it.
//
// `at` is scroll, but what each label has to agree with is the wireframe
// conversion in the footage — so these are the landscape timings carried across
// rather than reinvented. Those fire at video t≈2.97 / 4.35 / 5.73; run those
// back through the phone's mapping (the clip is trimmed to the ship and spans
// APERTURE_END..SCRUB_END) and they land here. Retiming the scroll without
// moving these would have drifted every label off the reveal it names.
//
// x/y are the dot, and the dot has to sit on deck while the label runs back into
// open water — so both are placed against the hull's left edge, sampled off the
// frame these appear over (t≈5.7). That edge walks right as it descends:
//
//   y%    20    24    28    32    36    40    44
//   hull  22.5  26.5  30.5  32.5  36.5  40.0  44.5
//
// Each dot sits ~8% inside it, which leaves every label ending ~16px clear of
// the hull. The previous anchors put Secured's label well inside the ship and
// Matched's right against it, because they were placed against a scan that
// mistook bright water for hull.
const PORTRAIT_CALLOUTS = [
  { label: "Verified", at: 0.4, x: "32.5%", y: "22%" },
  { label: "Matched", at: 0.5, x: "41.5%", y: "33%" },
  { label: "Secured", at: 0.61, x: "52.5%", y: "44%" },
];

function WireCallout({
  label,
  x,
  y,
  progress,
  /** "right" runs the label right of the dot; "left" mirrors it back to the west. */
  side = "right",
}: {
  label: string;
  x: string;
  y: string;
  progress: number;
  side?: "left" | "right";
}) {
  const o = clamp(progress);
  const mirrored = side === "left";
  return (
    <div
      className={`pointer-events-none absolute flex items-center gap-0 transition-opacity duration-500 ${
        mirrored ? "flex-row-reverse" : ""
      }`}
      style={{
        left: x,
        top: y,
        opacity: o,
        // Mirrored callouts grow leftwards from the dot, so the box has to hang
        // off the left of its anchor rather than the right.
        transform: `translate(${mirrored ? "calc(-100% + 4px)" : "-4px"}, -50%)`,
        // Carries the dot, the leader and the label in one pass, so the whole
        // callout keeps its edge over bright water, foam or a lit container.
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.9))",
      }}
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
        <span className="absolute h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="deal-callout-pulse absolute h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
      {/* Shorter leader on a narrow frame so the label still lands inside it. */}
      <span
        // Mirrored leaders run a little longer so the label clears the hull —
        // the ship widens towards the stern, and the lowest callout would
        // otherwise sit half on the deck instead of in open water.
        // 26px, not 36: the mirrored label hangs off the far side of this, and
        // on a 360px-wide Galaxy the topmost one ran off the left edge. Every
        // pixel here is a pixel the label loses.
        className={`h-[1.5px] bg-accent transition-transform duration-700 sm:w-[44px] ${
          mirrored ? "w-[26px] origin-right" : "w-[24px] origin-left"
        }`}
        style={{ transform: `scaleX(${o})` }}
      />
      <span
        // Heavier and wider than the landscape label. These have to be legible
        // at arm's length over moving footage and catch the eye mid-scroll, and
        // at 10px regular they read as a caption rather than a claim.
        className={`font-display text-[0.74rem] font-semibold tracking-[0.07em] whitespace-nowrap text-accent uppercase transition-transform duration-500 sm:text-[0.68rem] sm:font-medium sm:tracking-[0.02em] ${
          mirrored ? "mr-2" : "ml-2"
        }`}
        style={{ transform: `translateX(${(1 - o) * (mirrored ? -8 : 8)}px)` }}
      >
        {label}
      </span>
    </div>
  );
}

// Blurred fade-in: each hero element eases from blurred/soft-offset to crisp
// as its reveal value goes 0 -> 1.
const revealStyle = (o: number): CSSProperties => ({
  opacity: o,
  filter: `blur(${(1 - o) * 14}px)`,
  transform: `translateY(${(1 - o) * 22}px)`,
});

function HeroCopy({
  headlineReveal,
  subheadReveal,
  ctaReveal,
}: {
  headlineReveal: number;
  subheadReveal: number;
  ctaReveal: number;
}) {
  return (
    // On phones the copy sits over the bottom of the portrait band, where the
    // gradient has already taken the footage down to near-black — so the frame
    // reads as one image running into the text rather than a video with a hard
    // edge and a caption under it. Left aligned, like the rest of the page.
    // From sm up it returns to centred over the full-bleed clip.
    <div className="relative mx-auto flex h-full w-full max-w-6xl items-start justify-center px-5 pt-[calc(4rem+var(--hero-band)-5.5rem)] text-left sm:items-center sm:px-6 sm:pt-0 sm:text-center">
      <div className="w-full max-w-2xl">
        {/*
          The max-height rules are for short phones (iPhone SE and older
          Androids), where the band's svh ceiling has already given up height and
          the copy still has to clear the fold inside an overflow-hidden pane.
          Taller iPhones never match these and keep the full-size type.
        */}
        <h1
          className="font-display text-[1.6rem] leading-[1.1] font-medium tracking-[-0.035em] text-foreground transition-[opacity,filter,transform] duration-700 ease-out [@media(max-height:700px)]:text-[1.4rem] sm:text-[2.4rem] lg:text-[2.9rem]"
          style={revealStyle(headlineReveal)}
        >
          {headline}
        </h1>
        <p
          className="mt-5 max-w-md font-sans text-[0.88rem] leading-relaxed text-secondary-foreground transition-[opacity,filter,transform] duration-700 ease-out [@media(max-height:700px)]:mt-3 [@media(max-height:700px)]:text-[0.82rem] sm:mx-auto sm:mt-6 sm:text-[0.95rem]"
          style={revealStyle(subheadReveal)}
        >
          {subhead}
        </p>
        <div
          className="mt-8 flex flex-wrap items-center gap-3 transition-[opacity,filter,transform] duration-700 ease-out [@media(max-height:700px)]:mt-5 sm:mt-10 sm:justify-center"
          style={revealStyle(ctaReveal)}
        >
          <HeroCta />
          <HeroSecondaryCta />
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  // The pinned pane. Measured instead of the window so the scrub maths can't be
  // moved by mobile browser chrome; see `total` in the scroll effect.
  const pinnedRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // The footage's own box — what the aperture centres its opening on.
  const bandRef = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const current = useRef(0);
  // Restarts the eased seek loop when a scroll moves the target; the loop parks
  // itself once the clip has caught up, so it isn't a rAF running forever.
  const seekKick = useRef<(() => void) | null>(null);
  const [p, setP] = useState(0);
  /*
   * There is one hero, and it runs everywhere.
   *
   * This used to swap in a separate static layout whenever the shared motion
   * engine reported reduced motion. That layout was written for desktop and
   * never given a phone version, so a phone that tripped it got the 16:9
   * landscape master autoplaying on a loop in a stacked layout — no aperture, no
   * deck callouts, wrong crop. Worse, it arrived *after* first paint, so the
   * reveal would start and then be replaced mid-animation.
   *
   * The fix is not a better second hero, it is not having one. Everything in
   * this section except the moving picture is SVG and DOM — the aperture, the
   * callouts, the copy — and none of it needs a decoder. So the poster is the
   * floor the hero always stands on and the footage is an enhancement painted
   * over it (see the band's backgroundImage below). A device that cannot decode
   * video gets the same hero, holding still, rather than a different one.
   */
  const [phone, setPhone] = useState(false);
  // Set when the host can't serve byte ranges and we've had to pull the clip
  // down whole; see the effect below.
  const [blobSrc, setBlobSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  /** Gate state: the footage is there (or we gave up waiting for it). */
  const [gateOpen, setGateOpen] = useState(false);
  /** Only true once the grace period has passed without the clip being ready. */
  const [gateVisible, setGateVisible] = useState(false);
  const [bufferedPct, setBufferedPct] = useState(0);

  useEffect(() => {
    // Held back until hydration so the poster paints before the clip is wired
    // up. Every device scrubs from here on: the ship reveal is the whole point
    // of the section and only exists in the scrub clip, so withholding it left
    // the visitor on a different page rather than a calmer one.
    setReady(true);
  }, []);

  // Phones scrub the portrait cut; from sm up it's the landscape master.
  useEffect(() => {
    const mq = window.matchMedia(PHONE_MQ);
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /*
   * Hold the hero closed until its footage has arrived.
   *
   * Everything in this section is driven by scroll, so without this the reveal
   * opens onto an empty window and the callouts start naming a ship that has not
   * loaded — which is what made the opening look broken rather than slow.
   *
   * This only ever matters for a source that can't stream: a same-origin
   * fallback host answering a Range with the whole file and a 200. When the
   * clips are served from the CDN (MEDIA_BASE set) they stream over real byte
   * ranges and are watchable long before they're complete, so — on phones as on
   * desktop — gating would be a delay with nothing to show for it. The landscape
   * master is never gated either way. So the gate engages only for a phone on
   * the bundled fallback with no CDN, which is local dev, not production.
   */
  useEffect(() => {
    if (!ready) return;
    if (!phone || MEDIA_BASE) {
      setGateOpen(true);
      return;
    }

    const v = videoRef.current;
    if (!v) return;

    let done = false;
    const open = () => {
      if (done) return;
      done = true;
      setGateOpen(true);
    };

    /*
     * The gate waits for the clip to be buffered end to end, not merely
     * playable.
     *
     * canplaythrough and readyState 4 both mean "enough buffered to play
     * forwards at normal speed", which is not what this hero does — it seeks.
     * A seek needs the target bytes either already buffered or fetchable with a
     * range request, and the origin serving this clip answers a Range with the
     * whole file and a 200. So on a first visit the browser could not fetch the
     * bytes a seek landed on, every currentTime write was dropped, and the
     * footage sat on its first frame while the callouts named a ship that never
     * moved. On a second visit the file came from cache already complete and it
     * scrubbed perfectly — which is exactly the shape of this bug.
     *
     * Requiring a single buffered range that spans the whole clip removes the
     * ambiguity: once it holds, every seek the scrub can ask for is local.
     */
    const progress = () => {
      const d = v.duration;
      if (!d || Number.isNaN(d)) return;
      const end = v.buffered.length ? v.buffered.end(v.buffered.length - 1) : 0;
      setBufferedPct(Math.min(end / d, 1));
      // One range, not merely first-start and last-end: buffered [[0,1.5],[4,6]]
      // satisfies both ends while leaving a hole in the middle that a seek can
      // land in, which is the same failure with extra steps.
      const spansWholeClip =
        v.buffered.length === 1 && v.buffered.start(0) <= 0.05 && end >= d - 0.15;
      if (spansWholeClip) open();
    };

    progress();
    v.addEventListener("progress", progress);
    v.addEventListener("loadeddata", progress);
    v.addEventListener("canplaythrough", progress);
    // Never trap the visitor: a decode failure or a stalled connection opens the
    // gate on the same terms as success.
    v.addEventListener("error", open);
    const poll = window.setInterval(progress, 250);
    const bail = window.setTimeout(open, GATE_TIMEOUT_MS);
    // `done` guards this as well as the opener: a clip that lands just after the
    // grace period would otherwise raise the gate and drop it in the same beat.
    const grace = window.setTimeout(() => {
      if (!done) setGateVisible(true);
    }, GATE_GRACE_MS);

    return () => {
      v.removeEventListener("canplaythrough", open);
      v.removeEventListener("progress", progress);
      v.removeEventListener("loadeddata", progress);
      v.removeEventListener("error", open);
      clearInterval(poll);
      clearTimeout(bail);
      clearTimeout(grace);
    };
    // heroSrc deliberately absent: it is declared below this effect, and `phone`
    // already covers every case in which it changes.
  }, [ready, phone]);

  // Drop the gate from the tree once it has faded, rather than leaving a
  // full-screen fixed layer parked over the page for the rest of the session.
  useEffect(() => {
    if (!gateVisible || !gateOpen) return;
    const id = window.setTimeout(() => setGateVisible(false), 600);
    return () => clearTimeout(id);
  }, [gateVisible, gateOpen]);

  /*
   * Freeze the page behind the gate.
   *
   * Scrolling while it is up would advance the reveal invisibly, so the visitor
   * would release the gate already part-way through the intro they were waiting
   * to see. Position-fixed rather than overflow-hidden because iOS Safari
   * ignores the latter on the body.
   */
  useEffect(() => {
    const locked = gateVisible && !gateOpen;
    if (!locked) return;
    const { style } = document.body;
    const prev = { position: style.position, top: style.top, width: style.width };
    window.scrollTo(0, 0);
    style.position = "fixed";
    style.top = "0";
    style.width = "100%";
    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
    };
  }, [gateVisible, gateOpen]);

  // One source of truth for which cut is in play: the <video>, the range probe,
  // and the poster all read from here, so they can't drift onto different clips.
  // Each resolves to the CDN when VITE_MEDIA_BASE is set, else the bundled copy.
  const heroSrc = phone
    ? videoSrc("hero-mobile.mp4", heroPortraitVideo)
    : videoSrc("hero-desktop.mp4", heroDesktopVideo);

  // scroll -> progress
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el) return;
      /*
       * Measure the pinned pane, never the window.
       *
       * The section is 300svh and the pane inside it is 100svh, so both are
       * pegged to the small viewport and move together — the ratio between them
       * is the same whether or not the browser's chrome is showing. Subtracting
       * `window.innerHeight` instead mixed two different units: the section
       * stayed put while the window grew by 60-100px the moment the URL bar
       * collapsed, so the entire scroll-to-timeline mapping shifted underneath
       * the visitor and the clip jumped about half a second — repeatedly, since
       * the bar hides and returns as you scroll. That is the stutter, and it was
       * worst on Android, where the bar is tallest and toggles most eagerly.
       */
      const pinned = pinnedRef.current;
      const total = el.offsetHeight - (pinned ? pinned.offsetHeight : window.innerHeight);
      const v = clamp(-el.getBoundingClientRect().top / Math.max(total, 1));
      target.current = v;
      setP(v);
      // Wake the eased seek loop so the clip follows the new target.
      seekKick.current?.();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /*
   * Scrubbing needs a seekable source. A static host that answers `Range` with
   * the whole file and a 200 (rather than 206) leaves the browser reporting
   * `seekable` as empty, so every `currentTime` write is dropped and the hero
   * freezes on its opening frame — which is what production did. Probe for
   * range support once, and if it's missing fetch the clip whole and scrub a
   * blob URL instead, which is always seekable.
   *
   * This has to pull the same cut the <video> is showing. Railway is one of the
   * hosts that ignores ranges, so this path is live in production: fetching the
   * landscape master here would hand a phone the 7.4 MB 16:9 clip through the
   * back door, undoing both the portrait crop and the weight saving.
   */
  useEffect(() => {
    if (!ready) return;
    // A cross-origin CDN is neither probeable nor in need of probing. Both
    // fetches here would be blocked without a CORS policy on the bucket, so the
    // fallback could never build its blob anyway — and it has nothing to fix:
    // the clip is on a CDN precisely because that CDN serves real 206s. The
    // <video> element fetches its own ranges without CORS, so it just works.
    if (/^https?:\/\//i.test(heroSrc) && !heroSrc.startsWith(window.location.origin)) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    // Drop any blob made for the other cut, so a viewport that crosses the
    // breakpoint can't keep scrubbing the wrong footage.
    setBlobSrc(null);

    (async () => {
      try {
        const probe = await fetch(heroSrc, { headers: { Range: "bytes=0-1" } });
        if (cancelled || probe.status === 206) return;
        const whole = await fetch(heroSrc);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(await whole.blob());
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setBlobSrc(objectUrl);
      } catch {
        /* offline or blocked — keep the direct src and its poster */
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [ready, heroSrc]);

  // eased seek loop — the video timeline maps directly to scroll across the
  // whole hero, so the clip scrubs from its opening frame through to the end.
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      raf = 0;
      const dt = last ? ts - last : 16.67;
      last = ts;
      const v = videoRef.current;
      const dur = v?.duration;
      if (v && dur && !Number.isNaN(dur)) {
        // Frame-rate-independent easing: the clip takes the same wall-clock time
        // to catch the scroll on a 60Hz and a 144Hz display, rather than easing
        // proportionally faster the more frames a screen happens to paint.
        const k = 1 - Math.pow(1 - 0.12, dt / 16.67);
        current.current += (target.current - current.current) * k;
        const end = dur - 0.05;
        // On a phone the aperture owns the opening, so the clip holds on its
        // first frame until the window has cleared, then runs its whole length
        // across the remaining scroll. Landscape maps the whole timeline to the
        // whole hero.
        const t = phone
          ? clamp((current.current - APERTURE_END) / (SCRUB_END - APERTURE_END)) * end
          : clamp(current.current / SCRUB_END) * end;
        if (Math.abs(v.currentTime - t) > 1 / 60) {
          try {
            v.currentTime = t;
          } catch {
            /* seek not ready */
          }
        }
      }
      // Idle-stop: the old loop kept a rAF alive for the life of the page,
      // seeking the clip on every frame forever. Now it only spins while the
      // clip is still catching up to the scroll, then parks until the next
      // scroll kicks it back to life.
      if (Math.abs(target.current - current.current) > 0.0005) {
        raf = requestAnimationFrame(tick);
      } else {
        last = 0;
      }
    };
    const kick = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    seekKick.current = kick;
    kick();
    /*
     * The loop parks once the clip has caught up, and only a scroll wakes it —
     * so anything that resets the video out from under a parked loop would
     * otherwise leave the hero stranded on frame 0 until the visitor scrolled
     * again. Both happen in practice: swapping to the blob source reloads the
     * element, and `duration` arriving late means the earliest passes had
     * nothing to seek against. Wake it on each.
     */
    const v = videoRef.current;
    v?.addEventListener("loadedmetadata", kick);
    v?.addEventListener("durationchange", kick);
    return () => {
      seekKick.current = null;
      v?.removeEventListener("loadedmetadata", kick);
      v?.removeEventListener("durationchange", kick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [phone, blobSrc]);

  /*
   * Spin the decoder up so seeks actually paint on iOS.
   *
   * WebKit will not render a seeked frame on a video that has never played —
   * `currentTime` moves, the picture doesn't — so the hero looked frozen on its
   * poster while the scroll scrubbed away underneath. This is every browser on
   * an iPhone, not just Safari: Chrome, Brave and Edge on iOS are all WebKit.
   * Muted and playsInline normally means autoplay is allowed, so start it once
   * and pause on the next tick; the scrub then owns `currentTime` from a warm
   * decoder.
   *
   * "Normally" is why this also listens for a touch. In Low Power Mode iOS
   * refuses unattended playback outright, so the metadata attempt rejects, the
   * decoder stays cold and the hero never moves. But Low Power Mode only blocks
   * playback that nothing asked for — a play() called inside a real input event
   * is still honoured, which is exactly why the browser bothers to draw a play
   * button in that state. Scrolling a phone requires touching it, so the first
   * touch is a gesture we are guaranteed to get, and to get before the visitor
   * can scroll anywhere. Retrying there costs nothing when autoplay was allowed
   * (`primed` short-circuits) and is the whole fix when it wasn't.
   *
   * pointerdown/touchend/click/keydown rather than touchstart: those are the
   * events the HTML spec counts as activation triggers, and WebKit follows it.
   * Capture phase and passive, so nothing here can interfere with the scroll.
   */
  useEffect(() => {
    if (!ready) return;
    const v = videoRef.current;
    if (!v) return;
    let primed = false;
    const gestures = ["pointerdown", "touchend", "click", "keydown"] as const;
    const prime = () => {
      if (primed) return;
      // Nothing to warm up yet; the metadata listener will call back.
      if (v.readyState < 1) return;
      primed = true;
      detachGestures();
      try {
        const started = v.play();
        if (started && typeof started.then === "function") {
          started
            .then(() => v.pause())
            // Refused even with a gesture behind it — some data-saver and
            // privacy modes decline video outright. The hero holds on its
            // poster, which is the same picture the scrub opens on.
            .catch(() => undefined);
        } else {
          v.pause();
        }
      } catch {
        /* as above: the poster is the floor, so this degrades to a still */
      }
    };
    const detachGestures = () => {
      gestures.forEach((type) => window.removeEventListener(type, prime, true));
    };
    prime();
    v.addEventListener("loadedmetadata", prime);
    gestures.forEach((type) =>
      window.addEventListener(type, prime, { capture: true, passive: true }),
    );
    return () => {
      v.removeEventListener("loadedmetadata", prime);
      detachGestures();
    };
  }, [ready, blobSrc, heroSrc]);

  // Staged reveal: the opening logo flythrough owns p 0 -> ~0.06, then the
  // headline, subhead, and CTA each blur-fade in over their own scroll band.
  // Past SCRUB_END the ship has finished its run, so everything in front of it
  // fades away and the footage itself dims to a backdrop — the hero hands over
  // by dissolving rather than sliding off as a sheet.
  const outro = clamp((p - OUTRO_AT) / OUTRO_LEN);
  /*
   * Phones don't dissolve the foreground.
   *
   * The last callout lands at 0.62 and the dissolve began at 0.70 — about 136px
   * of scroll between "Secured" arriving and everything starting to fade, which
   * is not long enough to read it. Rather than push the dissolve later and eat
   * the rest of the section, the copy and callouts now simply hold: they fade in
   * and stay until the sticky pane scrolls away on its own. The footage still
   * dims underneath, which is the hand-over to the Problem section rather than
   * content disappearing.
   */
  const hold = phone ? 1 : 1 - outro;
  // The copy can't start before the aperture has cleared on a phone, or it
  // blur-fades in on top of the cover with the reveal still running behind it.
  const copyAt = phone ? APERTURE_END + 0.02 : 0.08;
  const headlineReveal = clamp((p - copyAt) / 0.08) * hold;
  const subheadReveal = clamp((p - (copyAt + 0.07)) / 0.08) * hold;
  const ctaReveal = clamp((p - (copyAt + 0.14)) / 0.08) * hold;
  const dim = clamp((p - DIM_AT) / DIM_LEN);
  // 0 -> 1 across the aperture's own band; at 1 the cover unmounts itself.
  const apertureProgress = p / APERTURE_END;

  return (
    <>
      {gateVisible ? <HeroLoader progress={bufferedPct} leaving={gateOpen} /> : null}
      {/* svh so the pinned pane doesn't resize when mobile browser chrome hides,
          which would otherwise re-run the scroll maths mid-scrub and jump the
          video. The extra 40svh past the scrub is the hand-over: copy dissolves,
          footage dims. */}
      <section ref={sectionRef} id="top" className="relative h-[300svh]">
        <div
          ref={pinnedRef}
          // Marked so heroProgress() can measure the same pane the scrub does;
          // see the note on `total` in the scroll effect.
          data-hero-pin=""
          className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden bg-background"
          // Published as a variable so the band and the copy that tucks under it
          // are driven by one number and can't drift apart.
          style={
            {
              "--hero-band": PORTRAIT_BAND,
              // The stills the band stands on, published here so the band can
              // pick between them with a media query instead of React state.
              "--hero-still": `url(${heroPortraitPoster})`,
              "--hero-still-wide": `url(${heroOpenPoster})`,
            } as CSSProperties
          }
        >
          {/*
          Phones get a fixed portrait band sized to the 4:5 cut's own aspect, so
          the footage is shown whole rather than cropped a second time by CSS.
          Nothing about this box animates: the previous version drove height, top
          and object-position off scroll progress, which forced a layout and a
          repaint on every frame of the scrub while the decoder was already busy
          seeking. From sm up it's full bleed as before.
        */}
          {/*
            The poster is painted on the band, not handed to the <video>.

            It is the floor this hero stands on: the aperture, the deck callouts
            and the copy are all SVG and DOM and will run on anything, but the
            moving picture needs a decoder, and a decoder is the one thing a
            device can refuse us — Low Power Mode, data saver, a locked-down
            browser. When it does, the callouts have to be naming *something*
            rather than floating over a black rectangle. Backing the band means
            the still is already there, in the right crop, before a byte of video
            is requested, and the footage simply paints over it when it arrives.

            As a background rather than the `poster` attribute because
            background-size honours object-position reliably across WebKit
            versions where poster framing has been inconsistent, and because a
            poster is dropped the moment a frame decodes — leaving nothing
            underneath if the decode later stalls. Same URL either way, so it is
            still one download.
          */}
          {/*
            Height, still and crop are all CSS here, never React state.

            `phone` is false on the server and stays false until hydration, so
            driving these off it meant the markup a phone first painted was the
            desktop one: the 16:9 still, the landscape crop, and — because the
            height only arrived with the inline style and `sm:h-full` needs 640px
            — a band with no height at all. An empty rectangle, for as long as
            hydration took. Expressing it as `h-[var(--hero-band)] sm:h-full`
            says the same thing in a form the browser can honour on the first
            paint, and closes the gap between `max-width: 639px` and `sm`'s
            640px where a fractional viewport width matched neither rule.
          */}
          <div
            ref={bandRef}
            className="absolute inset-x-0 top-16 h-[var(--hero-band)] bg-[image:var(--hero-still)] bg-position-[50%_15%] bg-cover sm:inset-0 sm:top-0 sm:h-full sm:bg-[image:var(--hero-still-wide)] sm:bg-position-[50%_50%]"
            // Once the ship has finished its run the footage sinks to a backdrop
            // for the Problem section rather than sliding away as a sheet. Only
            // filter and opacity animate here — both composite without layout.
            style={{
              filter: `brightness(${1 - dim * 0.74}) saturate(${1 - dim * 0.5})`,
              opacity: 1 - dim * 0.55,
            }}
          >
            <video
              ref={videoRef}
              // object-position matches the band's background-position exactly,
              // so the still and the footage sit on the same crop and nothing
              // shifts when the decoder catches up. When the 58svh ceiling bites
              // on a short viewport the band is shallower than the clip, so
              // object-cover has to drop something: biasing high keeps the bow —
              // which sits ~5% down the frame — and spends the loss on the empty
              // water under the stern.
              className="absolute inset-0 h-full w-full object-cover object-[50%_15%] sm:object-center"
              // Held back until hydration so the band's still paints first and
              // the clip downloads behind it rather than blocking the view.
              {...(ready ? { src: blobSrc ?? heroSrc } : {})}
              muted
              playsInline
              preload={ready ? "auto" : "none"}
            />
            {/* Dissolves the band into the page on phones; no seam from sm up. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 sm:hidden"
              style={{
                background:
                  "linear-gradient(to top, var(--background) 2%, color-mix(in oklab, var(--background) 55%, transparent) 45%, transparent 100%)",
              }}
            />

            {/*
            Anchored to the deck, inside the band so they track the footage. The
            two crops frame the ship differently, so each gets its own anchors —
            and on the portrait cut the labels run left into open water.
          */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ opacity: hold }}
            >
              {phone
                ? null
                : CALLOUTS.map((c) => (
                    <WireCallout
                      key={c.label}
                      label={c.label}
                      x={c.x}
                      y={c.y}
                      progress={clamp((p - c.at) / 0.09)}
                    />
                  ))}
            </div>
          </div>
          <Overlay />

          {/*
          The cover spans the pane; the mark centres on the band.

          Those are two different boxes and it matters. The mark is a window onto
          the footage, so it has to sit over the footage — centred on the pane
          the opening sat below the video entirely. But sizing the cover to the
          band as well clipped the mark along the band's bottom edge, with screen
          still visible below it: the left, right and top edges run off-screen so
          nothing shows there, while the bottom cut is in plain view.

          Drawn as a sibling after Overlay rather than inside the band: the band
          carries a filter and an opacity, both of which open a stacking context,
          so anything within it paints under Overlay's gradients whatever its
          z-index — which left the mark olive instead of lime.

          Phones only for now; landscape keeps the clip's own fly-through, which
          has the width to read at its own pace.
        */}
          {phone && ready ? (
            <div className="pointer-events-none absolute inset-0 z-30">
              <HeroAperture progress={apertureProgress} focusRef={bandRef} />
            </div>
          ) : null}

          {/*
          The phone's callouts ride above Overlay, boxed to the band so their
          percentages still land on the footage.

          Inside the band they sat under Overlay's left-hand gradient, which lays
          roughly 72% of the page background over exactly the strip the labels
          occupy — which is why they read as washed-out olive rather than lime.
          No amount of weight or shadow survives that; they have to be drawn on
          top of it. Landscape is unaffected: its labels sit right of centre
          where that gradient has already fallen away to nothing.
        */}
          {phone ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-16 z-30"
              style={{ height: PORTRAIT_BAND, opacity: hold }}
            >
              {PORTRAIT_CALLOUTS.map((c) => (
                <WireCallout
                  key={c.label}
                  label={c.label}
                  x={c.x}
                  y={c.y}
                  side="left"
                  progress={clamp((p - c.at) / 0.09)}
                />
              ))}
            </div>
          ) : null}

          <div className="relative z-40 h-full">
            <HeroCopy
              headlineReveal={headlineReveal}
              subheadReveal={subheadReveal}
              ctaReveal={ctaReveal}
            />
          </div>

          {/* scroll cue — only at the very top */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-8 z-40 flex flex-col items-center gap-2 transition-opacity duration-300"
            style={{ opacity: 1 - clamp(p / 0.04) }}
          >
            <span className="font-display text-[0.68rem] tracking-[0.02em] text-muted-foreground uppercase">
              Scroll
            </span>
            <span className="relative h-10 w-px bg-border">
              <span className="corridor-particle absolute inset-x-0 top-0 h-3 bg-accent" />
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
