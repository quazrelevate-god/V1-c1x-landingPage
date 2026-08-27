import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  // Unique to this page load. Used only by getScrollRestorationKey below to opt
  // the landing route out of scroll restoration — a client-only concern, so the
  // value never reaches SSR output.
  const bootId = `boot-${Math.random().toString(36).slice(2)}`;

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // The landing route must always open at the top so the hero's aperture
    // intro plays on every load — reloading part-way down should rewind to the
    // logo, not drop you back mid-page. Giving "/" a key that is unique to each
    // page load means a reload never matches a saved scroll position, so
    // TanStack scrolls it to the top. Every other route keeps the default,
    // restoring on reload and back/forward.
    getScrollRestorationKey: (location) =>
      location.pathname === "/"
        ? bootId
        : ((location.state as { __TSR_key?: string }).__TSR_key ?? location.href),
    defaultPreloadStaleTime: 0,
  });

  return router;
};
