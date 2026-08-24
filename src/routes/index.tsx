import { createFileRoute } from "@tanstack/react-router";
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

const title = "Corridor One X: Verified Commodity Trade Infrastructure";
const description =
  "Corridor One X connects verified producers, exporters, and importers directly. AI matching, autonomous settlement, and escrow-secured payment across the India-Gulf corridor.";

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
    </div>
  );
}

