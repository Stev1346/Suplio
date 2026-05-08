# Sprint Tracker: 2026-05 Custom Event Designs

This file tracks delivery for the **Custom Event Designs** feature ([IDEA-001](../backlog-ideas.md)). Scope is custom event code (vanity slug, edit-twice cap), custom event color (guest theming), QR design picker, downloadable QR PNG, corner Scan popup, and a guest queue filter on the Vote page (`song_request` mode). Karaoke, auth, RLS, lifecycle, and existing request/vote behavior are unchanged unless a phase explicitly extends them.

**Subscription tier gating is intentionally deferred to [IDEA-009](../backlog-ideas.md).** Phase 0 lands a single tier-gate helper (returns `true` today) so the eventual gate flip is one file.

This sprint runs **ahead of** the unstarted [`sprint-2026-05-onboarding.md`](sprint-2026-05-onboarding.md) and [`sprint-2026-06-public-landing.md`](sprint-2026-06-public-landing.md); those trackers remain in their **Not started** state and are picked up after this one.

Related docs:

- Feature plan: [`../features/features-custom-event-designs.md`](../features/features-custom-event-designs.md)
- Backlog: [`../backlog-ideas.md`](../backlog-ideas.md) (IDEA-001)
- Project description: [`../project-description.md`](../project-description.md)
- Regression runbook: [`../runbook-regression.md`](../runbook-regression.md)
- Deploy runbook: [`../deploy.md`](../deploy.md)
- Tier-gating follow-up: [IDEA-009](../backlog-ideas.md)

---

## Sprint Board

Use this board to move phases through execution.

**Sprint status:** In progress (Phase 0 active).

### In Progress

#### Phase 0 - Discovery and decisions

**Target duration:** 0.5-1.0 day

**Definition of Done**

- [ ] QR library decision recorded with rationale (`qrcode.react` + design wrapper vs `qr-code-styling`).
- [ ] Custom event code rules frozen (regex, min/max length, case handling, reserved-word list, uniqueness scope).
- [ ] Edit-counter mechanic and audit-log shape documented (column name, decrement-only-on-change rule).
- [ ] Color contrast / fallback policy documented (threshold + per-surface fallback rule).
- [ ] Curated QR design preset list approved.
- [ ] Tier-gate helper file path and signature documented (single flip point for [IDEA-009](../backlog-ideas.md)).
- [ ] Feature flag name and default documented (extend [`src/frontend/lib/shared/config/feature-flags.ts`](../../src/frontend/lib/shared/config/feature-flags.ts) with a `NEXT_PUBLIC_ENABLE_*` entry).
- [ ] PNG download resolution and filename pattern documented.

---

### Backlog

#### Phase 1 - Data model and types

**Target duration:** 0.5 day

**Definition of Done**

- [ ] Idempotent migration adds `events.event_color`, `events.qr_design`, and `events.event_code_edits_remaining` (default `2`).
- [ ] Existing events remain valid after migration (defaults applied).
- [ ] [`src/frontend/types/database.ts`](../../src/frontend/types/database.ts) is updated with new fields (`Row`, `Insert`, `Update`).
- [ ] No regression to existing reads/writes that ignore the new fields.

#### Phase 2 - Event creation flow

**Target duration:** 1.0-1.5 days

**Definition of Done**

- [ ] [`CreateEventForm.tsx`](../../src/frontend/features/dj/dashboard/components/CreateEventForm.tsx) captures optional custom code, color, and QR design.
- [ ] [`/api/dj/events`](../../src/frontend/app/api/dj/events/route.ts) validates and persists new fields (custom code regex / reserved / uniqueness checks per Phase 0).
- [ ] Tier-gate helper is referenced at the API boundary (returns `true` today).
- [ ] [`useCreateEvent`](../../src/frontend/hooks/dj/useCreateEvent.ts) and [`lib/client/api/events.ts`](../../src/frontend/lib/client/api/events.ts) carry new fields.
- [ ] Event creation without any new fields still works (backwards compatible).

#### Phase 3 - Event management edits + edit-twice rule

**Target duration:** 1.0-1.5 days

**Definition of Done**

- [ ] [`DjEventControlsCard.tsx`](../../src/frontend/features/dj/events/components/DjEventControlsCard.tsx) supports editing custom code, color, and QR design.
- [ ] **Edits remaining** is surfaced for the custom code; UI hides / disables the editor at `0`.
- [ ] API decrements `event_code_edits_remaining` only on a successful actual code change.
- [ ] API rejects code edit when counter is `0`.
- [ ] `dj_audit_log` entries emitted for each code / color / QR-design change.

