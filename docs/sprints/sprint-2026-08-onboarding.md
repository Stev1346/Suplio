# Sprint Tracker: 2026-08 Onboarding (DJ + Guest)

This file tracks delivery for first-run onboarding ([IDEA-010](../backlog-ideas.md)) for **DJs** (post-auth dashboard and related flows) and **Guests** (event pages under `/event/[eventCode]`). The sprint also includes **guest return-to-event navbar navigation** and **route-aware document titles** — both **always on** when implemented (not gated by `NEXT_PUBLIC_ENABLE_ONBOARDING`). Standard song-request, karaoke, auth, and RLS behavior remain unchanged unless Phase 3 applies the documented `dj_profiles` migration.

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

**Sprint status:** **Active** (Phase 2 — shared onboarding primitives, started 2026-06-02).

### Phase 0 Decisions (locked)

- **UI pattern:** Hybrid — modal for narrative steps; spotlight for at most two in-context steps per persona (stable selectors).
- **Rationale:** Keeps lifecycle/mode copy in modals; spotlights anchor “Create event” (DJ) and optional guest nav without fragile multi-page tours.
- **DJ entry:** `/dj/dashboard` only, after auth + verification gates — see Phase 1 auth ordering.
- **DJ exit:** **Done** on step 6 only; no Skip on steps 1–5; dismiss without Done does not persist → re-show on next eligible dashboard visit.
- **DJ steps:** 6 (see full storyboard in [`features-onboarding.md`](../features/features-onboarding.md#dj-onboarding-storyboard)).
- **Guest trigger:** First visit to any `/event/[eventCode]/*` while flag on and global guest key unset.
- **Guest scope:** Global per browser per `onboarding_version` (not per `eventCode`).
- **Guest skip:** Skippable on every step (contrast with DJ must-complete).
- **Guest `ended` / `archived`:** Suppress onboarding (`EventOver` only).
- **Return-to-event (always on):**
  - Label: `Return to {EventName}` (`events.name` else `event_code`)
  - Show on: `/`, `/dj`, `/dj/login`, `/dj/signup` when valid stored code
  - Hide on: guest event routes; missing/invalid storage
  - Href: last subpath (`scan` \| `request` \| `vote` \| `karaoke-list`); fallback Scan
  - Storage keys: `suplio:last_guest_event_code`, `suplio:last_guest_event_name`, `suplio:last_guest_event_subpath`
- **Document title matrix:** Signed off 2026-06-02 — unchanged patterns in feature plan.
- **Analytics (names only):** `onboarding_started`, `onboarding_step_viewed`, `onboarding_completed`, `onboarding_skipped` — vendor deferred to Phase 5.
- **Accessibility:** Modal focus trap + Escape (DJ dismiss without complete); spotlight `aria-describedby`; `prefers-reduced-motion` instant transitions; DJ overlay non-blocking for emergency nav.
- **Phase 0 sign-off:** 2026-06-02 — self-review; choices per sprint AskQuestion.

---

### Phase 1 Decisions (locked)

- **DJ persistence:** `dj_profiles.onboarding_completed_at`, `dj_profiles.onboarding_version_seen` (integer, default `0`).
- **Guest persistence:** `localStorage` — `suplio:guest_onboarding_version_seen`, `suplio:guest_onboarding_status` (`completed` \| `skipped`); global per browser.
- **Last-event keys:** `suplio:last_guest_event_code`, `suplio:last_guest_event_name`, `suplio:last_guest_event_subpath` (always on; Phase 4 wire).
- **Version:** `ONBOARDING_VERSION = 1` (integer constant; Phase 2 file).
- **Feature flag:** `NEXT_PUBLIC_ENABLE_ONBOARDING` → `featureFlags.onboarding`; unset = `false`; Preview/local `true` for dev; Production `false` until Phase 5; wire Phase 2.
- **Auth order:** [`proxy.ts`](../../src/frontend/proxy.ts) verification before private `/dj/*`; onboarding additive on `/dj/dashboard` only.
- **Migration:** Spec `20260602120000_onboarding_dj_profiles.sql` — **apply Phase 3** with DJ UI; regenerate `database.ts`.
- **API (Phase 3):** Prefer dedicated onboarding PATCH; extend profile GET.
- **QA reset:** DJ — null `onboarding_completed_at`, `onboarding_version_seen = 0`; Guest — clear five `suplio:*` keys.
- **Phase 1 sign-off:** 2026-06-02 — docs only; no app/migration commits in this phase.

---

### In Progress

#### Phase 2 - Shared onboarding primitives (frontend)
**Target duration:** 1.0-1.5 days
**Started:** 2026-06-02

**Definition of Done**
- [ ] Shared step configuration type and runner implemented (provider or hooks).
- [ ] Keyboard and skip/close paths verified; mobile tap targets acceptable.
- [ ] Unit tests for completion/skip/version logic where non-trivial.
- [ ] Step progression avoids fragile effect-driven setState patterns.

---

### Backlog

#### Phase 3 - DJ onboarding implementation
**Target duration:** 1.0-2.0 days

**Definition of Done**
- [ ] Apply migration `20260602120000_onboarding_dj_profiles.sql` and sync `database.ts`.
- [ ] DJ onboarding shows per eligibility + `onboarding_version` when feature flag is on.
- [ ] Done on step 6 persists completion; dismiss-without-Done re-shows; guest Skip/Done per Phase 1 model.
- [ ] Mid-flow navigation does not break app or strand UI.
- [ ] Playwright/E2E coverage for complete and dismiss/re-show paths (env-gated if required).
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

#### Phase 1 - Technical approach and state model

**Completed:** 2026-06-02  
**Notes:** Locked decisions in **Phase 1 Decisions (locked)** above. Full ADR in [`features-onboarding.md`](../features/features-onboarding.md#phase-1-decisions-locked): `dj_profiles` columns, five `suplio:*` localStorage keys, `ONBOARDING_VERSION = 1`, feature flag rollout, proxy auth ordering, QA reset, migration SQL spec deferred to Phase 3 apply. No `feature-flags.ts`, migration, or UI commits in this phase.

**Definition of Done**

- [x] Decision recorded: DJ persistence (`dj_profiles`), guest persistence (`localStorage` keys), versioning, QA reset policy.
- [x] Data shape specified (column names or storage keys).
- [x] Privacy note for guest storage scope.
- [x] Feature flag name and env var documented (extend centralized feature flags in Phase 2).
- [x] Documented ordering vs email verification and private `/dj/*` routes (no security bypass).
- [x] Last-guest-event storage keys documented (`suplio:last_guest_event_*`).

#### Phase 0 - UX discovery and success metrics

**Completed:** 2026-06-02  
**Notes:** Locked decisions in **Phase 0 Decisions (locked)** above. Authoritative storyboards, exit criteria, analytics names, accessibility baseline, return-to-event rules, and document title sign-off in [`features-onboarding.md`](../features/features-onboarding.md) (sections from **Phase 0 Decisions (locked)** through **Document title matrix (signed off)**). DJ: 6-step hybrid tour, dashboard-only entry, must-complete with re-show on dismiss. Guest: global browser scope, skippable, suppress on `ended`/`archived`. Return link: `Return to {EventName}` → last subpath. No app code in this phase.

**Definition of Done**

- [x] DJ onboarding storyboard documented (screens + step order + copy intent).
- [x] Guest onboarding storyboard documented with lifecycle and mode branches.
- [x] Exit criteria documented per persona.
- [x] Analytics event names listed (`onboarding_started`, `onboarding_step_viewed`, `onboarding_completed`, `onboarding_skipped` with `persona=dj|guest`); implementation optional.
- [x] Accessibility expectations documented (keyboard, focus, reduced motion).
- [x] Copy and step order reviewed (sign-off note in feature doc and sprint Phase 0 Decisions).
- [x] Return-to-event link storyboard and visibility rules documented.
- [x] Document title template matrix reviewed and signed off.

---

## Current Phase Start Checklist

### Sprint kickoff
- [ ] Confirm target branch strategy and feature flag default for Preview vs Production.
- [x] Confirm Phase 1 persistence choice before large UI work (`dj_profiles` + separate `suplio:*` guest keys).
- [ ] Reserve time for regression pass using updated runbook rows at end of Phase 5.

### Phase 0 entry
- [x] Draft DJ onboarding storyboard (screens, step order, copy intent).
- [x] Draft guest onboarding storyboard with lifecycle (`draft`/`live`/`ended`/`archived`) and mode (`song_request`/`karaoke`) branches.
- [x] Document exit criteria per persona (DJ vs guest).
- [x] List analytics event names (`onboarding_started`, `onboarding_step_viewed`, `onboarding_completed`, `onboarding_skipped` with `persona=dj|guest`).
- [x] Document accessibility expectations (keyboard, focus, reduced motion).
- [x] Review copy and step order; add sign-off note in feature doc or sprint notes.
- [x] Draft return-to-event link UX (label, visibility, last subpath destination).
- [x] Draft document title template matrix for guest, DJ, and marketing routes.

### Phase 1 entry
- [x] Choose DJ persistence (`dj_profiles`) and document migration (apply Phase 3).
- [x] Specify guest `localStorage` keys for onboarding completion/skipped (global scope).
- [x] Document `onboarding_version` constant and QA reset policy.
- [x] Document `NEXT_PUBLIC_ENABLE_ONBOARDING` (wire `featureFlags.onboarding` in Phase 2).
- [x] Document ordering vs email verification and private DJ routes.
- [x] Confirm last-guest-event keys align with Phase 0 (`code`, `name`, `subpath`).

### Phase 2 entry
- [ ] Add `featureFlags.onboarding` and `ONBOARDING_VERSION` + `GUEST_STORAGE_KEYS` constants.
- [ ] Implement shared hybrid step runner (modal + spotlight) per Phase 0 UI pattern.
- [ ] Implement guest client-state helpers (`shouldShowGuestOnboarding`, persist end).
- [ ] Unit tests for version/eligibility logic where non-trivial.
- [ ] Document keyboard/skip/close behavior for DJ (no Skip steps 1–5) vs guest (Skip allowed).

---

## Validation Checklist (Sprint Exit)

- [ ] Feature flag toggles onboarding on/off with no console errors.
- [ ] DJ: Done on step 6 persists; dismiss without Done re-shows until completed.
- [ ] DJ: unverified users still follow existing verification behavior; onboarding does not leak private data.
- [ ] Guest: first visit shows onboarding; repeat visit in same browser does not (unless version bump).
- [ ] Guest: `draft` event messaging matches Scan-only product behavior.
- [ ] Guest: `live` + `song_request` explains Request and Vote appropriately.
- [ ] Guest: `live` + `karaoke` explains Request List; no vote-first onboarding copy.
- [ ] Guest: `ended` / `archived` behavior matches Phase 0 storyboard (suppressed).
- [ ] Keyboard and reduced-motion behavior spot-checked on mobile and desktop.
- [ ] Core regression rows in [`docs/runbook-regression.md`](../runbook-regression.md) still pass (guest + DJ sections).
- [ ] Documentation set is consistent: feature plan, this sprint, project description scope.
- [ ] Guest: visit event → home via Suplio logo → return link restores correct event and last subpath (always on).
- [ ] Guest: visit event → Are you a DJ? → DJ login → return link still available (always on).
- [ ] No return link on `/` or DJ login when no prior guest event (incognito / cleared storage).
- [ ] Guest Scan / Request / Vote (or Karaoke) tabs show distinct titles including event name.
- [ ] DJ login and dashboard tabs are not generic `"Suplio"` only.
- [ ] Return link and document titles work when onboarding flag is off.
