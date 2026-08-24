import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Eyebrow, Reveal, Section } from "./primitives";

const faqs = [
  {
    q: "How is my identity actually protected?",
    a: "Identities, contact details, and company names are masked end-to-end during discovery and negotiation. They are revealed only after escrow is funded and circumvention protection is signed.",
  },
  {
    q: "What stops a counterparty from going around me after one deal?",
    a: "Circumvention protection locks every deal to the platform after the LOI, and going around it costs a trader their Trust Score.",
  },
  {
    q: "How does the escrow actually work?",
    a: "Funds are held in licensed escrow and released only on confirmed delivery, with milestone-based release and a dispute window.",
  },
  {
    q: "What does the Trust Score measure?",
    a: "Verified, closed-loop signals only: identity, trade history, on-time delivery, and dispute rate.",
  },
  {
    q: "Which commodities and corridors do you support?",
    a: "Agriculture, food, crude oil, and minerals. India-Gulf corridors are live now.",
  },
  {
    q: "What does it cost?",
    a: "Book a demo for current pricing.",
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
