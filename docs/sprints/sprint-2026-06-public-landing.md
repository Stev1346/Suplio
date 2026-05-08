# Sprint Tracker: 2026-06 Public Landing Page

This file tracks delivery for the **DJ-focused public marketing landing** at `/`, including pricing for DJs and non-technical copy. Application behavior for authenticated DJs and guests remains unchanged unless explicitly scoped in the feature plan.

Related docs:

- Feature plan: [`../features/features-public-landing.md`](../features/features-public-landing.md)
- Project description: [`../project-description.md`](../project-description.md)
- Regression runbook: [`../runbook-regression.md`](../runbook-regression.md)
- Deploy runbook: [`../deploy.md`](../deploy.md)

---

## Sprint Board

Use this board to move phases through execution.

**Sprint status:** Not started (all phases in Backlog).

### In Progress

- _None._

---

### Backlog

#### Phase 0 - Content and pricing lock-in

**Target duration:** 0.5-1.0 day

**Definition of Done**

- [ ] Hero + tagline + CTAs approved.
- [ ] Outcome and “how it works” copy approved (DJ-readable).
- [ ] Pricing table approved (numbers + inclusions).
- [ ] Jargon checklist for visible copy agreed (no developer/infrastructure terms on page).

#### Phase 1 - Root route and page shell

**Target duration:** 0.5-1.0 day

**Definition of Done**

- [ ] `/` returns 200 with landing shell (no root 404).
- [ ] `/dj`, `/dj/login`, `/dj/signup` behavior unchanged.
- [ ] Guest `/event/*` flows unchanged.

#### Phase 2 - Hero and value proposition

**Target duration:** 0.5 day

**Definition of Done**

- [ ] Hero layout, headline, subcopy match Phase 0.
- [ ] Primary CTA → `/dj/signup`; secondary → `/dj/login`.

#### Phase 3 - How it works and DJ benefits

**Target duration:** 0.5-1.0 day

**Definition of Done**

- [ ] Guest and DJ sections match Phase 0 copy.
- [ ] Karaoke subsection accurate for DJs (plain language).

#### Phase 4 - Pricing tiers UI

**Target duration:** 0.5-1.0 day

**Definition of Done**

- [ ] All pricing tiers from Phase 0 rendered (cards/stack).
- [ ] Mobile layout readable; no broken overflow.

#### Phase 5 - CTAs, footer, metadata

**Target duration:** 0.25-0.5 day

**Definition of Done**

- [ ] Footer/header CTAs as designed.
- [ ] Title and meta description (and optional OG) set.

#### Phase 6 - Polish, ops, and launch

**Target duration:** 0.5-1.0 day

**Definition of Done**

- [ ] `npm run lint`, `npm run build`, and `npm run test:qa` pass from `src/frontend`.
- [ ] [`docs/runbook-regression.md`](../runbook-regression.md) updated with landing smoke checks.
- [ ] [`docs/project-description.md`](../project-description.md) **Current Delivered Scope** updated.

---

### Blocked

- _None._

---

### Done

- _None._

---

## Current Phase Start Checklist

### Sprint kickoff

- [ ] Confirm Phase 0 pricing and copy sign-off before Phase 1 UI work.
- [ ] Confirm whether analytics or tracking pixels are in scope (default: none until explicitly added).
- [ ] Reserve time for regression pass including new `/` rows at end of Phase 6.

---

## Validation Checklist (Sprint Exit)

- [ ] `/` loads full landing; no 404 at root.
- [ ] Visible copy contains no developer/infrastructure jargon (spot-check vs Phase 0 checklist).
- [ ] Pricing matches Phase 0 approval.
- [ ] CTAs route to `/dj/signup` and `/dj/login`.
- [ ] Responsive check: ~375px, ~768px, ~1280px.
- [ ] Keyboard focus visible on interactive elements; headings logical order.
- [ ] Core regression rows in [`docs/runbook-regression.md`](../runbook-regression.md) still pass (guest + DJ sections).
- [ ] Documentation set is consistent: feature plan, this sprint, project description scope.
