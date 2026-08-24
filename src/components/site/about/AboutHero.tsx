import { XMark } from "../XMark";
import { Eyebrow, Parallax, ParallaxGlow, Reveal } from "../primitives";

const facts = [
  { label: "Company", value: "Corridor One X (C1X)" },
  { label: "Platform", value: "Corridor One X — AI Deal Engine" },
  { label: "Category", value: "Commodity Trade Intelligence & Intermediation" },
  { label: "Headquarters", value: "Chennai, Tamil Nadu, India" },
  { label: "Primary Corridor", value: "India — UAE, expanding to Africa & global" },
  { label: "Recognition", value: "Startup India (DPIIT) · MSME, Tamil Nadu" },
];

export function AboutHero() {
  return (
    <section className="relative overflow-hidden px-5 pt-32 pb-20 sm:px-6 sm:pt-40 sm:pb-24 md:pb-28">
      <ParallaxGlow speed={0.4} intensity={16} />

      {/*
        The mark as a watermark, drifting against the scroll. The page opened on
        a wall of text with nothing to look at; this gives it a subject without
        needing photography, and being the brand mark it earns its place rather
        than being decoration. Kept very low contrast so it never competes with
        the headline sitting over it.
      */}
      <Parallax
        speed={0.22}
        className="pointer-events-none absolute -top-16 -right-24 hidden w-[34rem] text-accent/[0.055] md:block lg:-right-16 lg:w-[42rem]"
      >
        <XMark />
      </Parallax>

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>About Corridor One X</Eyebrow>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] font-medium tracking-[-0.035em] text-foreground md:text-5xl lg:text-6xl">
              From every corridor. One intelligence.
            </h1>
            <p className="mt-7 max-w-2xl font-sans text-base leading-relaxed text-secondary-foreground sm:text-lg">
              Corridor One X is an AI-powered B2B commodity trade intelligence company headquartered
              in Chennai, India, building the digital infrastructure that replaces the traditional
              intermediary layer in global commodity trade.
            </p>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <dl className="mt-16 grid grid-cols-1 gap-x-8 gap-y-8 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="font-display text-[0.72rem] uppercase tracking-[0.02em] text-muted-foreground">
                  {f.label}
                </dt>
                <dd className="mt-2 font-display text-base tracking-tight text-foreground">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
