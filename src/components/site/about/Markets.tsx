import { Eyebrow, ParallaxGlow, Reveal, Section } from "../primitives";

const sectors = [
  {
    code: "AGR",
    label: "Agriculture",
    size: "$2.4T",
    goods: "Wheat, rice, corn, soybeans · cotton, rubber · coffee, tea, cocoa · edible oils · spices, seeds, pulses",
  },
  {
    code: "MIN",
    label: "Minerals & Mining",
    size: "$1.8T",
    goods: "Gold, silver, platinum · copper, zinc, nickel · iron ore, bauxite · lithium, cobalt · rare earths",
  },
  {
    code: "ENR",
    label: "Energy",
    size: "$3.1T",
    goods: "Crude oil, diesel, petrol · LNG, LPG, natural gas · coal, petcoke · biofuels, ethanol · energy certificates",
  },
  {
    code: "IND",
    label: "Industrial Materials",
    size: "$1.2T",
    goods: "Steel, aluminium, scrap · timber, pulp · chemicals, polymers · cement, aggregates · fertilizers",
  },
  {
    code: "FDP",
    label: "Food & Consumer",
    size: "$8.7T",
    goods: "Dairy, meat, seafood · frozen & processed foods · sugar, salt, starch · packaged & organic goods",
  },
];

export function Markets() {
  return (
    <Section id="markets" className="hairline-top relative overflow-hidden">
      <ParallaxGlow speed={0.5} intensity={12} />
      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>Sectors &amp; Corridors</Eyebrow>
          <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-foreground md:text-4xl lg:text-[2.75rem]">
            Five sectors. One verification standard.
          </h2>
          <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-secondary-foreground">
            C1X serves five commodity sectors across the India–UAE corridor, with Africa and global enterprise
            markets on the expansion path. Each sector carries the same structural pain — fragmented discovery,
            informal trust, and slow, opaque intermediation. One platform, one verification standard, and one
            confidential deal engine address all five.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-6 divide-y divide-border border-t border-border sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
        {sectors.map((s, i) => (
          <Reveal key={s.code} delay={i * 90}>
            <div className="h-full px-0 pt-8 sm:px-8 sm:first:pl-0">
              <div className="flex items-baseline justify-between font-display tracking-tight">
                <span className="text-[0.72rem] uppercase tracking-[0.02em] text-accent">{s.code}</span>
                <span className="text-sm text-muted-foreground">{s.size}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-medium tracking-tight text-foreground">{s.label}</h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-secondary-foreground">{s.goods}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={sectors.length * 90}>
        <p className="mt-14 max-w-3xl font-sans text-sm leading-relaxed text-muted-foreground">
          India domestic deal cycles are active today. The India–UAE corridor is coming online via a UAE entity and
          cross-border escrow. Africa corridors and global enterprise reach are next on the expansion path.
        </p>
      </Reveal>
    </Section>
  );
}
