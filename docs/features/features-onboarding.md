# Onboarding Feature Plan

## Overview

Onboarding adds guided first-run (and optionally versioned “what’s new”) experiences for **DJs** and **Guests** so each persona understands the product before operating under time pressure at a live event.

- **DJ onboarding** orients authenticated DJs after login: profile completeness, creating an event, lifecycle (`draft` → `live` → `ended`), moderation or karaoke queue controls, and where to find share/QR surfaces.
- **Guest onboarding** orients visitors on `/event/[eventCode]`: what Scan / Request / third tab mean, request etiquette and throttle expectations, and mode-specific behavior (`song_request` vs `karaoke`).

This feature is additive: existing auth guards, event lifecycle rules, and guest APIs remain unchanged unless Phase 1 chooses a DB column on `dj_profiles` for DJ completion state.

## Product Behavior

### DJ onboarding

- Triggers after successful auth on paths such as first visit to `/dj/dashboard`, or until the user completes or skips onboarding for the current `onboarding_version`.
- Covers: welcome and value prop, profile / `stage_name` if incomplete (link to profile), create first event (CTA), lifecycle summary, moderation basics (or karaoke performer-flow controls when `event_mode` is `karaoke`), optional QR/share step if present in product.
- **Skippable** and **completable**; must not block emergency access to live event management (non-blocking UI pattern preferred).
- **Persistence** is decided in Phase 1; recommended default is server-side on `dj_profiles` (e.g. `onboarding_completed_at`, `onboarding_version_seen`) so state survives device changes and supports “bump version for what’s new.”
- Must coexist with **email verification** and existing `/dj/*` private route guards: onboarding never weakens auth; order of operations is documented in Phase 1.

### Guest onboarding

- Triggers on first meaningful visit to an event context (e.g. `/event/[eventCode]` or first tab in session), scoped per **browser** unless a future identity model exists.
- **Lifecycle-aware**: shorter or suppressed messaging for `ended` / `archived`; `draft` may emphasize Scan-only behavior; `live` explains Request and third tab (Vote vs karaoke queue).
- **Mode-aware**: copy and optional steps differ for `song_request` (vote) vs `karaoke` (request list, no voting).
- Mentions **request throttle** (60s between requests) at a high level so guests are not surprised by `429` responses.
- **Skippable**; repeat visits in the same browser should not spam (keyed by `eventCode` and/or `onboarding_version` per Phase 1 decision).

### Cross-cutting

- **Feature flag**: onboarding UI is gated (extend [`src/frontend/lib/shared/config/feature-flags.ts`](../../src/frontend/lib/shared/config/feature-flags.ts) with e.g. `NEXT_PUBLIC_ENABLE_ONBOARDING`); flag off = no onboarding UI and no errors.
- **Accessibility**: keyboard operable, visible focus, `prefers-reduced-motion` respected; avoid trapping focus in a way that blocks core navigation without an escape.
- **Analytics** (optional): event names agreed in Phase 0 (`onboarding_started`, `step_viewed`, `completed`, `skipped` with `persona=dj|guest`); vendor wiring deferred.

## Implementation Phases

### Phase 0 - UX discovery and success metrics

**Goal:** Lock storyboards, exit criteria, and analytics naming before implementation.

**Scope**

- DJ storyboard: profile → create event → dashboard/event management → go live → moderate or karaoke queue.
- Guest storyboard: landing → Scan → Request → Vote or karaoke Request List; throttle and realtime tips as needed.
- Exit criteria: e.g. “dismissed or completed” vs “created first event” for DJ; “skipped or completed” for guest.
- Analytics event list (names only) and accessibility expectations.

**Definition of Done**

- [ ] DJ onboarding storyboard documented (screens + step order + copy intent).
- [ ] Guest onboarding storyboard documented with lifecycle and mode branches.
- [ ] Exit criteria documented per persona.
- [ ] Analytics event names listed (implementation optional).
- [ ] Accessibility expectations documented (keyboard, focus, reduced motion).
- [ ] Copy and step order reviewed (stakeholder or self-review with sign-off note).

### Phase 1 - Technical approach and state model

**Goal:** Choose persistence, versioning, and conflict rules with auth and guests.

**Scope**

- DJ: `dj_profiles` columns vs Supabase Auth `user_metadata` — document chosen approach, migration if DB, RLS implications (owner read/update only).
- Guest: `localStorage` / cookie key strategy (`eventCode`, global guest key), privacy note (no unnecessary PII).
- **Versioning**: integer or semver `onboarding_version`; bump to re-show “what’s new.”
- Feature flag key and default (off in production until ready).
- Document interaction with email verification and private DJ routes.

**Definition of Done**

- [ ] ADR or short “Decision” subsection: DJ persistence, guest persistence, versioning, reset policy for QA.
- [ ] Data shape specified (column names or storage keys).
- [ ] Privacy review note for guest storage scope.
- [ ] Feature flag name and env var documented.
- [ ] Documented ordering vs auth/verification gates (no bypass of security).

### Phase 2 - Shared onboarding primitives (frontend)

**Goal:** Reusable step runner used by both personas.

**Scope**

- Provider or hook: steps, next/back, complete, skip, `version`.
- Step config type: id, title, body, optional `targetSelector`, optional route.
- UI pattern: modal, inline checklist, or spotlight — chosen in Phase 0/1; respect reduced motion.

**Definition of Done**

- [ ] Shared step configuration type and runner implemented.
- [ ] Keyboard: skip/close paths documented and manually verified.
- [ ] Mobile layouts verified for readability and tap targets.
- [ ] Unit tests for completion/skip/version logic where non-trivial.
- [ ] No fragile “set state in effect” patterns for step progression; prefer derived state from URL or explicit user events.

### Phase 3 - DJ onboarding implementation

