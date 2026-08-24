import { Eyebrow, Parallax, ParallaxGlow, Reveal, Section, useCountUp, useInView } from "./primitives";

const advantages = [
  "AI-verified matching network",
  "Trust Score 0 to 1000 per trader",
  "Identity protected until escrow funds",
  "Proprietary closed-deal intelligence",
  "Document verification at every step",
];

function Flywheel() {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const deals = useCountUp(5000, inView, 2200);

  return (
    <div ref={ref} className="mt-8 rounded-lg border border-border bg-card/50 p-7">
      <div className="flex items-baseline justify-between font-display tracking-tight">
        <span className="text-sm text-muted-foreground">Deal 500</span>
        <span className="text-sm text-muted-foreground">Deal 5,000</span>
      </div>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent"
          style={{
            width: inView ? "100%" : "0%",
            transition: "width 2.2s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>
      <p className="mt-6 font-display text-4xl leading-none font-medium tracking-[-0.04em] text-accent tabular-nums md:text-5xl">
        {deals.toLocaleString("en-US")}
      </p>
      <p className="mt-3 font-sans text-sm text-muted-foreground">
        Verified, closed-loop data points compounding into a dataset no competitor can rebuild.
      </p>
    </div>
  );
}

function PullQuote() {
  const { ref, inView } = useInView<HTMLQuoteElement>(0.3);
  return (
    <blockquote
      ref={ref}
      className="mt-20 border-l-2 border-accent pl-8"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "scale(0.965) translateY(16px)",
        transition: "opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <p className="max-w-3xl font-display text-2xl leading-[1.25] font-medium tracking-[-0.03em] text-accent md:text-3xl lg:text-4xl">
        The moat is not the technology. It is the data no one else will ever have.
      </p>
    </blockquote>
  );
}

export function WhyUs() {
  return (
    <Section className="hairline-top relative overflow-hidden">
      <ParallaxGlow speed={0.5} intensity={13} />
      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>The Compounding Advantage</Eyebrow>
          <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-foreground md:text-4xl lg:text-[2.75rem]">
            Early numbers. Compounding moat.
          </h2>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h3 className="font-display text-sm uppercase tracking-[0.02em] text-muted-foreground">
            What only we have
          </h3>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {advantages.map((a) => (
              <li key={a} className="flex items-center gap-3 py-4 font-display text-base tracking-tight text-foreground">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                {a}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <h3 className="font-display text-sm uppercase tracking-[0.02em] text-muted-foreground">
            The data flywheel
          </h3>
          <p className="mt-6 font-sans text-base leading-relaxed text-secondary-foreground">
            Every closed deal generates a verified, closed-loop data point no public database holds: counterparty
            reliability, commodity grade accuracy, price benchmark, logistics outcome, payment behaviour. By deal
            500, Corridor One X holds the most valuable proprietary commodity intelligence dataset in the corridor.
            By deal 5,000, no competitor can enter.
          </p>
          <Parallax speed={-0.05}>
        <Flywheel />
      </Parallax>
        </Reveal>
      </div>

      <PullQuote />
    </Section>
  );
}