#### Phase 4 - Guest event theming

**Target duration:** 0.5-1.0 day

**Definition of Done**

- [ ] Guest event layout under [`src/frontend/app/(guest)/event/[eventCode]/`](../../src/frontend/app/(guest)/event/[eventCode]/) applies `event_color` via CSS custom properties.
- [ ] Affected surfaces (CTAs, headings, focus rings, accent areas) reflect the chosen color.
- [ ] Contrast fallback engages for poor-contrast colors per Phase 0 policy.
- [ ] DJ shells, auth pages, and marketing surfaces are unaffected.
- [ ] No new hydration warnings on guest event pages.

#### Phase 5 - QR designs + PNG download

**Target duration:** 1.0-1.5 days

**Definition of Done**

- [ ] All curated QR designs render on [`ScanScreen.tsx`](../../src/frontend/features/guest/event/scan/ScanScreen.tsx) and DJ surfaces ([`CreatedEventInfo.tsx`](../../src/frontend/features/dj/events/components/CreatedEventInfo.tsx), [`DjEventControlsCard.tsx`](../../src/frontend/features/dj/events/components/DjEventControlsCard.tsx)).
- [ ] **Download QR (PNG)** CTA works on the DJ event-management surface and the guest Scan page.
- [ ] PNG resolution and filename pattern match Phase 0 decisions.
- [ ] Default behavior (no design selected) renders the existing basic QR.

#### Phase 6 - Scan popup + guest queue filter

**Target duration:** 0.5-1.0 day

**Definition of Done**

- [ ] Corner QR icon visible on guest event pages while `live`; opens Scan in a Radix dialog without navigation.
- [ ] Popup is keyboard-operable (focus trap + Escape) and respects reduced motion.
- [ ] Underlying page state (e.g. partially typed request) survives popup close.
- [ ] Icon hidden on `ended` / `archived` (matches `EventOver`).
- [ ] [`VoteScreen.tsx`](../../src/frontend/features/guest/event/vote/VoteScreen.tsx) gains an All / Active only / Played only filter; default **All** matches current behavior.
- [ ] Filter is client-only (no API changes).
- [ ] Karaoke pages unchanged.

#### Phase 7 - QA, regression, and documentation

**Target duration:** 0.5-1.0 day

**Definition of Done**

- [ ] `npm run lint`, `npm run build`, and `npm run test:qa` from `src/frontend` pass.
- [ ] [`docs/runbook-regression.md`](../runbook-regression.md) updated with rows for: custom code create + edit, color theming, QR design switch, PNG download, scan popup, queue filter.
- [ ] [`docs/project-description.md`](../project-description.md) **Current Delivered Scope** updated.
- [ ] [`docs/deploy.md`](../deploy.md) lists the new feature flag env var (and any others introduced this sprint).
- [ ] Backlog row for [IDEA-001](../backlog-ideas.md) flipped to **Done**.

---

### Blocked

- _None._

---

### Done

- _None._

---

## Current Phase Start Checklist

### Sprint kickoff

- [ ] Confirm tier-gate deferral approach (single helper today; flipped by [IDEA-009](../backlog-ideas.md)).
- [ ] Confirm feature flag default for Preview vs Production (recommended: on in Preview, off in Production until Phase 7 sign-off).
- [ ] Reserve time for the Phase 7 regression pass with the new runbook rows.

### Phase 0 entry

- [ ] Identify the QR rendering library to use (carry-forward decision in sprint notes).
- [ ] Draft the custom event code regex + reserved-word list.
- [ ] Draft the QR design preset list (names + visual brief) for sign-off.
- [ ] Draft the contrast threshold and per-surface fallback rule.

---

## Validation Checklist (Sprint Exit)

- [ ] DJ can create an event with optional custom code, color, and QR design; defaults preserved when omitted.
- [ ] DJ can edit custom code up to 2 times; further attempts blocked at API + UI.
- [ ] DJ can change color and QR design freely from event management.
- [ ] Guest event pages reflect the chosen color; non-event surfaces unaffected.
- [ ] All curated QR designs render correctly across DJ and guest surfaces.
- [ ] **Download QR (PNG)** works on both DJ and guest surfaces.
- [ ] Corner Scan popup opens / closes correctly with keyboard support and reduced-motion compliance.
- [ ] Vote page filter shows **All / Active only / Played only**; default behavior unchanged; karaoke unchanged.
- [ ] Feature flag off = no new UI; current flows behave as today.
- [ ] No regressions in DJ, karaoke, lifecycle, auth, or guest core flows.
- [ ] Documentation set is consistent: feature plan, this sprint, regression runbook, deploy runbook, project description.
