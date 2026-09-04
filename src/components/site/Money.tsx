import { Eyebrow, Reveal, useCountUp, useInView } from "./primitives";

const releaseSchedule = [
  { trigger: "Verified loading", released: "30%", seen: "2 business days" },
  { trigger: "Shipping documents verified", released: "40%", seen: "2 business days" },
  { trigger: "Delivery confirmed", released: "Remainder", seen: "3 business days" },
];

const scoreBreakdown = [
  { label: "KYC and identity", value: 30 },
  { label: "Trade history", value: 30 },
  { label: "On-time delivery", value: 25 },
  { label: "Dispute rate", value: 15 },
];

function TrustScoreCard() {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const score = useCountUp(1000, inView, 1800);

  return (
    /*
     * Solid dark panel with white type throughout.
     *
     * It was `bg-background/60` — the dark token at 60% over a light section,
     * which composites to a muddy grey — carrying dark `text-ink` on top. Both
     * sides of that were low contrast. Going fully opaque makes it a deliberate
     * dark panel against the light section and lets the type be plain white.
     *
     * h-full so it fills the column it now spans across both text blocks.
     */
    <div
      ref={ref}
      className="flex h-full flex-col justify-center rounded-2xl border border-ink/10 bg-background p-8"
    >
      <p className="font-display text-[0.72rem] tracking-[0.02em] text-foreground/55 uppercase">
        Trust Score (0 to 1000)
      </p>
      <p className="mt-4 font-display text-5xl leading-none font-medium tracking-[-0.04em] text-foreground tabular-nums md:text-6xl">
        {score}
      </p>
      <ul className="mt-8 space-y-5">
        {scoreBreakdown.map((b, i) => (
          <li key={b.label}>
            <div className="flex items-baseline justify-between font-sans text-sm text-foreground/85">
              <span>{b.label}</span>
              <span className="tabular-nums text-foreground/55">{b.value}%</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-foreground/15">
              <div
                className="h-full rounded-full bg-accent"
                style={{
                  width: inView ? `${b.value}%` : "0%",
                  transition: `width 1.1s cubic-bezier(0.16,1,0.3,1) ${i * 120 + 200}ms`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Money() {
  return (
    <section
      id="money"
      data-nav-tone="light"
      className="relative overflow-hidden bg-light-surface-alt px-5 py-20 text-ink sm:px-6 sm:py-24 md:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow tone="light">Money</Eyebrow>
            <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-ink md:text-4xl lg:text-[2.75rem]">
              What it costs, and when you get paid.
            </h2>
          </Reveal>
        </div>

        {/* Block A — Cost */}
        <Reveal>
          <div className="mt-14 border-t border-ink/15 pt-7">
            <h3 className="font-display text-xl font-medium tracking-tight text-ink md:text-2xl">
              Nothing until a deal closes.
            </h3>
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink/70">
              No subscription. No listing fee. Nothing to search, nothing to negotiate. One fee, charged at settlement, on a deal that actually completed. If it does not close, you owe nothing.
            </p>
          </div>
        </Reveal>

        {/* Block B — Cash flow */}
        <Reveal delay={120}>
          <div className="mt-14 border-t border-ink/15 pt-7">
            <h3 className="font-display text-xl font-medium tracking-tight text-ink md:text-2xl">
              Escrow is not a holding pen.
            </h3>
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink/70">
              Funds release against milestones, not all at the end.
            </p>

            {/*
              Below sm the schedule is stacked rather than tabular.

              It was one table in a `-mx-5` horizontal scroller: the negative
              margin pulled it past the section padding so the first column sat
              flush against the viewport edge and looked sliced, and the third
              column was off-screen entirely. Three columns cannot fit 350px of
              usable width, so on a phone each milestone becomes its own block and
              nothing is cut or hidden behind a scroll.
            */}
            <ul className="mt-7 space-y-4 sm:hidden">
              {releaseSchedule.map((r) => (
                <li key={r.trigger} className="border-t border-ink/15 pt-4">
                  <p className="font-sans text-[0.9rem] leading-snug text-ink">{r.trigger}</p>
                  <div className="mt-2 flex items-baseline justify-between font-sans text-[0.8rem]">
                    <span className="font-display tabular-nums text-ink">{r.released}</span>
                    <span className="tabular-nums text-ink/60">{r.seen}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-7 hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[32rem] border-separate border-spacing-0 font-sans text-sm text-ink/85">
                <thead>
                  <tr className="text-left font-display text-[0.72rem] uppercase tracking-[0.02em] text-ink/50">
                    <th className="border-b border-ink/15 py-3 pr-6">Trigger</th>
                    <th className="border-b border-ink/15 py-3 pr-6 tabular-nums">Released</th>
                    <th className="border-b border-ink/15 py-3 tabular-nums">Seller sees it</th>
                  </tr>
                </thead>
                <tbody>
                  {releaseSchedule.map((r) => (
                    <tr key={r.trigger}>
                      <td className="border-b border-ink/10 py-4 pr-6">{r.trigger}</td>
                      <td className="border-b border-ink/10 py-4 pr-6 font-display tabular-nums text-ink">
                        {r.released}
                      </td>
                      <td className="border-b border-ink/10 py-4 tabular-nums text-ink/70">
                        {r.seen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 max-w-2xl font-sans text-sm leading-relaxed text-ink/65">
              A dispute window sits before final release. Every movement is on an audit trail either side can pull.
            </p>
          </div>
        </Reveal>

        {/*
          Blocks C and D share one row.

          They used to stack, which left the Trust Score card stranded at the
          bottom with dead space beside "A single number…" and a long empty run
          under the card itself. Pulling the card up to span both text blocks
          fills that column and removes the gap entirely.

          The rules now sit on the text column only, not the full width — a rule
          running under the card was cutting across the composition.
        */}
        <Reveal delay={160}>
          <div className="mt-14 grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
            <div className="flex flex-col">
              <div className="border-t border-ink/15 pt-7">
                <h3 className="font-display text-xl font-medium tracking-tight text-ink md:text-2xl">
                  Custody sits outside Corridor One X.
                </h3>
                <p className="mt-4 font-sans text-base leading-relaxed text-ink/70">
                  Funds sit in licensed, segregated escrow accounts held by a regulated escrow partner. They are never on Corridor One X's balance sheet. Full custody, partner and jurisdiction details are walked through on the demo call.
                </p>
              </div>

              <div className="mt-12 border-t border-ink/15 pt-7">
                <h3 className="font-display text-xl font-medium tracking-tight text-ink md:text-2xl">
                  A single number every trader carries.
                </h3>
                <p className="mt-4 font-sans text-base leading-relaxed text-ink/70">
                  Zero to one thousand. Identity and KYC 30%, trade history 30%, on-time delivery 25%, dispute rate 15%. Built only from settled deals on the platform. It cannot be bought, and it does not reset.
                </p>
              </div>
            </div>

            <TrustScoreCard />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
