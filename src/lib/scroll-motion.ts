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
 * There is deliberately no frame-rate policing here. An earlier version measured
 * the real frame cadence and switched every effect off on anything that couldn't
 * hold ~60fps. It misfired badly: the sample lands moments after hydration,
 * alongside the video decoding and the world map turning 12k points into half a
 * megabyte of SVG path, which is the busiest the page ever gets. Ordinary phones
 * were judged incapable, latched into the static layout for the rest of the
 * session, and so never scrubbed the hero at all — the animation was withheld
 * from exactly the devices it was supposed to be tuned for. Every device now
 * animates; the only thing that turns motion off is the visitor asking for it.
 */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// Keep ticking this long after the last scroll, so momentum stays smooth before
// the loop idles out.
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
let motionEnabled = true;

const effects = new Set<ScrollEffect>();
const motionListeners = new Set<() => void>();

let rafId = 0;
let lastScrollTs = 0;

function recomputeMotion() {
  const next = !reducedMotion;
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

function tick(ts: number) {
  rafId = 0;
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

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const mq = window.matchMedia(REDUCED_MOTION);
  reducedMotion = mq.matches;
  motionEnabled = !reducedMotion;
  mq.addEventListener("change", (event) => {
    reducedMotion = event.matches;
    recomputeMotion();
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
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
 * `true` (the markup is authored for the animated case); it only ever flips to
 * `false` for a visitor whose system asks for reduced motion.
 */
export function useMotionEnabled(): boolean {
  return useSyncExternalStore(subscribeMotion, getMotionEnabled, () => true);
}
