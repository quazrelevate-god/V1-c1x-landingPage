# Content Architecture — Landing Page Restructure

**Mandate: content and structure only. Do not touch design.**

This document is the source of truth for the landing page rewrite. Implement it exactly.
Where this document and the existing copy disagree, this document wins.

---

## 0. HARD CONSTRAINTS — read before editing anything

Do NOT change, under any circumstances:

- `src/styles.css`, design tokens, any colour, font, radius or spacing value
- The hero scroll-scrub mechanics in `Hero.tsx` (video seek loop, `SCRUB_END`, `OUTRO_AT`,
  `DIM_AT`, the reveal bands, the mobile/reduced-motion fork). Copy strings only.
- `primitives.tsx` — `useStickyProgress`, `useThemeDial`, `ParallaxGlow`, `Reveal`, `Eyebrow`
- Any existing animation timing, easing curve, or scroll band constant
- The light/dark theme dial behaviour driven by `Approach.tsx`'s `useThemeDial`
  ⚠️ `Approach.tsx` is being deleted — the `useThemeDial` ref MUST be re-attached to the new
  `HowItWorks.tsx` wrapper at the same position in the page, or the whole page stops
  transitioning from dark to light.

New sections reuse existing layout patterns. Do not invent new visual treatments.

---

## 1. PLACEHOLDER REGISTER

Every value below is **fabricated** and exists only so layout and spacing are real.
Search for `PLACEHOLDER` before any deploy. None of these may ship.

| Token | Placeholder value | Where |
|---|---|---|
| Escrow value moved | `$18.4M` | Proof |
| Deals settled | `63` | Proof |
| Verified traders | `214` | Proof |
| Corridors live | `9` | Proof, Hero trust line |
| Release at loading | `30%` / `2 business days` | Money |
| Release at documents | `40%` / `2 business days` | Money |
| Release at delivery | `30%` / `3 business days` | Money |
| Escrow partner | `[ESCROW PARTNER — NOT YET SUPPLIED]` | Money, FAQ Q1 |
| Jurisdiction / licence | `[JURISDICTION — NOT YET SUPPLIED]` | FAQ Q1 |
| Trader testimonial | `[TESTIMONIAL — NOT YET SUPPLIED]` | Proof |
| Dispute process | `[DISPUTE PROCESS — NOT YET SUPPLIED]` | FAQ Q5 |
| Corridor list | see §7 | Corridors |

**Do not invent a company name for the escrow partner, and do not write a testimonial
or attribute one to a person.** Render those as the literal bracket strings above.
A fabricated financial institution or a fabricated named quote on a live page is a
materially different problem from a placeholder number.

---

## 2. FILE PLAN

### Create
| File | Contents |
|---|---|
| `src/components/site/Proof.tsx` | New section 02 |
| `src/components/site/HowItWorks.tsx` | New section 05 — absorbs three components |
| `src/components/site/Money.tsx` | New section 06 — absorbs TrustProtection |

### Delete
| File | Reason |
|---|---|
| `src/components/site/WhyUs.tsx` | Investor copy, moves to About |
| `src/components/site/Approach.tsx` | Absorbed into HowItWorks |
| `src/components/site/HowAiWorks.tsx` | Absorbed into HowItWorks |
| `src/components/site/DealFlow.tsx` | Absorbed into HowItWorks |
| `src/components/site/TrustProtection.tsx` | Absorbed into Money |

### Keep — copy edits only
`Hero.tsx`, `Problem.tsx`, `WhoItsFor.tsx`, `Logistics.tsx`, `Faq.tsx`, `FinalCta.tsx`,
`Footer.tsx`, `Nav.tsx`

### Keep — diagram assets, re-wired not rewritten
`ApproachDiagrams.tsx`, `DealFlowIcons.tsx`, `AudienceDiagrams.tsx`,
`TransportDiagrams.tsx`, `ProblemDiagrams.tsx`, `WorldCorridorMap.tsx`, `XMark.tsx`

`ApproachDiagrams.tsx` already exports exactly five diagrams and the new How It Works has
exactly five steps. Map them:

