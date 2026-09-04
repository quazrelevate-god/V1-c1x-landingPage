import { useEffect, useRef } from "react";
import { Eyebrow, ParallaxGlow, Reveal, Section } from "./primitives";
import bento1 from "@/assets/bento/bento-1.png";
import bento2 from "@/assets/bento/bento-2.png";
import bento3 from "@/assets/bento/bento-3.png";
import bento4 from "@/assets/bento/bento-4.png";
import { assetSrc } from "@/lib/media";

/*
 * Bento grid, 2x2 asymmetric: wide + narrow on the first row, narrow + wide on
 * the second, so the block reads as a composition rather than a table.
 *
 * Five steps became four: Verify and Match were merged. They are the only two
 * that happen before either side has committed to anything, and splitting them
 * across two cards made the pre-contact stage look twice as long as it is. The
 * merged card carries one description at the same length as the others, so the
 * four read as peers rather than one long card beside three short ones.
 *
 * `media` is the card's photograph. Each source was cropped to its slot, so the
 * aspect ratios are not interchangeable: bento-3 is portrait because it fills the
 * tall side column of the split card, while the rest are landscape. object-cover
 * still guards against the card's box drifting from the source ratio.
 */

type Step = {
  n: string;
  title: string;
  /** wide: text held to the left over full-bleed media.
   *  stack: media above, text panel below.
   *  split: media beside, text panel alongside. */
  layout: "wide" | "stack" | "split";
  span: string;
  media: string;
  body: string;
};

const steps: Step[] = [
  {
    n: "01",
    title: "Verify & Match",
    layout: "wide",
    span: "lg:col-span-3",
    media: assetSrc("bento-1.png", bento1),
    body: "Nobody reaches you unverified. Identities clear KYC and KYB before a listing is visible, then the AI ranks counterparties on grade, volume, corridor and settled history.",
  },
  {
    n: "02",
    title: "Agree",
    layout: "stack",
    span: "lg:col-span-2",
    media: assetSrc("bento-2.png", bento2),
    body: "Both sides negotiate through a masked relay and sign a digital LOI. Contract directly, or through Corridor One X as principal. Neither name is revealed yet.",
  },
  {
    n: "03",
    title: "Secure",
    layout: "split",
    span: "lg:col-span-2",
    media: assetSrc("bento-3.png", bento3),
    body: "The buyer funds escrow. Only then are identities exchanged. Samples route through us if you want to inspect first, so nothing is exposed before the money is committed.",
  },
  {
    n: "04",
    title: "Move & settle",
    layout: "wide",
    span: "lg:col-span-3",
    media: assetSrc("bento-4.png", bento4),
    body: "Goods ship by sea, air or road — yours to arrange, or ours end to end with the seller still masked. Documents are verified at each milestone and escrow releases against them.",
  },
];

const aiLines = [
  "Weighs grade, volume, corridor, price band and settled history together — not keyword search.",
  "Ranks by likelihood to close, using both parties' verified records.",
  "Prices from live signals in closed trades, so negotiation starts from evidence rather than a guess.",
];

/** Step number, title and the short accent rule beneath it. */
function CardHeading({ n, title, tone }: { n: string; title: string; tone: "dark" | "light" }) {
  const numberColour = tone === "dark" ? "text-accent" : "text-ink/45";
  const titleColour = tone === "dark" ? "text-foreground" : "text-ink";
  return (
    <>
      <span className={`font-display text-xs tracking-[0.08em] uppercase ${numberColour}`}>{n}</span>
      <h3
        className={`mt-3 font-display text-2xl leading-[1.15] font-medium tracking-[-0.03em] md:text-[1.75rem] ${titleColour}`}
      >
        {title}
      </h3>
      <span aria-hidden className="mt-3 block h-[3px] w-8 rounded-full bg-accent sm:mt-4 sm:w-10" />
    </>
  );
}

function WideCard({ step }: { step: Step }) {
  return (
    <article
      className={"relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-card lg:min-h-[420px] lg:flex-row"}
    >
      {/*
        Below lg the photograph is a block above the copy, matching every other
        card on a narrow screen — text held over a 165px-wide image is unreadable.
        From lg it becomes the full-bleed backdrop the scrim was designed for.
      */}
      <img
        src={step.media}
        alt=""
        aria-hidden
        loading="lazy"
        draggable={false}
        className="h-36 w-full shrink-0 object-cover sm:h-44 lg:absolute lg:inset-0 lg:h-full"
      />

      {/* Scrim: opaque under the copy, clearing to nothing across the media so a
          photograph still reads on the right. */}
      <div
        aria-hidden
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0.25) 68%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div className="relative flex w-full flex-col justify-center p-5 sm:p-7 lg:max-w-[62%] lg:p-10">
        <CardHeading n={step.n} title={step.title} tone="dark" />

        <p className="mt-5 font-sans text-[0.75rem] leading-[1.5] text-secondary-foreground sm:mt-7 sm:text-sm sm:leading-relaxed">
          {step.body}
        </p>
      </div>
    </article>
  );
}

/** Media above, light text panel below. */
function StackCard({ step }: { step: Step }) {
  return (
    <article
      className={"flex h-full w-full flex-col overflow-hidden rounded-2xl bg-light-surface lg:min-h-[420px]"}
    >
      <img
        src={step.media}
        alt=""
        aria-hidden
        loading="lazy"
        draggable={false}
        className="h-36 w-full shrink-0 object-cover sm:h-44 lg:h-48"
      />
      <div className="flex flex-1 flex-col justify-center p-5 sm:p-7 lg:p-8">
        <CardHeading n={step.n} title={step.title} tone="light" />
        <p className="mt-4 font-sans text-[0.75rem] leading-[1.5] text-ink/70 sm:mt-6 sm:text-sm sm:leading-relaxed">{step.body}</p>
      </div>
    </article>
  );
}

