import { Eyebrow, ParallaxGlow, Reveal, Section, useScrollProgress } from "./primitives";

const steps = [
  {
    n: "01",
    title: "Listing",
    body: "Producer or exporter submits commodity, grade, quantity, corridor, and minimum price. Identity verified against GST, IEC, and trade documents. Need a commodity that isn't listed? Corridor One X sources it directly from verified, reliable origins and brings it to you.",
  },
  {
    n: "02",
    title: "AI Match",
    body: "Corridor One X's AI matches requirements against verified counterparties, ranked by spec fit and Trust Score. Identities stay masked.",
  },
  {
    n: "03",
    title: "Negotiation",
    body: "Both parties negotiate through the platform's AI-assisted masked relay. Neither identity is revealed while terms are agreed.",
  },
  {
    n: "04",
    title: "LOI Signed",
    body: "A digital Letter of Intent is signed, with two ways to structure it: directly between buyer and seller, or through Corridor One X, where the platform stands between both parties and takes responsibility for the agreement. Circumvention protection locks the deal to the platform.",
  },
  {
    n: "05",
    title: "Samples",
    body: "Need to inspect before committing? Samples are routed through Corridor One X, so quality is confirmed without either party's identity being exposed.",
  },
  {
    n: "06",
    title: "Logistics",
    body: "Two ways to move the goods: the buyer arranges their own logistics, and seller details are shared to coordinate; or Corridor One X handles logistics end to end, and the seller stays fully masked.",
  },
  {
    n: "07",
    title: "Escrow Funded",
    body: "Buyer deposits into licensed escrow. Counterparty identity revealed.",
  },
  {
    n: "08",
    title: "Shipped & Verified",
    body: "Shipping documents verified. Goods tracked across the route they move: sea, air, or road.",
  },
  {
    n: "09",
    title: "Escrow Released",
    body: "Funds released on delivery confirmation. Trust Scores updated. Deal complete.",
  },
];

export function DealFlow() {
  const { ref, progress } = useScrollProgress<HTMLOListElement>();

  return (
    <Section id="how-it-works" className="hairline-top relative overflow-hidden">
      <ParallaxGlow speed={0.55} intensity={12} />
      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>The Deal Flow</Eyebrow>
          <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-foreground md:text-4xl lg:text-[2.75rem]">
            A $200,000 deal. Closed with certainty. In seven steps.
          </h2>
        </Reveal>
      </div>

      <ol ref={ref} className="relative mt-16 border-l border-border">
        {/* scroll-driven lime line */}
        <span
          aria-hidden
          className="absolute top-0 -left-px w-px bg-gradient-to-b from-accent/40 via-accent to-accent/70"
          style={{
            height: `${(progress * 100).toFixed(2)}%`,
            transition: "height 120ms linear",
          }}
        />
        {steps.map((s, i) => {
          const active = progress >= (i + 0.35) / steps.length;
          return (
            <li
              key={s.n}
              data-active={active}
              className="group relative grid gap-4 py-8 pl-8 transition-opacity duration-700 data-[active=false]:opacity-45 data-[active=true]:opacity-100 md:grid-cols-[7rem_1fr_1.4fr] md:items-baseline md:gap-8"
            >
              <span
                aria-hidden
                className={`absolute top-[2.6rem] -left-[4.5px] h-2 w-2 rounded-full transition-all duration-500 ease-out ${
                  active ? "scale-150 bg-accent shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_18%,transparent)]" : "bg-border"
                }`}
              />
              <span className="font-display text-sm tracking-[0.02em] text-accent">{s.n}</span>
              <h3 className="font-display text-xl font-medium tracking-tight text-foreground">{s.title}</h3>
              <p className="font-sans text-sm leading-relaxed text-secondary-foreground">{s.body}</p>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
