import { Eyebrow, ParallaxGlow, Reveal, Section, useCountUp, useInView } from "../primitives";

const sectors = [
  {
    code: "AGR",
    label: "Agriculture",
    /** Addressable value in USD trillions — drives both the figure and the bar. */
    tn: 2.4,
    goods:
      "Wheat, rice, corn, soybeans · cotton, rubber · coffee, tea, cocoa · edible oils · spices, seeds, pulses",
  },
  {
    code: "MIN",
    label: "Minerals & Mining",
    tn: 1.8,
    goods:
      "Gold, silver, platinum · copper, zinc, nickel · iron ore, bauxite · lithium, cobalt · rare earths",
  },
  {
    code: "ENR",
    label: "Energy",
    tn: 3.1,
    goods:
      "Crude oil, diesel, petrol · LNG, LPG, natural gas · coal, petcoke · biofuels, ethanol · energy certificates",
  },
  {
    code: "IND",
    label: "Industrial Materials",
    tn: 1.2,
    goods:
      "Steel, aluminium, scrap · timber, pulp · chemicals, polymers · cement, aggregates · fertilizers",
  },
  {
    code: "FDP",
    label: "Food & Consumer",
    tn: 8.7,
    goods:
      "Dairy, meat, seafood · frozen & processed foods · sugar, salt, starch · packaged & organic goods",
  },
];

const MAX = Math.max(...sectors.map((s) => s.tn));
const TOTAL = sectors.reduce((sum, s) => sum + s.tn, 0);

/**
 * One sector as a measured row: the figure counts up and the rule draws out to
 * its share of the largest market, so the page carries the comparison visually
 * instead of asking the reader to hold five numbers in their head.
 */
function SectorRow({ s, index }: { s: (typeof sectors)[number]; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  // useCountUp is integer-only, so count tenths and place the point on the way out.
  const tenths = useCountUp(Math.round(s.tn * 10), inView, 1100 + index * 90);

  return (
    <div
      ref={ref}
      className="grid grid-cols-[3.25rem_1fr] gap-x-4 border-t border-border py-7 sm:gap-x-8"
    >
      <span className="pt-1 font-display text-[0.72rem] tracking-[0.06em] text-accent uppercase">
        {s.code}
      </span>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-lg font-medium tracking-tight text-foreground sm:text-xl">
            {s.label}
          </h3>
          <span className="font-display text-lg tracking-tight text-foreground tabular-nums sm:text-xl">
            ${(tenths / 10).toFixed(1)}T
          </span>
        </div>

        {/* Decorative: the figure beside it already states the value. */}
        <div aria-hidden className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full bg-accent"
            style={{
              width: inView ? `${(s.tn / MAX) * 100}%` : "0%",
              transition: `width 1100ms cubic-bezier(0.22,1,0.36,1) ${index * 90}ms`,
            }}
          />
        </div>

        <p className="mt-4 font-sans text-sm leading-relaxed text-secondary-foreground">
          {s.goods}
        </p>
      </div>
    </div>
  );
}

export function Markets() {
  const { ref, inView } = useInView<HTMLDivElement>(0.5);
  const total = useCountUp(Math.round(TOTAL * 10), inView, 1400);

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
            C1X serves five commodity sectors across the India–UAE corridor, with Africa and global
            enterprise markets on the expansion path. Each sector carries the same structural pain —
            fragmented discovery, informal trust, and slow, opaque intermediation. One platform, one
            verification standard, and one confidential deal engine address all five.
          </p>
        </Reveal>
      </div>

      <Reveal delay={100}>
        <div ref={ref} className="mt-14 flex items-baseline gap-4 border-b border-accent/30 pb-6">
          <span className="font-display text-[2.5rem] leading-none font-medium tracking-[-0.04em] text-accent tabular-nums sm:text-[3.5rem]">
            ${(total / 10).toFixed(1)}T
          </span>
          <span className="font-display text-sm leading-snug tracking-tight text-muted-foreground">
            addressable across the five
            <br className="hidden sm:block" /> sectors C1X operates in
          </span>
        </div>
      </Reveal>

      <div className="mt-4">
        {sectors.map((s, i) => (
          <SectorRow key={s.code} s={s} index={i} />
        ))}
      </div>

      <Reveal delay={120}>
        <p className="mt-14 max-w-3xl border-l-2 border-accent pl-6 font-sans text-sm leading-relaxed text-muted-foreground">
          India domestic deal cycles are active today. The India–UAE corridor is coming online via a
          UAE entity and cross-border escrow. Africa corridors and global enterprise reach are next
          on the expansion path.
        </p>
      </Reveal>
    </Section>
  );
}
