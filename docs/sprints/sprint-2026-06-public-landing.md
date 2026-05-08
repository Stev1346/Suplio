# Sprint Tracker: 2026-06 Public Landing Page

This file tracks delivery for the **DJ-focused public marketing landing** at `/`, including pricing for DJs and non-technical copy. Application behavior for authenticated DJs and guests remains unchanged unless explicitly scoped in the feature plan.

Related docs:

- Feature plan: [`../features/features-public-landing.md`](../features/features-public-landing.md)
- Project description: [`../project-description.md`](../project-description.md)
- Regression runbook: [`../runbook-regression.md`](../runbook-regression.md)
- Deploy runbook: [`../deploy.md`](../deploy.md)

---

## Sprint Board

**Sprint status:** Complete (2026-05-08).

**Phase 0 sign-off:** Self-reviewed copy, pricing, and jargon checklist; aligned with `src/frontend/features/landing/content.ts` (2026-05-08).

### In Progress

- _None._

### Backlog

- _None._

---

### Done

#### Phase 0 - Content and pricing lock-in

**Definition of Done**

- [x] Hero + tagline + CTAs approved.
- [x] Outcome and “how it works” copy approved (DJ-readable).
- [x] Pricing table approved (numbers + inclusions).
- [x] Jargon checklist for visible copy agreed (no developer/infrastructure terms on page).

#### Phase 1 - Root route and page shell

**Definition of Done**

- [x] `/` returns 200 with landing shell (no root 404).
- [x] `/dj`, `/dj/login`, `/dj/signup` behavior unchanged.
- [x] Guest `/event/*` flows unchanged.

#### Phase 2 - Hero and value proposition

**Definition of Done**

- [x] Hero layout, headline, subcopy match Phase 0.
- [x] Primary CTA → `/dj/signup`; secondary → `/dj/login`.

#### Phase 3 - How it works and DJ benefits

**Definition of Done**

- [x] Guest and DJ sections match Phase 0 copy.
- [x] Karaoke subsection accurate for DJs (plain language).

#### Phase 4 - Pricing tiers UI

**Definition of Done**

- [x] All pricing tiers from Phase 0 rendered (cards/stack).
- [x] Mobile layout readable; no broken overflow.

#### Phase 5 - CTAs, footer, metadata

**Definition of Done**

- [x] Footer/header CTAs as designed.
- [x] Title and meta description (and optional OG) set.

#### Phase 6 - Polish, ops, and launch

**Definition of Done**

- [x] `npm run lint`, `npm run build`, and `npm run test:qa` pass from `src/frontend` (2026-05-08; see [`../runbook-regression.md`](../runbook-regression.md) for recorded results).
- [x] [`docs/runbook-regression.md`](../runbook-regression.md) updated with landing smoke checks.
- [x] [`docs/project-description.md`](../project-description.md) **Current Delivered Scope** updated.

---

### Blocked

- _None._

---

## Current Phase Start Checklist

### Sprint kickoff

- [x] Confirm Phase 0 pricing and copy sign-off before Phase 1 UI work.
- [x] Confirm whether analytics or tracking pixels are in scope (default: none until explicitly added).
- [x] Reserve time for regression pass including new `/` rows at end of Phase 6.

---

## Validation Checklist (Sprint Exit)

- [x] `/` loads full landing; no 404 at root.
- [x] Visible copy contains no developer/infrastructure jargon (spot-check vs Phase 0 checklist).
- [x] Pricing matches Phase 0 approval.
- [x] CTAs route to `/dj/signup` and `/dj/login`.
- [x] Responsive check: ~375px, ~768px, ~1280px.
- [x] Keyboard focus visible on interactive elements; headings logical order.
- [x] Core regression rows in [`docs/runbook-regression.md`](../runbook-regression.md) still pass (guest + DJ sections).
- [x] Documentation set is consistent: feature plan, this sprint, project description scope.
