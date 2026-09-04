import { Ship, Plane, Truck } from "lucide-react";
import { Eyebrow, ParallaxGlow, Reveal, Section } from "./primitives";
import { WorldCorridorMap } from "./WorldCorridorMap";
import { SeaDiagram, AirDiagram, RoadDiagram } from "./TransportDiagrams";


const modes = [
  {
    icon: Ship,
    title: "Sea",
    body: "Bulk, port to port.",
    diagram: SeaDiagram,
  },
  {
    icon: Plane,
    title: "Air",
    body: "Time-sensitive cargo.",
    diagram: AirDiagram,
  },
  {
    icon: Truck,
    title: "Road",
    body: "Overland and last mile.",
    diagram: RoadDiagram,
  },
];

/*
 * One mode, shown as the animation itself.
 *
 * The icon / title / body footer that used to sit under each diagram is gone —
 * three stacked cards each with a 320px diagram plus a text block made this
 * section two or three screens tall for three words of copy. The label now rides
 * on the artwork behind a bottom scrim, so the whole set fits one screen.
 */
function ModeTile({
  m,
  className = "",
}: {
  m: (typeof modes)[number];
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card/70 transition-colors duration-500 hover:border-accent/40 ${className}`}
    >
      <div className="absolute inset-0 p-6 opacity-85 transition-opacity duration-500 group-hover:opacity-100">
        <m.diagram />
      </div>

      {/* Scrim only under the label, so the diagram stays legible above it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <m.icon className="h-4 w-4 text-accent" strokeWidth={2} />
          <h3 className="font-display text-base font-medium tracking-tight text-foreground">
            {m.title}
          </h3>
        </div>
        <p className="mt-1 font-sans text-[0.75rem] text-muted-foreground sm:text-sm">{m.body}</p>
      </div>
    </div>
  );
}


export function Logistics() {
  return (
    <div className="corridor-glow-center glow-animate">
      <Section id="corridors" className="relative overflow-hidden">
        <ParallaxGlow speed={0.5} intensity={13} />
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>Every Way Goods Move</Eyebrow>
            <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-foreground md:text-4xl lg:text-[2.75rem]">
              A deal is closed when the goods arrive. We track every route.
            </h2>
            <p className="mt-7 font-sans text-base leading-relaxed text-secondary-foreground">
              Commodities move by sea, air and road. Corridor One X tracks the shipment on whichever mode fits the cargo, the volume and the timeline — and holds escrow until delivery is confirmed.
            </p>
          </Reveal>
        </div>

        {/* 2x2: sea spans the top row, air and road share the bottom. */}
        <Reveal delay={120}>
          <div className="mt-16 grid grid-cols-2 gap-3 sm:gap-4">
            <ModeTile m={modes[0]!} className="col-span-2 h-56 sm:h-72 lg:h-80" />
            <ModeTile m={modes[1]!} className="h-44 sm:h-60 lg:h-64" />
            <ModeTile m={modes[2]!} className="h-44 sm:h-60 lg:h-64" />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-16 overflow-hidden rounded-lg border border-border bg-card/40 p-6 md:p-10">
            <h3 className="font-display text-2xl tracking-[-0.03em] text-foreground md:text-3xl">
              Global Corridors
            </h3>

            <div className="mt-8">
              <WorldCorridorMap />
            </div>

            {/* The "Live now" label and the corridor pills were removed: the map
                already names the live regions, so the list restated it and made
                the card twice as tall for no extra information. */}
            <p className="mt-8 font-sans text-sm text-muted-foreground">
              New corridors open on verified trader demand.
            </p>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
