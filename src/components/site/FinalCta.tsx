import { useIsMobile } from "@/hooks/use-mobile";
import { videoSrc } from "@/lib/media";
import { useMotionEnabled } from "@/lib/scroll-motion";
import { Parallax, Reveal, useInView } from "./primitives";
// Reuses the desktop hero footage at 480p (487 KB) rather than a separate loop
// asset — this sits at opacity-35 behind gradients, so a low-res cut is plenty.
import ctaVideo from "@/assets/hero-desktop-480.mp4";

export function FinalCta() {
  const { ref, inView } = useInView<HTMLElement>(0.1);
  const isMobile = useIsMobile();
  const motionEnabled = useMotionEnabled();
  // The loop only earns its bytes on a screen that can see it move: it sits at
  // opacity-35 behind two gradients and a lime glow. Load it only on desktop,
  // with motion on, once scrolled to it; everyone else gets the section's own
  // background and corridor glow, with no image standing in for the footage.
  // Before this the video autoplayed and pulled its full weight on first paint,
  // on every device, for a section at the very bottom of the page.
  const showVideo = inView && !isMobile && motionEnabled;

  return (
    <section
      ref={ref}
      id="book-a-demo"
      data-nav-tone="dark"
      // Matched to the Section primitive's rhythm (py-20 / 24 / 32). It was
      // md:py-44, which stacked against the FAQ's own md:py-32 above it and left
      // a gap roughly two and a half times every other section boundary.
      className="corridor-glow glow-animate relative overflow-hidden px-5 py-20 sm:px-6 sm:py-24 md:py-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Parallax speed={0.35} className="absolute -inset-y-[30%] inset-x-0">
          {showVideo ? (
            <video
              className="h-full w-full scale-125 object-cover opacity-35"
              autoPlay
              loop
              muted
              playsInline
              preload="none"
            >
              <source src={videoSrc("hero-desktop-480.mp4", ctaVideo)} type="video/mp4" />
            </video>
          ) : null}
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
            Whether you move 50 tonnes or 5,000, you get the same verification, the same protection, and the same direct access to the market.
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
            Twenty minutes. We walk one closed deal end to end, with the real numbers.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
