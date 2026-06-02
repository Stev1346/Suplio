# Sprint Tracker: 2026-08 Onboarding (DJ + Guest)

This file tracks delivery for first-run onboarding ([IDEA-010](../backlog-ideas.md)) for **DJs** (post-auth dashboard and related flows) and **Guests** (event pages under `/event/[eventCode]`). The sprint also includes **guest return-to-event navbar navigation** and **route-aware document titles** — both **always on** when implemented (not gated by `NEXT_PUBLIC_ENABLE_ONBOARDING`). Standard song-request, karaoke, auth, and RLS behavior remain unchanged unless Phase 1 explicitly adds `dj_profiles` fields and matching server updates.

**Related sprint order:** Custom Event Designs is **complete** — see [`sprint-2026-07-custom-event-designs.md`](sprint-2026-07-custom-event-designs.md). **This sprint is active.**

Related docs:

- Feature plan: [`../features/features-onboarding.md`](../features/features-onboarding.md)
- Backlog: [`../backlog-ideas.md`](../backlog-ideas.md) (IDEA-010)
- Project description: [`../project-description.md`](../project-description.md)
- Regression runbook: [`../runbook-regression.md`](../runbook-regression.md)
- Deploy runbook: [`../deploy.md`](../deploy.md)

---

## Sprint Board

Use this board to move phases through execution.

**Sprint status:** **Active** (Phase 0 — UX discovery and success metrics, started 2026-06-02).

### In Progress

#### Phase 0 - UX discovery and success metrics
**Target duration:** 0.5-1.0 day
**Started:** 2026-06-02

**Definition of Done**
- [ ] DJ onboarding storyboard documented (screens + step order + copy intent).
- [ ] Guest onboarding storyboard documented with lifecycle and mode branches.
- [ ] Exit criteria documented per persona.
- [ ] Analytics event names listed (`onboarding_started`, `step_viewed`, `completed`, `skipped` with `persona=dj|guest`); implementation optional.
- [ ] Accessibility expectations documented (keyboard, focus, reduced motion).
- [ ] Copy and step order reviewed (sign-off note in feature doc or sprint notes).
- [ ] Return-to-event link storyboard and visibility rules documented.
- [ ] Document title template matrix reviewed and signed off.

---

### Backlog

#### Phase 1 - Technical approach and state model
**Target duration:** 0.5-1.0 day

**Definition of Done**
- [ ] Decision recorded: DJ persistence (`dj_profiles` vs auth metadata), guest persistence (`localStorage`/cookie keys), versioning, QA reset policy.
- [ ] Data shape specified (column names or storage keys).
- [ ] Privacy note for guest storage scope.
- [ ] Feature flag name and env var documented (extend centralized feature flags).
- [ ] Documented ordering vs email verification and private `/dj/*` routes (no security bypass).
- [ ] Last-guest-event storage keys documented (`last_guest_event_code`, optional name).

#### Phase 2 - Shared onboarding primitives (frontend)
**Target duration:** 1.0-1.5 days

**Definition of Done**
- [ ] Shared step configuration type and runner implemented (provider or hooks).
- [ ] Keyboard and skip/close paths verified; mobile tap targets acceptable.
- [ ] Unit tests for completion/skip/version logic where non-trivial.
- [ ] Step progression avoids fragile effect-driven setState patterns.

#### Phase 3 - DJ onboarding implementation
**Target duration:** 1.0-2.0 days

**Definition of Done**
- [ ] DJ onboarding shows per eligibility + `onboarding_version` when feature flag is on.
- [ ] Skip and Done persist state per Phase 1 decision.
- [ ] Mid-flow navigation does not break app or strand UI.
- [ ] Playwright/E2E coverage for complete and skip paths (env-gated if required).
- [ ] Manual smoke: flag off = no DJ onboarding; auth and verification gates unchanged.

#### Phase 4 - Guest onboarding implementation
**Target duration:** 1.0-2.0 days

