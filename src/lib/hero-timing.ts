/**
 * Hero scroll landmarks, shared by everything that has to agree with the hero.
 *
 * These live outside the Hero component because more than one thing keys off
 * them and they must not drift: the nav has to stay clear of the opening reveal,
 * and the waitlist prompt has to wait until the deck callouts have been read.
 * An earlier version of this hero kept the nav's copy of the intro landmark in
 * Nav.tsx with a comment asking the next person to keep the two in step, and
 * they went out of step.
 *
 * All values are a fraction of the hero section's scrollable range, matching the
 * `p` the Hero computes: 0 at the top of the section, 1 once it has scrolled by.
 */

/** Phones open on the drawn aperture; it owns the scroll up to here. */
export const APERTURE_END = 0.26;

/** Past the last deck callout, so the hero has said its piece. */
export const CALLOUTS_DONE = 0.66;

/** The hero runs its portrait layout below this width. */
export const PHONE_MQ = "(max-width: 639px)";

export const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * The hero's scroll progress right now, or null when the hero isn't on the page
 * (the About and Book a Demo routes render the nav without one).
 */
export function heroProgress(): number | null {
  const hero = document.getElementById("top");
  if (!hero) return null;
  const total = hero.offsetHeight - window.innerHeight;
  return clamp01(-hero.getBoundingClientRect().top / Math.max(total, 1));
}
