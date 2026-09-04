import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { MouseEvent } from "react";

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
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: smooth ? "smooth" : "instant",
  });
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