```
01 Verify          -> VerifyDiagram
02 Match           -> MatchingDiagram
03 Agree           -> AutonomousDiagram
04 Secure          -> EscrowDiagram
05 Move and settle -> SettlementDiagram
```

---

## 3. SECTION ORDER — `src/routes/index.tsx`

```tsx
<Nav />
<Hero />          {/* id="top"           */}
<Proof />         {/* id="proof"         */}
<WhoItsFor />     {/* id="who-its-for"   */}
<Problem />       {/* id="problem"       */}
<HowItWorks />    {/* id="how-it-works"  <- carries useThemeDial */}
<Money />         {/* id="money"         */}
<Logistics />     {/* id="corridors"     */}
<Faq />           {/* id="faq"           */}
<FinalCta />
<Footer />
```

### Nav links — `Nav.tsx`

The current `links` array points at three anchors that no longer exist. Replace with:

```ts
const links = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Money",        href: "/#money" },
  { label: "Corridors",    href: "/#corridors" },
  { label: "Who It's For", href: "/#who-its-for" },
  { label: "FAQ",          href: "/#faq" },
  { label: "About",        href: "/about" },
];
```

`Logistics.tsx` currently renders `id="logistics"` — change to `id="corridors"`.
The hero ghost button `/#how-it-works` stays valid.

---

## 4. SEO — `src/routes/index.tsx`

Title unchanged. Description loses the India–Gulf restriction:

> Corridor One X connects verified producers, exporters, and importers directly. AI matching,
> autonomous settlement, and escrow-secured payment across live global commodity corridors.

---

## 5. COPY

### 01 · Hero — `Hero.tsx`

Two string constants change. Nothing else in this file.

**Headline** (unchanged):
> Trade direct. Settle certain. No unverified hands in between.

**Subhead** — final sentence removed:
> Corridor One X connects verified producers, exporters, and importers directly. AI matching, autonomous settlement, and escrow-secured payment.

**Buttons** (unchanged): `Book a Demo` · `See How It Works`

**Trust line** — currently says "India–Gulf corridor", which contradicts Logistics:
> Built for traders moving cross-border volume in agriculture, food, energy, and minerals across 9 live corridors. <!-- PLACEHOLDER: 9 -->

---

### 02 · Proof — `Proof.tsx` (NEW)

Dark section. Sits immediately under the hero. Replaces the placeholder logo bar concept
entirely — **do not build a logo strip**.

**Eyebrow:** Settled, Not Projected

**Headline:** Every number here is a deal that closed.

**Figures** — four, in a row, tabular numerals:
- `$18.4M` moved through escrow  <!-- PLACEHOLDER -->
- `63` deals settled end to end  <!-- PLACEHOLDER -->
- `214` verified traders  <!-- PLACEHOLDER -->
- `9` corridors live  <!-- PLACEHOLDER -->

**Under-line:**
> No projections, no pipeline, no letters of intent. Settled transactions only.

**Testimonial block:**
```
"[TESTIMONIAL — NOT YET SUPPLIED]"
[NAME], [ROLE], [COMPANY] — [CORRIDOR]
```
Build the block so it renders correctly when filled. Do not write a quote.

---

### 03 · Where You Sit — `WhoItsFor.tsx`

Moves from position 8 to position 3. Layout unchanged, three columns, existing
`AudienceDiagrams` retained.

**Eyebrow:** Where You Sit

**Headline:** One deal. Three sides. The same protection on each.

**Producers — "You produced it. Sell it yourself."**
- Reach verified buyers with no trader in between.
- You do not need to be an exporter to reach an export market.
- Move ageing or low-volume stock before it loses value.

**Exporters — "Buyers whose money is already committed."**
- Every buyer verified before they reach you.
- Escrow funded before you load.
- A Trust Score that follows you into the next deal.

**Importers — "Stop wiring money into hope."**
- Suppliers with a settled track record, not a reference letter.
- Documents and quality checked before release.
- Funds move on delivery, not on promise.

---

### 04 · The Status Quo — `Problem.tsx`

Keep the typewriter headline treatment and the three-card stack exactly as built.
Only the `headline`, `body` and `cards` constants change.

**Eyebrow:** The Status Quo

**Headline** (unchanged — do not retype, the typewriter timing is tuned to it):
> Multi-crore deals. Still closed on a phone call and blind trust.

