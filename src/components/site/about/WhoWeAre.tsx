import { Eyebrow, Reveal } from "../primitives";

export function WhoWeAre() {
  return (
    <section className="relative overflow-hidden bg-light-surface-alt px-5 py-20 text-ink sm:px-6 sm:py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow tone="light">Who We Are</Eyebrow>
            <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-ink md:text-4xl lg:text-[2.75rem]">
              We compress the entire trade chain into one intelligent system.
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="font-sans text-base leading-relaxed text-ink/70">
              Global commodity trade still runs on fragmented communication, unverified counterparties, and opaque
              intermediation. Discovery is manual, trust is informal, and deal cycles stretch across weeks of phone
              calls and forwarded documents. C1X was founded to compress that entire chain into one intelligent
              system — where verified buyers and sellers are matched by AI, identities remain protected until trust
              milestones are met, and every stage of the transaction is governed by auditable process.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <p className="font-sans text-base leading-relaxed text-ink/70">
              The Corridor One X platform operates on a blind-counterparty architecture with a four-stage
              progressive identity reveal. Specifications, volumes, and pricing move freely; counterparty identities
              are disclosed only as verification and commitment milestones are crossed. This protects both sides,
              eliminates circumvention, and makes confidentiality a structural feature of the platform rather than a
              promise.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
