import { Eyebrow, Reveal } from "../primitives";

const pillars = [
  {
    title: "Blind-Counterparty Architecture",
    body: "Four-stage progressive identity reveal. Deal data flows; identities are milestone-gated. Circumvention is structurally eliminated.",
  },
  {
    title: "Verification Before Access",
    body: "KYB, sanctions screening, and document audit precede participation. Only verified entities enter the deal cycle.",
  },
  {
    title: "Process-Governed Operations",
    body: "Every workflow is SOP-governed and version-gated before it reaches software. Nothing is built on guesswork.",
  },
  {
    title: "AI-Native by Design",
    body: "Every operation captures structured, labelled data — the training substrate for the autonomous intelligence layer.",
  },
];

export function Pillars() {
  return (
    <section className="relative overflow-hidden bg-light-surface px-5 py-20 text-ink sm:px-6 sm:py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow tone="light">What Defines Us</Eyebrow>
            <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-ink md:text-4xl lg:text-[2.75rem]">
              Four structural commitments, not a marketing line.
            </h2>
          </Reveal>
        </div>

        {/*
          Numbered and ruled rather than four equal cards: the ordinal gives the
          eye somewhere to land and turns a grid of similar-looking paragraphs
          into a list that reads as deliberate structure.
        */}
        <ol className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 110}>
              <li className="group relative h-full pt-8">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-ink/15 transition-colors duration-500 group-hover:bg-accent"
                />
                <div className="flex items-start gap-5">
                  <span className="font-display text-[0.72rem] leading-none tracking-[0.06em] text-accent tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl leading-snug font-medium tracking-tight text-ink">
                      {p.title}
                    </h3>
                    <p className="mt-3 font-sans text-sm leading-relaxed text-ink/65">{p.body}</p>
                  </div>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
