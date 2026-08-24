import { Eyebrow, Reveal } from "../primitives";

const founders = [
  {
    name: "Vaishak",
    role: "Founder & CEO",
    credentials: "Data Science · BCA",
    bio: "Sets the strategic direction of C1X — platform architecture, corridor strategy, and the capital roadmap. Drives the AI-native operating doctrine of the company: every process SOP-governed, every operation generating structured training data, every build gated by founder sign-off. Holds the investor relationships and leads the company's expansion across the India–UAE corridor and global markets.",
  },
  {
    name: "Arockia Ruban",
    role: "Founder & Director",
    credentials: "B.Sc Computer Science · MBA · MS Business Analytics",
    bio: "Commands operational breadth across C1X — counterparty sourcing, logistics coordination, and analytics. With a foundation spanning computer science and business analytics, converts strategy into executable operations, running the pipelines that feed the platform's deal cycles and converging with Vaishak on high-stakes negotiations and data-room engagements.",
  },
];

const doctrine = [
  {
    title: "SOPs Precede Screens",
    body: "No feature is built until the process governing it is documented, version-gated, and signed off. Enforced in code, not just policy.",
  },
  {
    title: "Proof Before Capital",
    body: "Fundraising is sequenced after live deal cycles, retention signals, and demonstrable unit economics — not before.",
  },
  {
    title: "Data From Day One",
    body: "Every operation captures structured, labelled data engineered for the platform's future autonomous intelligence.",
  },
];

export function Leadership() {
  return (
    <section className="relative overflow-hidden bg-light-surface-alt px-5 py-20 text-ink sm:px-6 sm:py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow tone="light">Leadership</Eyebrow>
            <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-ink md:text-4xl lg:text-[2.75rem]">
              Two founders. One deliberate division of command.
            </h2>
            <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-ink/70">
              Strategy and capital on one axis; breadth, sourcing, and operations on the other.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-8">
          {founders.map((f, i) => (
            <Reveal key={f.name} delay={i * 130}>
              <div className="h-full border-t border-ink/15 pt-7">
                <h3 className="font-display text-xl font-medium tracking-tight text-ink">{f.name}</h3>
                <p className="mt-1 font-display text-[0.72rem] uppercase tracking-[0.02em] text-accent">{f.role}</p>
                <p className="mt-3 font-sans text-sm text-ink/55">{f.credentials}</p>
                <p className="mt-5 font-sans text-sm leading-relaxed text-ink/70">{f.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 border-t border-ink/15 pt-12">
          <Reveal>
            <h3 className="font-display text-sm uppercase tracking-[0.02em] text-ink/50">Operating Doctrine</h3>
          </Reveal>
          <div className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-3">
            {doctrine.map((d, i) => (
              <Reveal key={d.title} delay={i * 110}>
                <h4 className="font-display text-base font-medium tracking-tight text-ink">{d.title}</h4>
                <p className="mt-2 font-sans text-sm leading-relaxed text-ink/65">{d.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