**Definition of Done**
- [ ] Guest onboarding triggers per first-visit/version rules; not on every in-event navigation.
- [ ] Mode-aware (`song_request` vs `karaoke`) and lifecycle-aware (`draft`/`live`/`ended`/`archived`) behavior matches feature plan.
- [ ] Automated test coverage for at least one guest path.
- [ ] No unacceptable LCP/layout-shift regression.
- [ ] Return-to-event link on home and DJ entry when valid last event exists; hidden otherwise (always on).

#### Phase 5 - Polish, ops, and launch
**Target duration:** 0.5-1.0 day

**Definition of Done**
- [ ] `npm run lint`, `npm run build`, and `npm run test:qa` pass from `src/frontend`.
- [ ] [`docs/runbook-regression.md`](../runbook-regression.md) updated with DJ + guest onboarding checks.
- [ ] [`docs/project-description.md`](../project-description.md) **Current Delivered Scope** updated.
- [ ] Feature flag off = zero onboarding UI, no errors.
- [ ] Optional: in-app replay entry ("?"); optional analytics wiring per Phase 0.
- [ ] Per-route `metadata.title` implemented per Phase 0 matrix (always on).
- [ ] Return-to-event and document-title regression rows pass.

---

### Blocked

- _None._

---

### Done

- _None._

---

## Current Phase Start Checklist

### Sprint kickoff
- [ ] Confirm target branch strategy and feature flag default for Preview vs Production.
- [ ] Confirm Phase 1 persistence choice before large UI work (avoid rework).
- [ ] Reserve time for regression pass using updated runbook rows at end of Phase 5.

### Phase 0 entry
- [ ] Draft DJ onboarding storyboard (screens, step order, copy intent).
- [ ] Draft guest onboarding storyboard with lifecycle (`draft`/`live`/`ended`/`archived`) and mode (`song_request`/`karaoke`) branches.
- [ ] Document exit criteria per persona (DJ vs guest).
- [ ] List analytics event names (`onboarding_started`, `step_viewed`, `completed`, `skipped` with `persona=dj|guest`).
- [ ] Document accessibility expectations (keyboard, focus, reduced motion).
- [ ] Review copy and step order; add sign-off note in feature doc or sprint notes.
- [ ] Draft return-to-event link UX (label, visibility, default destination).
- [ ] Draft document title template matrix for guest, DJ, and marketing routes.

---

## Validation Checklist (Sprint Exit)

- [ ] Feature flag toggles onboarding on/off with no console errors.
- [ ] DJ: complete flow persists; skip persists; version bump can re-show tour.
- [ ] DJ: unverified users still follow existing verification behavior; onboarding does not leak private data.
- [ ] Guest: first visit shows onboarding; repeat visit in same browser does not (unless version bump).
- [ ] Guest: `draft` event messaging matches Scan-only product behavior.
- [ ] Guest: `live` + `song_request` explains Request and Vote appropriately.
- [ ] Guest: `live` + `karaoke` explains Request List; no vote-first onboarding copy.
- [ ] Guest: `ended` / `archived` behavior matches Phase 0 storyboard.
- [ ] Keyboard and reduced-motion behavior spot-checked on mobile and desktop.
- [ ] Core regression rows in [`docs/runbook-regression.md`](../runbook-regression.md) still pass (guest + DJ sections).
- [ ] Documentation set is consistent: feature plan, this sprint, project description scope.
- [ ] Guest: visit event → home via Suplio logo → return link restores correct event (always on).
- [ ] Guest: visit event → Are you a DJ? → DJ login → return link still available (always on).
- [ ] No return link on `/` or DJ login when no prior guest event (incognito / cleared storage).
- [ ] Guest Scan / Request / Vote (or Karaoke) tabs show distinct titles including event name.
- [ ] DJ login and dashboard tabs are not generic `"Suplio"` only.
- [ ] Return link and document titles work when onboarding flag is off.
