import { useRef, useState } from "react";
import { Eyebrow, Parallax, Reveal } from "./primitives";
import { ProducersDiagram, ExportersDiagram, ImportersDiagram } from "./AudienceDiagrams";

const audiences = [
  {
    label: "Producers",
    title: "You produced it. Sell it yourself.",
    diagram: ProducersDiagram,
    points: [
      "Reach verified buyers with no trader in between.",
      "You do not need to be an exporter to reach an export market.",
      "Move ageing or low-volume stock before it loses value.",
    ],
  },
  {
    label: "Exporters",
    title: "Buyers whose money is already committed.",
    diagram: ExportersDiagram,
    points: [
      "Every buyer verified before they reach you.",
      "Escrow funded before you load.",
      "A Trust Score that follows you into the next deal.",
    ],
  },
  {
    label: "Importers",
    title: "Stop wiring money into hope.",
    diagram: ImportersDiagram,
    points: [
      "Suppliers with a settled track record, not a reference letter.",
      "Documents and quality checked before release.",
      "Funds move on delivery, not on promise.",
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
    // Top padding trimmed and the background matched to Proof above, so the
    // figures and this block read as one continuous section rather than two.
    <section id="who-its-for" data-nav-tone="light" className="relative overflow-hidden bg-light-surface-alt px-5 pt-10 pb-20 text-ink sm:px-6 sm:pt-12 sm:pb-24 md:pb-32">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
          <Reveal>
            <Eyebrow tone="light">Where You Sit</Eyebrow>
            <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-ink md:text-4xl lg:text-[2.75rem]">
              One deal. Three sides. The same protection on each.
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
