import { useRef, useState } from "react";
import { Eyebrow, Parallax, Reveal } from "./primitives";
import { ProducersDiagram, ExportersDiagram, ImportersDiagram } from "./AudienceDiagrams";

const audiences = [
  {
    label: "Producers",
    title: "You produced it. Sell it directly.",
    diagram: ProducersDiagram,
    points: [
      "If you harvest, extract, or manufacture the commodity yourself, you don't need to be an exporter.",
      "Reach verified buyers directly, with no trader in between.",
      "Move low-volume or aging stock before it loses value.",
    ],
  },
  {
    label: "Exporters",
    title: "Stop chasing unverified buyers.",
    diagram: ExportersDiagram,
    points: [
      "Verified buyers with real intent on record.",
      "Get paid through escrow before you take on risk.",
      "Build a Trust Score that travels with you.",
    ],
  },
  {
    label: "Importers",
    title: "Stop wiring money into hope.",
    diagram: ImportersDiagram,
    points: [
      "Verified suppliers with a proven track record.",
      "Quality and documents checked before release.",
      "Funds released only on confirmed delivery.",
    ],
  },
];

function TiltCard({ a }: { a: (typeof audiences)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<string>("");

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(max-width: 767px), (prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setStyle(
      `perspective(1000px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg) translate3d(0,-6px,0)`,
    );
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setStyle("")}
      style={{ transform: style, transition: "transform 600ms cubic-bezier(0.16,1,0.3,1)" }}
      className="h-full overflow-hidden rounded-lg border border-ink/12 bg-light-surface will-change-transform hover:border-ink/30"
    >
      <div className="relative h-64 bg-background p-6 md:h-96">
        <a.diagram />
        <p className="absolute bottom-0 left-0 p-5 font-display text-[0.72rem] tracking-[0.02em] text-accent uppercase">
          {a.label}
        </p>
      </div>
      <div className="p-8">
        <h3 className="font-display text-xl leading-snug font-medium tracking-tight text-ink">{a.title}</h3>
        <ul className="mt-6 space-y-3">
          {a.points.map((p, i) => (
            <Reveal key={p} delay={i * 120}>
              <li className="flex gap-3 font-sans text-sm leading-relaxed text-ink/70">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {p}
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function WhoItsFor() {
  return (
    <section id="who-its-for" className="relative overflow-hidden bg-light-surface-alt px-5 py-20 text-ink sm:px-6 sm:py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow tone="light">Who It's For</Eyebrow>
            <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-ink md:text-4xl lg:text-[2.75rem]">
              One platform. Three sides of the same deal.
            </h2>
          </Reveal>
        </div>

        <Parallax speed={-0.06} className="mt-16 grid gap-6 md:grid-cols-3">
          {audiences.map((a, i) => (
            <Reveal key={a.label} delay={i * 130}>
              <TiltCard a={a} />
            </Reveal>
          ))}
        </Parallax>
      </div>
    </section>
  );
}
