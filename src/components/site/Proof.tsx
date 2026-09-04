import { useEffect, useRef, useState } from "react";

type Stat = {
  target: number;
  format: (v: number) => string;
  label: string;
};

const stats: Stat[] = [
  { target: 2.1, format: (v) => `$${v.toFixed(1)}M`, label: "moved through escrow" },
  { target: 27, format: (v) => Math.round(v).toString(), label: "deals settled end to end" },
  { target: 84, format: (v) => Math.round(v).toString(), label: "verified traders" },
  { target: 9, format: (v) => Math.round(v).toString(), label: "corridors live" },
];

const COUNT_MS = 1800;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function useSectionInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function StatCounter({ stat, active }: { stat: Stat; active: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / COUNT_MS, 1);
      setValue(stat.target * easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, stat.target]);

  return (
    <div>
      <p className="font-display text-5xl leading-none font-medium tracking-[-0.04em] text-ink tabular-nums sm:text-6xl md:text-7xl">
        {stat.format(value)}
      </p>
      <p className="mt-4 font-sans text-sm leading-relaxed text-ink/60 sm:text-base">
        {stat.label}
      </p>
    </div>
  );
}

export function Proof() {
  const { ref, inView } = useSectionInView<HTMLElement>(0.3);

  return (
    <section
      ref={ref}
      id="proof"
      data-nav-tone="light"
      /*
       * Reads as one section with Where You Sit below it, not two.
       *
       * It used `--light-surface` (#EDEFEA) while the section below used
       * `--light-surface-alt` (#F4F1EC). The first has a cool green cast, so the
       * boundary showed as a visible band change. Both now share the warmer token.
       *
       * Bottom padding is deliberately small: the gap between the figures and the
       * next heading was doing nothing but separating two things that belong
       * together.
       */
      className="relative overflow-hidden bg-light-surface-alt px-5 pt-24 pb-10 text-ink sm:px-6 sm:pt-28 sm:pb-12 md:pt-32"
    >
      {/* Centred, not left-set: four figures ranged left in a wide grid left a
          large void on the right of each column. */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-12 text-center sm:gap-x-12 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCounter key={s.label} stat={s} active={inView} />
        ))}
      </div>
    </section>
  );
}
