import { Eyebrow, ParallaxGlow, Reveal, Section } from "./primitives";
import {
  MatchingDiagram,
  VerifyDiagram,
  AutonomousDiagram,
  SettlementDiagram,
  EscrowDiagram,
} from "./ApproachDiagrams";

const pillars = [
  {
    title: "Matching",
    body: "Counterparties surfaced by AI on spec fit, corridor, volume, and Trust Score.",
    diagram: MatchingDiagram,
    span: "lg:col-span-2",
  },
  {
    title: "Verify Identity",
    body: "KYC and KYB clearance before any party can see or send a deal.",
    diagram: VerifyDiagram,
    span: "lg:col-span-2",
  },
  {
    title: "Autonomous",
    body: "The platform executes the deal flow end to end, without a chain of intermediaries.",
    diagram: AutonomousDiagram,
    span: "lg:col-span-2",
  },
  {
    title: "Select Settlement",
    body: "Terms and rails are chosen per deal, then routed and reconciled automatically.",
    diagram: SettlementDiagram,
    span: "lg:col-span-3",
  },
  {
    title: "Escrow Protection",
    body: "Funds sit in licensed escrow and release only on confirmed delivery.",
    diagram: EscrowDiagram,
    span: "lg:col-span-3",
  },
];

export function Approach() {
  return (
    <Section className="hairline-top relative overflow-hidden">
      <ParallaxGlow speed={0.55} intensity={12} />
      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>The Corridor One X Approach</Eyebrow>
          <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-foreground md:text-4xl lg:text-[2.75rem]">
            Verified before contact. Autonomous through settlement.
          </h2>
          <p className="mt-7 font-sans text-base leading-relaxed text-secondary-foreground">
            Corridor One X does not digitise the old way of trading. It replaces it. Identity is verified before any
            deal begins. Counterparties are matched by AI across commodity, volume, corridor, and trust history.
            Terms are locked in a signed Letter of Intent. Payment is held in escrow and released only on confirmed
            delivery. All of it executes through the platform, without a chain of unverified hands.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-6">
        {pillars.map((p, i) => (
          <Reveal key={p.title} delay={i * 120} className={`bg-card ${p.span}`}>
            <div className="group flex h-full flex-col bg-card p-7 transition-colors duration-500 hover:bg-elevated">
              <h3 className="font-display text-base font-medium tracking-tight text-foreground">{p.title}</h3>
              <p className="mt-2 max-w-sm font-sans text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <div className="mt-8 flex flex-1 items-end opacity-80 transition-opacity duration-500 group-hover:opacity-100">
                <p.diagram />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
