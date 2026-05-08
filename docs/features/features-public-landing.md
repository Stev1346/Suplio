# Public Landing Page Feature Plan

## Overview

Ship a **public marketing home page** at `/` that explains Suplio to **working DJs** (primary audience). Copy and layout must read like event-night collateral—clear, energetic, and trustworthy—not engineering documentation.

This feature is **additive**: it fixes the current missing root route (404 on `/`) and does not change DJ auth, guest flows, APIs, or data policies unless explicitly scoped in a later phase (e.g. analytics).

Product positioning aligns with [`docs/project-description.md`](../project-description.md): QR-based song requests, guest voting (where applicable), DJ dashboard control, crowd engagement, and fewer booth interruptions.

## Product Behavior

### Audience and tone

- **Primary reader:** DJs evaluating whether Suplio fits their gigs.
- **Voice:** Professional, energetic, simple, event-focused (see project description **Product Identity**).
- **Forbidden on-page copy:** Developer or infrastructure jargon (framework names, databases, auth primitives, test tooling, sprint terminology). Implementation details belong only in **Traceability** below for engineers.

### Page sections (DJ-facing narrative)

1. **Hero**
   - Product name **Suplio** and tagline **Suplio! Scan. Request. Vote.**
   - One-line value: guests use their phones to join the night’s song flow without crowding the booth; you stay in control.
   - Primary CTA: **Create account** → `/dj/signup`
   - Secondary CTA: **Log in** → `/dj/login`

2. **Why Suplio (outcomes)**
   - Fewer interruptions at the booth
   - More crowd engagement
   - Clear control over what hits the queue

3. **How it works — Guests**
   - Scan the event code / QR
   - Request songs (fair-use limits explained in plain language if referenced)
   - Vote on what should play next (for standard song-request nights)

4. **How it works — You (DJ)**
   - Sign up and set up your profile
   - Create and manage events from your dashboard
   - Review incoming requests and run the night your way (accept, skip, mark played—wording matches shipped product UX)

5. **Karaoke nights (optional subsection)**
   - Short note: Suplio supports karaoke-style nights with a singer queue (who’s on now, who’s next)—describe **what DJs experience**, not internal mode names unless the UI uses them verbatim.

6. **Pricing**
   - Visible **DJ pricing** section with tier cards (name, price, billing period if applicable, bullets for what’s included).
   - **Tier names, prices, limits, and refund/copy rules are finalized in Phase 0** and reflected here before build.
   - Use everyday language for limits (e.g. “events per month,” “priority email support”)—no stack or schema references.

7. **Footer**
   - Repeat CTAs (Create account / Log in)
   - Optional: link to support email or social—only if real and maintained.

### Cross-cutting

- **Responsive:** Mobile-first; readable at ~375px through desktop.
- **Accessibility:** Visible focus, semantic headings, sufficient contrast, respect `prefers-reduced-motion` for any motion.
- **SEO / sharing:** Sensible `<title>` and meta description (aligned with hero—may extend root [`layout.tsx`](../../src/frontend/app/layout.tsx) metadata or page-level metadata).
- **Privacy:** Landing does not collect PII beyond normal analytics cookies if analytics is added later (out of scope unless Phase 5 explicitly adds it).
- **Navigation:** Marketing header should not expose authenticated DJ nav; links stay on marketing + `/dj/*` entry points.

## Implementation Phases

### Phase 0 - Content and pricing lock-in

**Goal:** Approve all customer-facing copy and pricing before UI build.

**Scope**

- Final hero, outcome bullets, guest/DJ steps, karaoke blurb.
- Pricing: tier count, names, currency, amounts, billing cadence, inclusion bullets, “most popular” tier if used, FAQ bullets if needed.
- Sign-off note (name/date or “self-review”) in sprint notes or this doc.

**Definition of Done**

- [ ] Hero + tagline + CTAs approved.
- [ ] Outcome and “how it works” copy approved (DJ-readable).
- [ ] Pricing table approved (numbers + inclusions).
- [ ] Explicit list of words/phrases to avoid on the page (jargon checklist).

### Phase 1 - Root route and page shell

**Goal:** `/` resolves with a stable shell shared by landing sections.

**Scope**

- Add [`src/frontend/app/page.tsx`](../../src/frontend/app/page.tsx) (or equivalent App Router root page).
- Optional: `routes.home = "/"` in [`src/frontend/lib/shared/constants/routes.ts`](../../src/frontend/lib/shared/constants/routes.ts).
- Marketing-appropriate header/footer (reuse or lightly extend [`AppHeader`](../../src/frontend/components/ui/AppHeader.tsx) / [`PageShell`](../../src/frontend/components/ui/PageShell.tsx) without breaking `/dj` or guest shells).

**Definition of Done**

- [ ] Navigating to `/` returns 200 (no blank root).
- [ ] DJ app routes (`/dj`, `/dj/login`, `/dj/signup`) unchanged in behavior.
- [ ] Guest event routes unchanged.

### Phase 2 - Hero and value proposition

