import { useEffect } from "react";
import Lenis from "lenis";

/*
 * Inertial scrolling.
 *
 * Lenis intercepts wheel input and drives the REAL window scroll position on a
 * rAF loop, easing each delta out rather than applying it whole. The page picks
 * up speed, then settles as if damped — heavy to push, smooth to watch.
 *
 * Driving the real scroll position is the entire reason this library and not a
 * transform-based one. Locomotive-style scrollers fake it by translating a
 * wrapper and leaving window.scrollY at 0, which would silently break every
 * scroll-linked thing on this site: the hero's three beats, the orbit's five
 * phases, the bento settle, the map reveal, the nav's tone sampling. All of
 * them measure with getBoundingClientRect against a genuinely scrolled page,
 * and `position: sticky` needs a real scrollport to stick to.
 */

/** Roughly how long a flick takes to come to rest, in seconds. */
const DURATION = 0.9;

/*
 * Exponential ease-out — Lenis's own default curve.
 *
 * This is what reads as "spring": the delta is applied hardest at the start and
 * decays towards zero, so the page leaves your finger quickly and then eases
 * into place instead of stopping dead.
 */
const easing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

/**
 * The live instance, or null when smoothing is off (reduced motion, or before
 * mount). `scrollToSection` reads this so nav links hand their jump to Lenis
 * rather than fighting it with a competing native animation.
 */
let lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenis;
}

/**
 * Mount once, at the root. Returns nothing; the instance is module-scoped so
 * anything that needs to drive a scroll can reach it via `getLenis()`.
 */
export function useSmoothScroll() {
  useEffect(() => {
    // Honour the OS setting: someone who has asked for less motion should not
    // be given a page that keeps moving after they stop scrolling.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const instance = new Lenis({
      duration: DURATION,
      easing,
      smoothWheel: true,
      /*
       * Touch keeps the platform's own momentum. Phones already scroll
       * inertially, in the compositor, off the main thread — replacing that
       * with a JS rAF loop reliably feels laggy and sticky against the finger,
       * iOS Safari worst of all.
       */
      syncTouch: false,
    });
    lenis = instance;

    let raf = 0;
    const frame = (time: number) => {
      instance.raf(time);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      lenis = null;
    };
  }, []);
}
