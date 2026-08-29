import { createFileRoute } from "@tanstack/react-router";
import { LaunchPage } from "@/components/site/LaunchPage";

/**
 * Permanent preview of the launch page.
 *
 * The domain root serves the same component until LAUNCH_AT passes; this URL
 * serves it always, so the page can still be checked after the handover.
 * Unlisted: nothing links here and it carries noindex.
 */
const title = "Corridor One X — Launching Soon";

export const Route = createFileRoute("/launching")({
  head: () => ({
    meta: [{ title }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: LaunchPage,
});