/** Media beside, light text panel alongside. Stacks below sm. */
function SplitCard({ step }: { step: Step }) {
  return (
    <article
      className={"flex h-full w-full flex-col overflow-hidden rounded-2xl bg-light-surface lg:min-h-[420px] lg:flex-row"}
    >
      {/* Portrait source: fills the tall side column from sm up, a banner below. */}
      <img
        src={step.media}
        alt=""
        aria-hidden
        loading="lazy"
        draggable={false}
        className="h-36 w-full shrink-0 object-cover sm:h-44 lg:h-auto lg:w-[38%] lg:self-stretch"
      />
      <div className="flex flex-1 flex-col justify-center p-5 sm:p-7 lg:p-8">
        <CardHeading n={step.n} title={step.title} tone="light" />
        <p className="mt-4 font-sans text-[0.75rem] leading-[1.5] text-ink/70 sm:mt-6 sm:text-sm sm:leading-relaxed">{step.body}</p>
      </div>
    </article>
  );
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/*
 * Scroll-linked settle for the bento cards.
 *
 * Position-driven, not trigger-driven: each card's progress comes from where it
 * currently sits in the viewport, so the motion tracks the scroll both ways and
 * unwinds when you scroll back up. A fired-once reveal would stay stuck open.
 *
 * The stagger is not scripted — the lower two cards are further down the page, so
 * they simply reach their settle point later. Scripted delays are what make this
 * kind of thing feel jumpy.
 *
 * Transform and opacity only, so it stays on the compositor. Styles are written
 * straight to the nodes: this runs every scroll frame and four re-renders a frame
 * would cost far more than four style writes.
 */
function useBentoSettle(gridRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>("article"));
    if (!cards.length) return;

    // Reduced motion: leave every card at rest and never subscribe.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    cards.forEach((c) => {
      c.style.willChange = "transform, opacity";
    });

    let raf = 0;
    let inView = false;

    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      const midX = window.innerWidth / 2;
      for (const card of cards) {
        const r = card.getBoundingClientRect();
        // 0 when the card's top is at the viewport bottom, 1 once it has risen
        // 45% of a viewport further — settled well before it is centred.
        const t = clamp01((vh - r.top) / (vh * 0.45));
        const e = 1 - Math.pow(1 - t, 3);

        /*
         * Each card slides in from the side it already sits on: the left column
         * from the left edge, the right column from the right. Read off its own
         * centre rather than its index, so it stays correct when the grid
         * reflows to one or two columns.
         *
         * Horizontal travel is what makes this legible — the earlier 24px lift
         * alone was too small to register. No scale and no rotation: both read as
         * playful, and this wants to look deliberate.
         */
        const dir = r.left + r.width / 2 < midX ? -1 : 1;
        const x = (1 - e) * 90 * dir;
        const y = (1 - e) * 36;
        card.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        card.style.opacity = (0.15 + 0.85 * e).toFixed(3);
      }
    };

    const onScroll = () => {
      if (!inView || raf) return;
      raf = requestAnimationFrame(apply);
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false;
        if (inView) apply();
      },
      { rootMargin: "25% 0px 25% 0px" },
    );
    io.observe(grid);

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [gridRef]);
}

export function HowItWorks() {
  const gridRef = useRef<HTMLDivElement>(null);
  useBentoSettle(gridRef);

  return (
    <Section id="how-it-works" className="hairline-top relative overflow-hidden">
      <ParallaxGlow speed={0.55} intensity={12} />

      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>How It Works</Eyebrow>
          <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-foreground md:text-4xl lg:text-[2.75rem]">
            Verified before contact. Autonomous through settlement.
          </h2>
          <p className="mt-7 font-sans text-base leading-relaxed text-secondary-foreground">
            Corridor One X does not digitise the old way of trading. Identity is cleared before a deal begins, terms are locked in a signed LOI, and payment sits in licensed escrow until delivery is confirmed.
          </p>
        </Reveal>
      </div>

      {/* 5 columns so the 3/2 and 2/3 split lands cleanly on both rows. */}
      <div ref={gridRef} className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 120} className={s.span}>
            {s.layout === "wide" ? (
              <WideCard step={s} />
            ) : s.layout === "stack" ? (
              <StackCard step={s} />
            ) : (
              <SplitCard step={s} />
            )}
          </Reveal>
        ))}
      </div>

      {/*
        Three peer cards rather than a bulleted list inside one wrapper.

        The list read as a footnote to the bento above it: same visual weight as
        body copy, stacked vertically, wrapped in a box that made it look like an
        aside. These are three equal claims, so they get three equal cards, laid
        out on the same horizontal axis as the grid above and wrapping to one
        column only when the viewport forces it.
      */}
      <Reveal delay={160}>
        <div className="mt-20">
          <h3 className="text-center font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
            What the matching actually does
          </h3>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aiLines.map((line, i) => (
              <div
                key={line}
                className="flex h-full flex-col rounded-2xl border border-border bg-card/50 p-7 transition-colors duration-500 hover:border-accent/40 hover:bg-elevated"
              >
                <span className="font-display text-xs tracking-[0.08em] text-accent uppercase">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span aria-hidden className="mt-3 block h-[3px] w-8 rounded-full bg-accent" />
                <p className="mt-5 font-sans text-sm leading-relaxed text-secondary-foreground md:text-base">
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
