import { Search, Gauge, Repeat, ShieldAlert, Radar, Fingerprint, LineChart } from "lucide-react";
import { Eyebrow, Reveal, Section } from "./primitives";
import { XMark } from "./XMark";
import RadialOrbitalTimeline, { type TimelineItem } from "@/components/ui/radial-orbital-timeline";

const nodes: TimelineItem[] = [
  {
    id: 1,
    title: "Ingest",
    date: "Step 01",
    category: "Matches on more than commodity.",
    content:
      "The AI weighs commodity type, grade, volume, corridor, price expectation, and trust history together, not just a keyword search. It finds counterparties a manual search would miss.",
    icon: Search,
    relatedIds: [2, 7],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "Verify",
    date: "Step 02",
    category: "Works only with verified data.",
    content:
      "Every listing and requirement entering the model is tied to a verified entity, so matches are built on facts the network has already checked.",
    icon: Fingerprint,
    relatedIds: [1, 3],
    status: "completed",
    energy: 95,
  },
  {
    id: 3,
    title: "Score",
    date: "Step 03",
    category: "Ranks by likelihood to close.",
    content:
      "Every match is scored on fit and on both parties' verified track records, so the strongest, safest deals surface first.",
    icon: Gauge,
    relatedIds: [2, 4],
    status: "in-progress",
    energy: 88,
  },
  {
    id: 4,
    title: "Screen",
    date: "Step 04",
    category: "Flags risk before it costs you.",
    content:
      "The AI reads patterns across verified trade data to surface counterparty and delivery risk early, so a deal is protected before it's signed, not after it fails.",
    icon: ShieldAlert,
    relatedIds: [3, 5],
    status: "in-progress",
    energy: 80,
  },
  {
    id: 5,
    title: "Price",
    date: "Step 05",
    category: "Reads the corridor's real pricing.",
    content:
      "Live signals from closed trades across the network give both sides a grounded price band, so negotiation starts from evidence rather than guesswork.",
    icon: LineChart,
    relatedIds: [4, 6],
    status: "pending",
    energy: 72,
  },
  {
    id: 6,
    title: "Monitor",
    date: "Step 06",
    category: "Works while you don't.",
    content:
      "The market moves constantly. The AI monitors it continuously and alerts you the moment a matching, verified opportunity appears.",
    icon: Radar,
    relatedIds: [5, 7],
    status: "pending",
    energy: 65,
  },
  {
    id: 7,
    title: "Learn",
    date: "Step 07",
    category: "Learns from every closed deal.",
    content:
      "Each completed transaction sharpens the model: better matches, better pricing signals, better risk detection with every deal on the platform.",
    icon: Repeat,
    relatedIds: [6, 1],
    status: "pending",
    energy: 58,
  },
];

export function HowAiWorks() {
  return (
    <div className="corridor-glow-center glow-animate">
      <Section id="how-the-ai-works" className="hairline-top">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>The Intelligence Layer</Eyebrow>
            <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-foreground md:text-4xl lg:text-[2.75rem]">
              The AI behind every match.
            </h2>
            <p className="mt-7 font-sans text-base leading-relaxed text-secondary-foreground">
              Corridor One X doesn't wait for you to find the right counterparty. Its AI reads every verified
              listing, requirement, and Trust Score across the network, and surfaces the deals that actually fit,
              ranked by how likely they are to close.
            </p>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <RadialOrbitalTimeline timelineData={nodes} centerNode={<XMark className="h-7 w-7 text-accent" />} />
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-2 max-w-3xl border-l-2 border-accent pl-8 font-display text-xl leading-snug font-medium tracking-[-0.03em] text-accent md:text-2xl">
            You decide the deal. The AI makes sure the right one reaches you.
          </p>
        </Reveal>
      </Section>
    </div>
  );
}
