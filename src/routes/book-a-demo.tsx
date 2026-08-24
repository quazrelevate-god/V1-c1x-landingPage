import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { BookDemoForm } from "@/components/site/BookDemoForm";
import { Eyebrow, ParallaxGlow, Reveal } from "@/components/site/primitives";

const title = "Book a Demo — Corridor One X";
const description =
  "See how a verified commodity deal closes on Corridor One X. A 20-minute walkthrough of matching, escrow, and settlement. No obligation.";

export const Route = createFileRoute("/book-a-demo")({
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
  component: BookADemo,
});

const steps = [
  {
    n: "01",
    title: "We read your requirement",
    body: "Commodity, grade, volume, and the corridor you move on. Nothing generic.",
  },
  {
    n: "02",
    title: "We walk a real deal end to end",
    body: "Verified listing, AI match, masked negotiation, signed LOI, escrow, delivery, release.",
  },
  {
    n: "03",
    title: "You see your own numbers",
    body: "What the corridor prices at, who is verified on it, and what settlement would look like.",
  },
];

function BookADemo() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="relative z-10 bg-background">
        <section className="corridor-glow-center glow-animate relative overflow-hidden px-5 pt-28 pb-20 sm:px-6 sm:pt-36 sm:pb-24 md:pb-32">
          <ParallaxGlow speed={0.5} intensity={13} />
          <div className="mx-auto w-full max-w-6xl">
            <div className="max-w-3xl">
              <Reveal>
                <Eyebrow>Book a Demo</Eyebrow>
                <h1 className="mt-6 font-display text-[2rem] leading-[1.08] font-medium tracking-[-0.035em] text-foreground sm:text-4xl lg:text-5xl">
                  See how a verified deal closes.
                </h1>
                <p className="mt-7 max-w-xl font-sans text-base leading-relaxed text-secondary-foreground lg:text-lg">
                  A 20-minute walkthrough of how Corridor One X matches counterparties, holds funds
                  in escrow, and settles a deal end to end. Tell us what you move and we'll walk
                  your corridor, not a generic tour.
                </p>
              </Reveal>
            </div>

            <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
              <Reveal>
                <BookDemoForm />
              </Reveal>

              <Reveal delay={140}>
                <div className="lg:pt-2">
                  <h2 className="font-display text-sm uppercase tracking-[0.02em] text-muted-foreground">
                    What the call covers
                  </h2>
                  <ol className="mt-7 space-y-7">
                    {steps.map((s) => (
                      <li key={s.n} className="flex gap-5">
                        <span className="font-display text-sm tracking-[0.02em] text-accent">
                          {s.n}
                        </span>
                        <div>
                          <h3 className="font-display text-base font-medium tracking-tight text-foreground">
                            {s.title}
                          </h3>
                          <p className="mt-2 font-sans text-sm leading-relaxed text-secondary-foreground">
                            {s.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-10 border-l-2 border-accent pl-6 font-display text-base leading-snug tracking-tight text-accent">
                    No obligation, and nothing is listed until you say so.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <div className="relative z-10 bg-background">
        <Footer />
      </div>
    </div>
  );
}
