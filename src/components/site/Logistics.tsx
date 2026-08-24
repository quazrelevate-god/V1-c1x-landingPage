import { Ship, Plane, Truck } from "lucide-react";
import { Eyebrow, ParallaxGlow, Parallax, Reveal, Section } from "./primitives";
import { WorldCorridorMap } from "./WorldCorridorMap";
import { SeaDiagram, AirDiagram, RoadDiagram } from "./TransportDiagrams";


const modes = [
  {
    icon: Ship,
    title: "Seaways",
    body: "Bulk port-to-port shipping.",
    diagram: SeaDiagram,
  },
  {
    icon: Plane,
    title: "Airways",
    body: "Air freight for time-sensitive cargo.",
    diagram: AirDiagram,
  },
  {
    icon: Truck,
    title: "Roadways",
    body: "Overland and last-mile transport.",
    diagram: RoadDiagram,
  },
];

function ModeCard({ m, delay }: { m: (typeof modes)[number]; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div
        className="group h-full overflow-hidden rounded-lg border border-border bg-card/70 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:bg-elevated"
      >
        <div className="relative h-64 border-b border-border bg-background/60 p-6 opacity-85 transition-opacity duration-500 group-hover:opacity-100 md:h-80">
          <m.diagram />
        </div>
        <div className="p-7">
          <m.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
          <h3 className="mt-6 font-display text-lg font-medium tracking-tight text-foreground">{m.title}</h3>
          <p className="mt-2 font-sans text-sm text-muted-foreground">{m.body}</p>
        </div>
      </div>
    </Reveal>
  );
}


export function Logistics() {
  return (
    <div className="corridor-glow-center glow-animate">
      <Section id="logistics" className="relative overflow-hidden">
        <ParallaxGlow speed={0.5} intensity={13} />
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>Every Way Goods Move</Eyebrow>
            <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-foreground md:text-4xl lg:text-[2.75rem]">
              A deal is only closed when the goods arrive. We track every route.
            </h2>
            <p className="mt-7 font-sans text-base leading-relaxed text-secondary-foreground">
              Commodities move by sea, by air, and by road. Corridor One X tracks the shipment across whichever mode
              fits the commodity, the volume, and the timeline, and holds escrow until delivery is confirmed.
            </p>
          </Reveal>
        </div>

        <Parallax speed={-0.06} className="mt-16 grid gap-4 md:grid-cols-3">
          {modes.map((m, i) => (
            <ModeCard key={m.title} m={m} delay={i * 130} />
          ))}
        </Parallax>

        <Reveal delay={120}>
          <div className="mt-16 overflow-hidden rounded-lg border border-border bg-card/40 p-6 md:p-10">
            <h3 className="font-display text-2xl tracking-[-0.03em] text-foreground md:text-3xl">Global Corridors</h3>

            <div className="mt-8">
              <WorldCorridorMap />
            </div>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-14">
              <div>
                <p className="font-display text-[0.72rem] uppercase tracking-[0.02em] text-muted-foreground">
                  Active now
                </p>
                <p className="mt-3 flex items-center gap-3 font-display text-base tracking-tight text-foreground">
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: "#9CAD1F" }} />
                  India · Middle East · Africa
                </p>
              </div>
              <div>
                <p className="font-display text-[0.72rem] uppercase tracking-[0.02em] text-muted-foreground">
                  Coming soon
                </p>
                <p className="mt-3 flex items-center gap-3 font-display text-base tracking-tight text-secondary-foreground">
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full bg-transparent"
                    style={{ border: "1px solid #5E6B2A" }}
                  />
                  Europe · Australia
                </p>
              </div>
            </div>

            <p className="mt-8 font-sans text-sm text-muted-foreground">
              New corridors activate on verified trader demand.
            </p>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
