import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Eyebrow, Reveal, Section } from "./primitives";

const faqs = [
  {
    q: "Who is actually holding my money?",
    a: "A licensed, regulated escrow partner, in segregated client accounts. Corridor One X never takes custody of funds and cannot move them outside the milestone schedule. Full custody, partner and jurisdiction details are walked through on the demo call.",
  },
  {
    q: "What does it cost?",
    a: "One fee, charged at settlement, on deals that close. No subscription, no listing fee, nothing to browse or negotiate. If a deal does not complete, you owe nothing.",
  },
  {
    q: "Is my money locked up until delivery?",
    a: "No. Escrow releases in stages against verified milestones — loading, documents, delivery — so a seller is paid progressively rather than at the end.",
  },
  {
    q: "How is my identity protected, and what stops a counterparty going around me?",
    a: "Names, contacts and company details are masked end to end through discovery and negotiation, and revealed only once escrow is funded. Circumvention protection then locks the deal to the platform, and going around it costs a trader their Trust Score — which is the only thing that gets them their next deal.",
  },
  {
    q: "What happens when a deal goes wrong?",
    a: "A dispute pauses the release schedule while both sides submit evidence — shipping documents, quality reports, inspection records. The platform reviews the evidence against the LOI terms and issues a decision. The full dispute policy — reviewers, timelines, recovery and appeal — is walked through on the demo call.",
  },
];

export function Faq() {
  return (
    <Section id="faq" className="hairline-top">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <Reveal>
          <Eyebrow>Questions, Answered</Eyebrow>
          <h2 className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.03em] text-foreground md:text-4xl">
            The things every trader asks us first.
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-border">
                <AccordionTrigger className="py-6 text-left font-display text-base font-medium tracking-tight text-foreground hover:no-underline data-[state=open]:text-accent">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 font-sans text-sm leading-relaxed text-secondary-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </Section>
  );
}
