import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { MouseEvent } from "react";

import { getLenis } from "./smooth-scroll";

/*
 * Scrolling to a section of the landing page.
 *
 * Left to the browser, `href="/#faq"` is unreliable here for two separate
 * reasons, and both of them bite:
 *
 *   - On `/` the fragment lands the section's top edge at the viewport top,
 *     underneath the floating nav. `#who-its-for` carries 40px of top padding
 *     against an 84px header, so its heading disappears behind the mark.
 *   - From another route it forces a whole document reload, and the browser
 *     resolves the anchor on first paint — before the hero video, the section
 *     artwork and the display face have loaded. Every one of those changes the
 *     height of the page above the target, so the jump lands short.
 *
 * `scrollToSection` fixes the first; `useSectionLink` and the deep-link settle
 * effect in Nav fix the second.
 */

/**
 * Put a section's top edge just below the floating nav.
 *
 * `behavior: "instant"` is deliberate rather than `"auto"`: `scroll-behavior:
 * smooth` is set on `html`, and `"auto"` inherits it, so a correction pass would
 * animate and the next one would interrupt it mid-flight.
 *
 * @returns false when no element carries that id, so callers can fall through.
 */
export function scrollToSection(id: string, smooth: boolean): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const header = document.querySelector("header");
  const offset = header ? header.getBoundingClientRect().height : 0;
  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);

  /*
   * Hand the jump to Lenis when it is running. Calling window.scrollTo instead
   * would start a second animation over the top of Lenis's rAF loop, and the
   * two would trade the scroll position back and forth for the length of the
   * journey — visible as a stutter the whole way down.
   *
   * `immediate` covers the settle passes, which must land in one frame so the
   * next correction is not interrupting an animation still in flight.
   */
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(top, smooth ? {} : { immediate: true });
    return true;
  }

  // No Lenis: reduced motion, or before mount. Fall back to the native path.
  window.scrollTo({ top, behavior: smooth ? "smooth" : "instant" });
  return true;
}

/**
 * Click handler for an anchor pointing at a section of the landing page.
 *
 * These stay real anchors with real hrefs — hover preview, open-in-new-tab and
 * copy-link all keep working, and modified clicks are handed back to the
 * browser untouched. Only the plain left click is taken over.
 */
export function useSectionLink() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (e: MouseEvent, hash: string, onNavigate?: () => void) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate?.();

    if (pathname !== "/") {
      // Client-side hop to the landing page; the settle effect in Nav does the
      // scroll once the route has mounted and the media has stopped resizing it.
      void navigate({ to: "/", hash });
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (scrollToSection(hash, !reduced)) {
      // Keep the URL shareable without letting the browser re-jump to it.
      window.history.replaceState(null, "", `#${hash}`);
    }
  };
}
