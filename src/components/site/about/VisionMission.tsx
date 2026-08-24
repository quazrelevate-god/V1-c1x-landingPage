import { Eyebrow, ParallaxGlow, Reveal, Section } from "../primitives";

export function VisionMission() {
  return (
    <Section className="hairline-top relative overflow-hidden">
      <ParallaxGlow speed={0.5} intensity={13} />
      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>Direction</Eyebrow>
          <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-foreground md:text-4xl lg:text-[2.75rem]">
            Vision, mission, and what we are not.
          </h2>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-16">
        <Reveal>
          <h3 className="font-display text-sm uppercase tracking-[0.02em] text-muted-foreground">Vision</h3>
          <p className="mt-4 font-display text-xl leading-snug font-medium tracking-tight text-foreground">
            To become the intelligence layer of global commodity trade — the single platform through which verified
            counterparties across every corridor discover, negotiate, and close with confidence.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h3 className="font-display text-sm uppercase tracking-[0.02em] text-muted-foreground">Mission</h3>
          <p className="mt-4 font-display text-xl leading-snug font-medium tracking-tight text-foreground">
            Replace fragmented, opaque trade intermediation with a verified, confidential, AI-driven deal engine —
            compressing deal cycles from weeks to days while protecting every counterparty at every stage.
          </p>
        </Reveal>
      </div>

      <Reveal delay={200}>
        <p className="mt-16 max-w-3xl border-l-2 border-accent pl-8 font-sans text-base leading-relaxed text-secondary-foreground">
          C1X is not a directory, a marketplace listing service, or a digital version of the traditional middleman.
          It is a replacement for that category entirely: a commodity trade intermediation platform where
          intelligence — matching, verification, negotiation support, and market data — is delivered by the system
          itself. The value we sell is trust, speed, and confidentiality, engineered into software.
        </p>
      </Reveal>
    </Section>
  );
}
