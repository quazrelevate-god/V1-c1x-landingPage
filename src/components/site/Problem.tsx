import { Eyebrow, Parallax, ParallaxGlow, Reveal, Section } from "./primitives";
import problemImg from "@/assets/problem.jpg";

const cards = [
  "Deals negotiated with zero identity verification.",
  "No recourse when a deal fails mid-transaction.",
  "No infrastructure built for cross-border SME commodity trade, until now.",
];

export function Problem() {
  return (
    <Section id="problem" className="relative overflow-hidden">
      <ParallaxGlow speed={0.55} intensity={14} />
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal>
          <Eyebrow>The Status Quo</Eyebrow>
          <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-foreground md:text-4xl lg:text-[2.75rem]">
            Multi-crore deals. Still closed on a phone call and blind trust.
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="font-sans text-base leading-relaxed text-secondary-foreground lg:pt-14">
            Every year, thousands of producers, exporters, and importers negotiate deals worth hundreds of thousands
            of dollars through unverified contacts and informal arrangements. No verified identity. No enforceable
            terms. No protection on the payment. When a deal collapses, and they do, there is no recourse, and the
            goods, the margin, or the money are simply gone.
          </p>
        </Reveal>
      </div>

      <Parallax speed={-0.07} className="mt-16 grid gap-4 md:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c} delay={i * 140}>
            <div className="h-full rounded-lg border border-border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:bg-elevated">
              <span className="font-display text-xs tracking-[0.02em] text-accent">0{i + 1}</span>
              <p className="mt-5 font-display text-lg leading-snug tracking-tight text-foreground">{c}</p>
            </div>
          </Reveal>
        ))}
      </Parallax>
    </Section>
  );
}
