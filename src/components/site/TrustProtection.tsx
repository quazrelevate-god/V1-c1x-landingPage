import { Eyebrow, Reveal, useCountUp, useInView } from "./primitives";

const breakdown = [
  { label: "KYC and identity", value: 30 },
  { label: "Trade history", value: 30 },
  { label: "On-time delivery", value: 25 },
  { label: "Dispute rate", value: 15 },
];

const columns = [
  {
    title: "Verification",
    body: "Every counterparty cleared before they can transact.",
    items: [
      "Business KYB & beneficial ownership",
      "Export/import licence checks",
      "Bank & GST validation",
      "Trade-reference cross-verification",
    ],
  },
  {
    title: "Escrow & Payment Safety",
    body: "Regulated, licensed escrow with segregated accounts.",
    items: [
      "Milestone-based release (load, ship, deliver)",
      "Dispute window before final release",
      "Full audit trail",
      "Segregated client accounts",
    ],
  },
];

function TrustScoreCard() {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const score = useCountUp(1000, inView, 1800);

  return (
    <div ref={ref} className="h-full border-t border-ink/15 pt-7">
      <h3 className="font-display text-xl font-medium tracking-tight text-ink">Trust Score (0 to 1000)</h3>
      <p className="mt-3 font-sans text-sm leading-relaxed text-ink/65">
        A single number every trader carries, built only from verified, closed-loop signals.
      </p>
      <p className="mt-6 font-display text-5xl leading-none font-medium tracking-[-0.04em] text-ink tabular-nums md:text-6xl">
        {score}
      </p>
      <ul className="mt-6 space-y-4">
        {breakdown.map((b, i) => (
          <li key={b.label}>
            <div className="flex items-baseline justify-between font-sans text-sm text-ink/80">
              <span>{b.label}</span>
              <span className="tabular-nums text-ink/60">{b.value}%</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink/10">
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

export function TrustProtection() {
  return (
    <section id="trust" className="relative overflow-hidden bg-light-surface px-5 py-20 text-ink sm:px-6 sm:py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow tone="light">Trust, Verified. Money, Protected.</Eyebrow>
            <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-ink md:text-4xl lg:text-[2.75rem]">
              Every counterparty verified. Every rupee in escrow.
            </h2>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <Reveal>
            <TrustScoreCard />
          </Reveal>
          {columns.map((c, i) => (
            <Reveal key={c.title} delay={(i + 1) * 120}>
              <div className="h-full border-t border-ink/15 pt-7">
                <h3 className="font-display text-xl font-medium tracking-tight text-ink">{c.title}</h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink/65">{c.body}</p>
                <ul className="mt-6 space-y-3">
                  {c.items.map((it) => (
                    <li key={it} className="flex gap-3 font-sans text-sm text-ink/80">
                      <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