**Goal:** Above-the-fold communicates Suplio in under ~10 seconds.

**Scope**

- Hero layout, headline, subcopy, primary/secondary buttons wired to signup/login.

**Definition of Done**

- [ ] CTAs navigate correctly.
- [ ] Layout matches mobile + desktop breakpoints.
- [ ] Copy matches Phase 0 approval.

### Phase 3 - How it works and DJ benefits

**Goal:** DJs understand guest behavior and their own control surface.

**Scope**

- Two-column or stacked sections for Guest vs DJ flows.
- Optional icons or simple illustrations (placeholder SVG/icon set acceptable).

**Definition of Done**

- [ ] Sections reflect Phase 0 copy.
- [ ] No jargon on rendered page (spot-check against checklist).

### Phase 4 - Pricing tiers UI

**Goal:** Pricing section matches approved commercial structure.

**Scope**

- Tier cards ([`card.tsx`](../../src/frontend/components/ui/card.tsx) / shadcn patterns).
- Highlight recommended tier if applicable.

**Definition of Done**

- [ ] All tiers from Phase 0 rendered accurately (price + bullets).
- [ ] Mobile: cards stack legibly; no horizontal trap scroll.

### Phase 5 - CTAs, footer, metadata

**Goal:** Conversion paths and discoverability.

**Scope**

- Footer CTAs and minimal links.
- Page or layout metadata: title, description, Open Graph basics if desired.

**Definition of Done**

- [ ] Repeated signup/login paths in footer/header as designed.
- [ ] Metadata present and human-readable (view source / devtools).

### Phase 6 - Polish, ops, and launch

**Goal:** Production-ready UX and documentation.

**Scope**

- Motion/copy polish, a11y pass, visual QA.
- Update [`docs/runbook-regression.md`](../runbook-regression.md) with a short **Marketing / root** row (e.g. `/` loads, CTAs work).
- Update [`docs/project-description.md`](../project-description.md) **Current Delivered Scope** when sprint completes.

**Definition of Done**

- [ ] `npm run lint`, `npm run build`, and `npm run test:qa` pass from `src/frontend` per sprint standards.
- [ ] Regression runbook includes landing smoke checks.
- [ ] Project description lists public landing as delivered.

## Acceptance Criteria (Feature Complete)

This feature is complete when all statements are true:

- [ ] `/` serves the full marketing landing (not 404).
- [ ] Page explains Suplio to DJs without developer/infrastructure jargon in visible copy.
- [ ] Hero uses approved tagline and outcome messaging.
- [ ] Guest and DJ “how it works” sections match Phase 0 copy.
- [ ] Pricing section reflects approved tiers and amounts.
- [ ] Primary CTA goes to `/dj/signup`; secondary to `/dj/login`.
- [ ] Responsive layouts work at mobile, tablet, and desktop breakpoints.
- [ ] Accessibility basics satisfied (headings, focus, contrast, reduced motion for animations if any).
- [ ] No regressions in `/dj/*` private/public flows or `/event/*` guest flows.
- [ ] Documentation and regression checklist updated.

## Validation Checklist

### Visual and UX

- [ ] `/` loads without layout broken assets.
- [ ] Hero readable on 375px width; CTAs tappable.
- [ ] Pricing readable; no clipped text at common breakpoints.

### CTAs

- [ ] **Create account** → `/dj/signup`.
- [ ] **Log in** → `/dj/login`.

### Copy review

- [ ] No forbidden jargon on rendered page (frameworks, databases, internal codenames).
- [ ] Karaoke subsection matches product truth (queue-style nights).

### Regression

- [ ] `/dj/dashboard` behavior unchanged for authenticated DJs.
- [ ] Sample `/event/[eventCode]` guest flow unchanged after landing ships.

### Automated checks

- [ ] `npm run lint`, `npm run build`, `npm run test:qa` from `src/frontend`.

## Traceability

### Likely impacted frontend areas

- [`src/frontend/app/page.tsx`](../../src/frontend/app/page.tsx) — new root page.
- [`src/frontend/features/landing/`](../../src/frontend/features/) — suggested folder for section components (hero, pricing, footer).
- [`src/frontend/components/ui/PageShell.tsx`](../../src/frontend/components/ui/PageShell.tsx), [`AppHeader.tsx`](../../src/frontend/components/ui/AppHeader.tsx), [`Button`](../../src/frontend/components/ui/Button.tsx), shadcn `Card`.
- [`src/frontend/lib/shared/constants/routes.ts`](../../src/frontend/lib/shared/constants/routes.ts) — optional `home`.
- [`src/frontend/app/layout.tsx`](../../src/frontend/app/layout.tsx) — metadata adjustments if global.

### Documentation

- Sprint tracker: [`docs/sprints/sprint-2026-06-public-landing.md`](../sprints/sprint-2026-06-public-landing.md)
- Post-delivery updates: [`docs/project-description.md`](../project-description.md), [`docs/runbook-regression.md`](../runbook-regression.md)
