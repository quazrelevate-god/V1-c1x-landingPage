import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Proof } from "@/components/site/Proof";
import { WhoItsFor } from "@/components/site/WhoItsFor";
import { AiOrbit } from "@/components/site/AiOrbit";
import { Problem } from "@/components/site/Problem";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Money } from "@/components/site/Money";
import { Logistics } from "@/components/site/Logistics";
import { Faq } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Footer } from "@/components/site/Footer";

const title = "Corridor One X: Verified Commodity Trade Infrastructure";
const description =
  "Corridor One X connects verified producers, exporters, and importers directly. AI matching, autonomous settlement, and escrow-secured payment across live global commodity corridors.";

export const Route = createFileRoute("/")({
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
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <Hero />

      {/*
        Pulled up over the hero's runway.

        The hero is 300svh of scroll wrapping a 100svh pinned pane. Without this
        the pane would unpin and scroll away like any other section. The negative
        margin lets this content climb over the pane while it is still pinned, so
        the hero is occluded rather than scrolled past — it stays put and gets
        buried. z-10 over the hero's z-0 decides who covers whom.
      */}
      <main className="relative z-10 -mt-[100svh] bg-background">
        <Proof />
        <WhoItsFor />
        <AiOrbit />
        <Problem />
        <HowItWorks />
        <Money />
        <Logistics />
        <Faq />
        <FinalCta />
      </main>
      <div className="relative z-10 bg-background">
        <Footer />
      </div>
    </div>
  );
}
