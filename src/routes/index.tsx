import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LaunchPage } from "@/components/site/LaunchPage";
import { LAUNCH_AT } from "@/lib/launch";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";

import { Problem } from "@/components/site/Problem";
import { Approach } from "@/components/site/Approach";
import { HowAiWorks } from "@/components/site/HowAiWorks";
import { DealFlow } from "@/components/site/DealFlow";
import { TrustProtection } from "@/components/site/TrustProtection";
import { Logistics } from "@/components/site/Logistics";
import { WhoItsFor } from "@/components/site/WhoItsFor";
import { WhyUs } from "@/components/site/WhyUs";
import { Faq } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Footer } from "@/components/site/Footer";
import { WaitlistPrompt } from "@/components/site/WaitlistPrompt";

const title = "Corridor One X: Verified Commodity Trade Infrastructure";
const description =
  "Corridor One X connects verified producers, exporters, and importers directly. AI matching, autonomous settlement, and escrow-secured payment across the India-Gulf corridor.";

/*
 * The handover.
 *
 * Before LAUNCH_AT this route serves the launch page; after it, the landing
 * page below, unchanged. Nothing has to be redeployed at the cutoff — the
 * branch simply stops being true.
 *
 * The decision is made in the loader, which runs on the server for the initial
 * request. That matters twice over: the server's clock decides, so a visitor
 * whose own clock is wrong cannot be shown the wrong page, and the value the
 * client hydrates against is the one the HTML was rendered from, so there is no
 * mismatch. `Date.now()` read during render would have both problems.
 */
export const Route = createFileRoute("/")({
  loader: () => ({ launchedAtLoad: Date.now() >= LAUNCH_AT }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { launchedAtLoad } = Route.useLoaderData();
  const [launched, setLaunched] = useState(launchedAtLoad);

  /*
   * Flip live for anyone already holding the page open at the cutoff, rather
   * than making them refresh. A single timeout for the exact remaining
   * interval, not a poll — and setTimeout saturates around 24.9 days, so this
   * only arms when the wait is inside that ceiling. Beyond it the loader has
   * already decided correctly and there is nothing to wait for.
   */
  useEffect(() => {
    if (launched) return;
    const ms = LAUNCH_AT - Date.now();
    if (ms <= 0) {
      setLaunched(true);
      return;
    }
    if (ms > 2_000_000_000) return;
    const id = window.setTimeout(() => setLaunched(true), ms);
    return () => clearTimeout(id);
  }, [launched]);

  if (!launched) return <LaunchPage />;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <Hero />

      <main className="relative z-10 bg-background">
        <Problem />
        <Approach />
        <HowAiWorks />
        <DealFlow />
        <TrustProtection />
        <Logistics />
        <WhoItsFor />
        <WhyUs />
        <Faq />
        <FinalCta />
      </main>
      <div className="relative z-10 bg-background">
        <Footer />
      </div>
      {/* Home only: it keys off the hero's scroll, and there is no hero elsewhere. */}
      <WaitlistPrompt />
    </div>
  );
}
