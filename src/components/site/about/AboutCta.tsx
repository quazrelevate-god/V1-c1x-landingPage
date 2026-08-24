import { ParallaxGlow, Reveal } from "../primitives";

const badges = [
  { title: "Startup India", body: "DPIIT-recognised startup, Government of India" },
  { title: "MSME", body: "Registered MSME, Government of Tamil Nadu" },
];

export function AboutCta() {
  return (
    <section className="hairline-top relative overflow-hidden px-5 py-20 sm:px-6 sm:py-24 md:py-32">
      <ParallaxGlow speed={0.5} intensity={14} />
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-14 md:grid-cols-2 md:gap-16">
          <Reveal>
            <h2 className="font-display text-3xl leading-[1.1] tracking-[-0.03em] text-foreground md:text-4xl lg:text-[2.75rem]">
              Built for the long corridor, not the quick close.
            </h2>
            <p className="mt-7 max-w-md font-sans text-base leading-relaxed text-secondary-foreground">
              See how a verified deal moves through Corridor One X, from requirement to funds
              release.
            </p>
            <div className="mt-9">
              <a
                href="/book-a-demo"
                className="inline-block rounded-md bg-accent px-6 py-3.5 text-center font-display text-sm font-medium tracking-tight text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-hover active:bg-accent-pressed"
              >
                Book a Demo
              </a>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="grid gap-8 border-t border-border pt-8 sm:grid-cols-2">
              {badges.map((b) => (
                <div key={b.title}>
                  <h3 className="font-display text-base font-medium tracking-tight text-foreground">
                    {b.title}
                  </h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
                    {b.body}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
