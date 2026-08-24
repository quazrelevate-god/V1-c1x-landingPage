import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { AboutHero } from "@/components/site/about/AboutHero";
import { WhoWeAre } from "@/components/site/about/WhoWeAre";
import { VisionMission } from "@/components/site/about/VisionMission";
import { Pillars } from "@/components/site/about/Pillars";
import { Markets } from "@/components/site/about/Markets";
import { Leadership } from "@/components/site/about/Leadership";
import { AboutCta } from "@/components/site/about/AboutCta";

const title = "About Corridor One X";
const description =
  "Corridor One X is an AI-powered B2B commodity trade intelligence company headquartered in Chennai, India, replacing the traditional intermediary layer in global commodity trade.";

export const Route = createFileRoute("/about")({
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
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="relative z-10 bg-background">
        <AboutHero />
        <WhoWeAre />
        <VisionMission />
        <Pillars />
        <Markets />
        <Leadership />
        <AboutCta />
      </main>
      <div className="relative z-10 bg-background">
        <Footer />
      </div>
    </div>
  );
}
