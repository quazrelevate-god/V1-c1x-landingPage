import { Parallax, Reveal } from "./primitives";
import ctaPoster from "@/assets/hero-port.jpg";
import ctaVideo from "@/assets/hero-loop.mp4";

export function FinalCta() {
  return (
    <section
      id="book-a-demo"
      className="corridor-glow glow-animate relative overflow-hidden px-5 py-24 sm:px-6 sm:py-32 md:py-44"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Parallax speed={0.35} className="absolute -inset-y-[30%] inset-x-0">
        <video
          className="h-full w-full scale-125 object-cover opacity-35"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster={ctaPoster}
        >
          <source src={ctaVideo} type="video/mp4" />
        </video>
        </Parallax>
        <div className="absolute inset-0 bg-background/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
        {/* strongest corridor light on the page */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 45% at 50% 100%, color-mix(in oklab, var(--accent) 34%, transparent) 0%, transparent 72%)",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-3xl text-center">
        <Reveal>
          <h2 className="font-display text-4xl leading-[1.05] font-medium tracking-[-0.035em] text-foreground md:text-5xl lg:text-6xl">
            The infrastructure for certain trade.
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-7 max-w-xl font-sans text-base leading-relaxed text-secondary-foreground">
            Whether you move 50 tonnes or 5,000, you get the same verification, the same protection, and the same
            direct access to the global market.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div className="mt-10">
            <a
              href="/book-a-demo"
              className="inline-block rounded-md bg-accent px-7 py-3.5 font-display text-sm font-medium tracking-tight text-accent-foreground shadow-[0_0_60px_-12px_var(--accent)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-hover active:bg-accent-pressed"
            >
              Book a Demo
            </a>
          </div>
          <p className="mt-6 font-sans text-sm text-muted-foreground">
            A 20-minute walkthrough of how a verified deal closes on Corridor One X. No obligation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