**Body** — replaces the 68-word third-person paragraph:
> You found the counterparty through someone who knows someone. You checked what you could check. Then you shipped, and waited to see whether the money arrived. That is how most cross-border commodity trade still works — and when it fails, there is no recourse. Only a loss you absorb.

**Cards** (diagram mapping unchanged):
1. No verified identity behind the name on the contract. → `UnverifiedIdentityDiagram`
2. No recourse when the deal breaks mid-transaction. → `NoRecourseDiagram`
3. No infrastructure built for cross-border SME commodity trade. → `NoInfrastructureDiagram`

---

### 05 · How It Works — `HowItWorks.tsx` (NEW)

Absorbs `Approach.tsx` + `HowAiWorks.tsx` + `DealFlow.tsx`.
Reuse `Approach.tsx`'s pinned-intro structure and its `PillarCard` layout for the five steps.
**Attach `useThemeDial` to this component's outer wrapper.**

**Eyebrow:** How It Works

**Headline:** Verified before contact. Autonomous through settlement.

**Intro** — cut from five sentences to two:
> Corridor One X does not digitise the old way of trading. Identity is cleared before a deal begins, terms are locked in a signed LOI, and payment sits in licensed escrow until delivery is confirmed.

**Steps — five, replacing the nine-step DealFlow:**

**01 Verify**
> Every party clears KYC and KYB before they can see a listing or post one. Licences, GST, bank details and trade references, checked against source.

**02 Match**
> You post what you hold or what you need. The AI ranks counterparties on grade, volume, corridor, price expectation and settled history — not keywords. Identities stay masked on both sides.

**03 Agree**
> Both sides negotiate through a masked relay and sign a digital LOI. Contract directly, or through Corridor One X as principal. Neither name is revealed yet.

**04 Secure**
> The buyer funds escrow. Only then are identities exchanged. Samples route through us if you want to inspect first, so nothing is exposed before the money is committed.

**05 Move and settle**
> Goods ship by sea, air or road — yours to arrange, or ours end to end with the seller still masked. Documents are verified at each milestone and escrow releases against them.

The four dropped steps are not lost: samples and the dual LOI structure are clauses in 03
and 04, the logistics choice is a clause in 05.

**AI sub-block** — replaces all seven `HowAiWorks` cards with three lines:

Heading: **What the matching actually does**
- Weighs grade, volume, corridor, price band and settled history together — not keyword search.
- Ranks by likelihood to close, using both parties' verified records.
- Prices from live signals in closed trades, so negotiation starts from evidence rather than a guess.

Dropped as unverifiable by a reader: "works while you don't", "learns from every closed deal",
"flags risk before it costs you", "works only with verified data" (already covered by step 01).

---

### 06 · Money — `Money.tsx` (NEW)

Light section. Inherits `TrustProtection.tsx`'s light treatment and three-column structure.
This section answers two of the three objections that lose deals.

**Eyebrow:** Money

**Headline:** What it costs, and when you get paid.

**Block A — Cost**
> **Nothing until a deal closes.**
> No subscription. No listing fee. Nothing to search, nothing to negotiate. One fee, charged at settlement, on a deal that actually completed. If it does not close, you owe nothing.

**Block B — Cash flow**
> **Escrow is not a holding pen.**
> Funds release against milestones, not all at the end.

Render as a three-row table, tabular numerals, horizontally scrollable on mobile:

| Trigger | Released | Seller sees it |
|---|---|---|
| Verified loading | 30% | 2 business days |
| Shipping documents verified | 40% | 2 business days |
| Delivery confirmed | Remainder | 3 business days |

<!-- PLACEHOLDER: every value in the table above -->

> A dispute window sits before final release. Every movement is on an audit trail either side can pull.

**Block C — Custody**
> Funds sit in licensed, segregated escrow accounts held by [ESCROW PARTNER — NOT YET SUPPLIED]. They are never on Corridor One X's balance sheet.

**Block D — Trust Score** (demoted from headline element to supporting mechanic)
> A single number every trader carries, 0 to 1000. Identity and KYC 30%, trade history 30%, on-time delivery 25%, dispute rate 15%. Built only from settled deals on the platform. It cannot be bought, and it does not reset.

