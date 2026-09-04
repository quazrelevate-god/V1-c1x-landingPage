import { Eyebrow, Parallax, ParallaxGlow, Reveal, Section } from "./primitives";

const cards = [
  "No verified identity behind the name on the contract.",
  "No recourse when the deal breaks mid-transaction.",
  "No infrastructure built for cross-border SME commodity trade.",
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
            You found the counterparty through someone who knows someone. You checked what you could check. Then you shipped, and waited to see whether the money arrived. That is how most cross-border commodity trade still works — and when it fails, there is no recourse. Only a loss you absorb.
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
