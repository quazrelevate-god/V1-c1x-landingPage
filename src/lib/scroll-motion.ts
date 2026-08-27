import { useSyncExternalStore } from "react";

/**
 * One shared engine for every scroll-driven effect on the page.
 *
 * Before this, each parallax layer, glow and progress bar kept its own scroll
 * listener that measured the element and pushed a React state update every
 * frame — so a single scroll gesture forced dozens of layout reads and dozens
 * of re-renders per frame, which is what made scrolling stutter. They now share
 * one listener, one rAF and a single batched read-then-write pass that writes
 * straight to the DOM (through a `--py` custom property), so React never
 * re-renders on scroll at all.
 *
 * It also watches its own frame rate. Smooth scroll effects only earn their cost
 * on a display that can actually hold ~60fps; on anything slower they read as a
 * drag rather than motion. So the engine measures the real frame cadence — once
 * at startup, and again under load while the page is being scrolled — and the
 * moment it can't keep up it switches every effect off and lets the page sit
 * static. A 60Hz screen animates; a struggling one stops trying.
 */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// A frame slower than this (~50fps) counts against the motion budget. Kept
// comfortably below the 16.7ms of a 60Hz screen so ordinary display jitter —
// which lands a 60Hz panel at a wobbly 58-60fps — is never mistaken for a slow
// device. Only genuine frame drops cross it.
const SLOW_FRAME_MS = 20;
// How many sustained slow frames (~0.4s) tip the page out of motion. A streak,
// not a single spike, so one hitched frame from a background tab or a GC pause
// doesn't kill the animation for the whole session.
const SLOW_FRAME_LIMIT = 24;
// Keep ticking this long after the last scroll, so a burst is measured across
// contiguous frames — and momentum stays smooth — before the loop idles out.
const IDLE_OUT_MS = 140;

export type ScrollEffect = {
  /** Read layout / compute the target. Must not write to the DOM. */
  read: () => void;
  /** Write to the DOM. Must not read layout. */
  write: () => void;
  /** Restore the neutral, unscrolled state when motion is switched off. */
  reset: () => void;
};

let initialized = false;
let reducedMotion = false;
// Latches false the first time the device proves it can't hold the frame rate;
// never flips back within a session, so the page can't flap in and out of
// motion on a borderline device.
let capable = true;
let motionEnabled = true;

const effects = new Set<ScrollEffect>();
const motionListeners = new Set<() => void>();

let rafId = 0;
let lastFrameTs = 0;
let lastScrollTs = 0;
let slowStreak = 0;

function recomputeMotion() {
  const next = capable && !reducedMotion;
  if (next === motionEnabled) return;
  motionEnabled = next;
  if (!motionEnabled) {
    stopLoop();
    effects.forEach((effect) => effect.reset());
  } else {
    scheduleTick();
  }
  motionListeners.forEach((listener) => listener());
}

function assessFrame(dt: number) {
  // Frame timing means nothing while the page is off screen: browsers throttle
  // rAF to about once a second in a background tab, and stop it altogether in a
  // hidden one. Judging a device on those frames condemns a perfectly capable
  // machine — anyone who opens the site in a background tab, or whose browser
  // restores it on startup — to the static page for the whole session.
  if (document.hidden) return;
  // Only contiguous frames say anything about sustained frame rate; a long gap
  // is a pause between scrolls, not a dropped frame.
  if (dt <= 0 || dt > 100) return;
  if (dt > SLOW_FRAME_MS) {
    slowStreak += 1;
    if (slowStreak >= SLOW_FRAME_LIMIT) {
      capable = false;
      recomputeMotion();
    }
  } else if (slowStreak > 0) {
    slowStreak -= 1;
  }
}

function tick(ts: number) {
  rafId = 0;
  const dt = lastFrameTs ? ts - lastFrameTs : 0;
  lastFrameTs = ts;
  assessFrame(dt);
  if (!motionEnabled) return;
  effects.forEach((effect) => effect.read());
  effects.forEach((effect) => effect.write());
  if (ts - lastScrollTs < IDLE_OUT_MS) {
    rafId = requestAnimationFrame(tick);
  }
}

function scheduleTick() {
  if (!motionEnabled || rafId) return;
  rafId = requestAnimationFrame(tick);
}

function stopLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
}

function onScroll() {
  lastScrollTs = performance.now();
  scheduleTick();
}

/** Runs `fn` the next time the page is actually on screen. */
function whenVisible(fn: () => void) {
  const onChange = () => {
    if (document.hidden) return;
    document.removeEventListener("visibilitychange", onChange);
    fn();
  };
  document.addEventListener("visibilitychange", onChange);
}

function probeIdleFrameRate() {
  // A quick idle sample catches a low-refresh or throttled environment before a
  // single effect has animated, so a slow device can start static rather than
  // proving it's slow the hard way, mid-scroll.
  //
  // Only ever sampled while the page is on screen, and abandoned if it goes away
  // mid-sample: a tab opened in the background paints at about 1fps, which would
  // otherwise read as a device far too slow to animate and latch the whole
  // session static before the visitor had even looked at it.
  if (document.hidden) {
    whenVisible(probeIdleFrameRate);
    return;
  }
  let frames = 0;
  let acc = 0;
  let last = 0;
  const step = (ts: number) => {
    if (document.hidden) {
      // Throw the partial sample away and start over once we're back on screen.
      whenVisible(probeIdleFrameRate);
      return;
    }
    if (last) {
      acc += ts - last;
      frames += 1;
    }
    last = ts;
    if (frames < 16) {
      requestAnimationFrame(step);
      return;
    }
    if (acc / frames > SLOW_FRAME_MS) {
      capable = false;
      recomputeMotion();
    }
  };
  requestAnimationFrame(step);
}

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const mq = window.matchMedia(REDUCED_MOTION);
  reducedMotion = mq.matches;
  motionEnabled = capable && !reducedMotion;
  mq.addEventListener("change", (event) => {
    reducedMotion = event.matches;
    recomputeMotion();
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  if (motionEnabled) probeIdleFrameRate();
}

/**
 * Register a scroll-driven effect. Returns an unsubscribe. When motion is off
 * the effect is placed once in its neutral state and never ticked.
 */
export function registerScrollEffect(effect: ScrollEffect): () => void {
  init();
  effects.add(effect);
  if (motionEnabled) {
    scheduleTick();
  } else {
    effect.reset();
  }
  return () => {
    effects.delete(effect);
  };
}

/**
 * Feed a frame delta from an effect that runs its own rAF (the hero's video
 * scrub), so its jank counts toward the same motion budget and can switch the
 * page static just like the shared loop would.
 */
export function reportFrameDelta(dt: number) {
  if (!motionEnabled) return;
  assessFrame(dt);
}

export function getMotionEnabled() {
  return motionEnabled;
}

export function subscribeMotion(listener: () => void) {
  init();
  motionListeners.add(listener);
  return () => {
    motionListeners.delete(listener);
  };
}

/**
 * React binding for the motion switch. SSR and the first client render both see
 * `true` (the markup is authored for the animated case), then the engine flips
 * it to `false` on a reduced-motion preference or a slow device.
 */
export function useMotionEnabled(): boolean {
  return useSyncExternalStore(subscribeMotion, getMotionEnabled, () => true);
}