Keep the existing Trust Score meter/bar visual from `TrustProtection.tsx` — it is the one
piece of that component worth carrying over.

---

### 07 · Corridors — `Logistics.tsx`

Change `id="logistics"` to `id="corridors"`. Keep `WorldCorridorMap` and `TransportDiagrams`.

**Eyebrow:** Every Way Goods Move

**Headline:** A deal is closed when the goods arrive. We track every route.

**Body:**
> Commodities move by sea, air and road. Corridor One X tracks the shipment on whichever mode fits the cargo, the volume and the timeline — and holds escrow until delivery is confirmed.

**Modes:**
- **Sea** — bulk, port to port.
- **Air** — time-sensitive cargo.
- **Road** — overland and last mile.

**Corridors:**
> Live now: India–UAE · India–Saudi Arabia · India–Oman · India–Qatar · India–Kenya · India–Singapore · India–Netherlands · India–Australia · India–South Africa. New corridors open on verified trader demand.

<!-- PLACEHOLDER: entire corridor list. Must match the count used in Hero and Proof. -->

⚠️ The corridor count appears in three places: Hero trust line, Proof figures, and this list.
They must agree. Define the list once and derive the count.

---

### 08 · FAQ — `Faq.tsx`

Six items become five. Trust Score moves to §06, commodities/corridors to §07.

**Eyebrow:** Questions, Answered
**Headline:** The things every trader asks us first.

**Q1 — Who is actually holding my money?**
> [ESCROW PARTNER — NOT YET SUPPLIED], in licensed and segregated accounts, under [JURISDICTION — NOT YET SUPPLIED]. Corridor One X never takes custody of funds and cannot move them outside the milestone schedule.

**Q2 — What does it cost?**
> One fee, charged at settlement, on deals that close. No subscription, no listing fee, nothing to browse or negotiate. If a deal does not complete, you owe nothing.

**Q3 — Is my money locked up until delivery?**
> No. Escrow releases in stages against verified milestones — loading, documents, delivery — so a seller is paid progressively rather than at the end.

**Q4 — How is my identity protected, and what stops a counterparty going around me?**
> Names, contacts and company details are masked end to end through discovery and negotiation, and revealed only once escrow is funded. Circumvention protection then locks the deal to the platform, and going around it costs a trader their Trust Score — which is the only thing that gets them their next deal.

**Q5 — What happens when a deal goes wrong?**
> [DISPUTE PROCESS — NOT YET SUPPLIED] — who reviews it, on what evidence, how long it takes, and what each side can recover.

Q5 does not exist on the current page. It is the question every trader who has been burned
once will ask, and its absence is conspicuous.

---

### 09 · Final CTA — `FinalCta.tsx`

**Headline** (unchanged): The infrastructure for certain trade.

**Body:**
> Whether you move 50 tonnes or 5,000, you get the same verification, the same protection, and the same direct access to the market.

**Button:** Book a Demo

**Reassurance** — replaces "A 20-minute walkthrough… No obligation.":
> Twenty minutes. We walk one closed deal end to end, with the real numbers.

---

### Footer — `Footer.tsx`

Tagline currently reads "Next-generation trade infrastructure for India & the Gulf."
Change to:
> Corridor One X — next-generation infrastructure for verified commodity trade.

---

## 6. DEFINITION OF DONE

- [ ] `npm run build` (or `bun run build`) passes with no type errors
- [ ] Five deleted components removed and all imports cleaned from `index.tsx`
- [ ] `useThemeDial` re-attached to `HowItWorks.tsx` — page still transitions dark → light → dark
- [ ] Every nav link resolves to a live anchor; no dead `#trust` or `#logistics`
- [ ] Hero scrub still seeks correctly on desktop; mobile fork unchanged
- [ ] `grep -rn "India–Gulf\|India-Gulf" src/` returns nothing
- [ ] `grep -rn "PLACEHOLDER\|NOT YET SUPPLIED" src/` returns every item in §1 and nothing else
- [ ] No change to `styles.css`, tokens, or any animation constant

---

*Content architecture v1. Every figure is a placeholder pending real data.*