**Goal:** Ship DJ-first-run flow behind the feature flag.

**Scope**

- Mount on `/dj/dashboard` or agreed entry; deep links only where selectors are stable.
- Persist completion per Phase 1 (server update API + client optimistic or refetch).

**Definition of Done**

- [ ] DJ sees onboarding when flag on and version/eligibility rules say so.
- [ ] Skip and Done persist completion per Phase 1 model.
- [ ] Graceful degradation if user navigates away mid-flow.
- [ ] E2E or Playwright path for complete + skip (env-gated if needed).
- [ ] Manual smoke: auth, verification gate, dashboard unchanged when flag off.

### Phase 4 - Guest onboarding implementation

**Goal:** Ship guest first-visit flow behind the same or sibling flag.

**Scope**

- Trigger on guest event routes under [`src/frontend/app/(guest)/event/[eventCode]/`](../../src/frontend/app/(guest)/event/[eventCode]/).
- Respect `draft` / `live` / `ended` / `archived` and `event_mode`.

**Definition of Done**

- [ ] Guest onboarding shows per first-visit / version rules only (not every client navigation).
- [ ] Mode-specific copy and optional steps for `song_request` vs `karaoke`.
- [ ] Lifecycle-specific behavior matches product rules (align with [`docs/runbook-regression.md`](../runbook-regression.md)).
- [ ] Tests for at least one guest path (storage mocked or isolated).
- [ ] No major layout shift or LCP regression; defer heavy overlays if needed.

### Phase 5 - Polish, ops, and launch

**Goal:** Production-ready docs, regression rows, and rollback verified.

**Scope**

- Copy polish, optional in-app “?” replay.
- Update [`docs/runbook-regression.md`](../runbook-regression.md) with onboarding checks.
- Update [`docs/project-description.md`](../project-description.md) **Current Delivered Scope** when sprint completes.
- QA reset instructions for operators.

**Definition of Done**

- [ ] `npm run lint`, `npm run build`, and `npm run test:qa` pass from `src/frontend` per sprint standards.
- [ ] Regression runbook includes DJ and guest onboarding rows.
- [ ] Feature flag off removes all onboarding UI without errors.
- [ ] Metrics wired if Phase 0 required them (otherwise explicitly deferred in sprint notes).

## Acceptance Criteria (Feature Complete)

This feature is complete when all statements are true:

- [ ] DJ onboarding runs once per `onboarding_version` (or documented equivalent) for eligible authenticated DJs when the feature flag is on.
- [ ] DJ completion state persists across sessions per Phase 1 decision (default: server-side on `dj_profiles`).
- [ ] Guest onboarding runs on first visit (or version bump) per browser scope without blocking Scan in an emergency.
- [ ] Guest flow is lifecycle- and mode-aware (`draft` / `live` / `ended`, `song_request` / `karaoke`).
- [ ] Both flows are skippable and keyboard-accessible; reduced-motion respected.
- [ ] Feature flag provides instant rollback with no console errors.
- [ ] Documentation and regression checklist updated; no regression in core DJ or guest flows.

## Validation Checklist

### DJ validation

- [ ] With flag on, new DJ (or reset user) sees onboarding on agreed entry route.
- [ ] Skip marks completion (or “skipped” state) per spec; does not re-show until version bump.
- [ ] Done path persists; refresh does not re-show onboarding for same version.
- [ ] With flag off, no onboarding UI on `/dj/dashboard` or other DJ routes.
- [ ] Unverified email still follows existing verification redirects; onboarding does not appear on blocked routes incorrectly.

### Guest validation

- [ ] First load of `/event/[eventCode]` with flag on shows onboarding per rules.
- [ ] Second visit in same browser does not re-show (unless version bump).
- [ ] `draft` event: messaging matches Scan-only expectations.
- [ ] `live` + `song_request`: Request and Vote tabs explained appropriately.
- [ ] `live` + `karaoke`: Request List path explained; no vote-oriented CTA in onboarding copy.
- [ ] `ended` / `archived`: shortened or suppressed onboarding per spec.

### Cross-cutting validation

- [ ] Flag off: zero onboarding UI; app behaves as before.
- [ ] Focus order and Escape / Skip behavior verified on mobile and desktop.
- [ ] No RLS or API surface widened solely for onboarding unless explicitly designed and reviewed.

## Traceability

### Data model (if DB-backed DJ state)

- Migration under `supabase/migrations/*` for `dj_profiles` onboarding columns, if chosen.
- Regenerate or hand-update [`src/frontend/types/database.ts`](../../src/frontend/types/database.ts) to match.
- Optional PATCH handler on existing DJ profile API for completion fields.

### Likely impacted frontend areas

- [`src/frontend/lib/shared/config/feature-flags.ts`](../../src/frontend/lib/shared/config/feature-flags.ts) — new flag(s).
- [`src/frontend/app/(dj-private)/dj/dashboard/page.tsx`](../../src/frontend/app/(dj-private)/dj/dashboard/page.tsx) — mount DJ onboarding.
- [`src/frontend/app/(guest)/event/[eventCode]/page.tsx`](../../src/frontend/app/(guest)/event/[eventCode]/page.tsx) and sibling routes (`scan`, `request`, `vote`, `karaoke-list`) — guest onboarding entry points.
- New feature module e.g. `src/frontend/features/onboarding/` — provider, steps, UI shells.
- Custom hooks under `src/frontend/hooks/onboarding/` if step state is reused.

### Documentation

- Sprint tracker: [`docs/sprints/sprint-2026-05-onboarding.md`](../sprints/sprint-2026-05-onboarding.md)
- Post-delivery updates: [`docs/project-description.md`](../project-description.md), [`docs/runbook-regression.md`](../runbook-regression.md)
