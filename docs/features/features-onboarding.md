# Onboarding Feature Plan

**Backlog: [IDEA-010](../backlog-ideas.md)**

Related docs:

- Backlog: [`../backlog-ideas.md`](../backlog-ideas.md) (IDEA-010)
- Sprint tracker: [`../sprints/sprint-2026-08-onboarding.md`](../sprints/sprint-2026-08-onboarding.md)
- Project description: [`../project-description.md`](../project-description.md)
- Regression runbook: [`../runbook-regression.md`](../runbook-regression.md)
- Deploy runbook: [`../deploy.md`](../deploy.md)

## Overview

Onboarding adds guided first-run (and optionally versioned “what’s new”) experiences for **DJs** and **Guests** so each persona understands the product before operating under time pressure at a live event.

- **DJ onboarding** orients authenticated DJs after login: profile completeness, creating an event, lifecycle (`draft` → `live` → `ended`), moderation or karaoke queue controls, and where to find share/QR surfaces.
- **Guest onboarding** orients visitors on `/event/[eventCode]`: what Scan / Request / third tab mean, request etiquette and throttle expectations, and mode-specific behavior (`song_request` vs `karaoke`).
- **Guest return-to-event navigation** and **route-aware document titles** ship in the same sprint but are **always on** (not gated by `NEXT_PUBLIC_ENABLE_ONBOARDING`).

This feature is additive: existing auth guards, event lifecycle rules, and guest APIs remain unchanged unless Phase 1 chooses a DB column on `dj_profiles` for DJ completion state.

## Product Behavior

### DJ onboarding

- Triggers on first eligible visit to **`/dj/dashboard` only** (after auth and verification gates pass — ordering in Phase 1), until the DJ taps **Done** on the final tour step for the current `onboarding_version`.
- Covers: welcome and value prop, profile / `stage_name` if incomplete (link to profile), create first event (CTA), lifecycle summary, moderation basics (or karaoke performer-flow controls when `event_mode` is `karaoke`), QR/share on manage screen.
- **Must complete:** no **Skip** on steps 1–5; step 6 is **Done** only. Escape / overlay dismiss does **not** persist completion — tour re-shows on the next eligible dashboard visit.
- Must not block emergency access to live event management (non-blocking overlay; nav click-through where safe).
- **Persistence** is decided in Phase 1; recommended default is server-side on `dj_profiles` (e.g. `onboarding_completed_at`, `onboarding_version_seen`) so state survives device changes and supports “bump version for what’s new.”
- Must coexist with **email verification** and existing `/dj/*` private route guards: onboarding never weakens auth; order of operations is documented in Phase 1.

### Guest onboarding

- Triggers on first visit to any `/event/[eventCode]/*` while the feature flag is on and the **global** guest onboarding key is unset for the current `onboarding_version` (one tour per browser, not per `eventCode`).
- **Lifecycle-aware**: **suppress** onboarding for `ended` / `archived` (rely on `EventOver`); `draft` emphasizes Scan-only behavior; `live` explains Request and third tab (Vote vs karaoke queue).
- **Mode-aware**: copy and optional steps differ for `song_request` (vote) vs `karaoke` (request list, no voting).
- Mentions **request throttle** (60s between requests) at a high level so guests are not surprised by `429` responses.
- **Skippable on any step** (contrast with DJ must-complete); **Done** also ends the tour. Repeat in-event navigation does not re-open until `onboarding_version` bumps (Phase 1 defines storage).

### Guest navigation — return to event

When a guest leaves an event context via the **Suplio** home link ([`routes.home`](../../src/frontend/lib/shared/constants/routes.ts)) or **Are you a DJ?** ([`routes.dj.entry`](../../src/frontend/lib/shared/constants/routes.ts)), the navbar should offer a way back to the last event they visited. Implemented in [`TopNavShell.tsx`](../../src/frontend/components/navigation/TopNavShell.tsx).

| Trigger | Navbar behavior |
| -------- | ---------------- |
| Guest visited `/event/[eventCode]/*` | Persist `last_guest_event_code`, `last_guest_event_name` (label), and `last_guest_event_subpath` per Phase 1 storage decision |
| Guest on `/`, `/dj`, `/dj/login`, `/dj/signup`, or other non–guest-event paths where `TopNavShell` renders | Show **Return to {EventName}** → last guest subpath (`scan` / `request` / `vote` / `karaoke-list`); fallback Scan if subpath invalid |
| No stored event, invalid event, or cleared storage | Hide link (no dead links) |
| Guest still on guest event routes | Existing Scan / Request / Vote (or Karaoke) links unchanged; return link not shown redundantly |

**Always on:** not gated by `NEXT_PUBLIC_ENABLE_ONBOARDING`.

### Document titles and metadata

Replace the generic root [`metadata.title`](../../src/frontend/app/layout.tsx) (`"Suplio"`) with per-route titles so browser tabs reflect page context. URL paths stay `/event/[eventCode]/…`; “URL name” here means **browser tab title** (and aligned `openGraph` / `twitter` where applicable).

**Title template matrix** (Phase 0 locks copy; implementation Phase 5):

| Surface | Example tab title pattern |
| -------- | --------------------------- |
| Marketing `/` | Keep existing: `Suplio \| DJ Song Requests and Voting` ([`app/page.tsx`](../../src/frontend/app/page.tsx)) |
| Guest Scan | `{EventName} — Scan \| Suplio` |
| Guest Request | `{EventName} — Request \| Suplio` |
| Guest Vote | `{EventName} — Vote \| Suplio` |
| Guest Karaoke list | `{EventName} — Queue \| Suplio` |
| DJ login / signup | `DJ Login \| Suplio` / `DJ Sign Up \| Suplio` |
| DJ dashboard | `Dashboard \| Suplio` |
| DJ event management | `{EventName} — Manage \| Suplio` (or agreed label) |

- Root [`app/layout.tsx`](../../src/frontend/app/layout.tsx): change to a default template (e.g. `"%s \| Suplio"`) or rely on route-level `generateMetadata` overriding static `title: "Suplio"`.
- Guest: `generateMetadata` in [`app/(guest)/event/[eventCode]/layout.tsx`](../../src/frontend/app/(guest)/event/[eventCode]/layout.tsx) and/or per-page (`scan`, `request`, `vote`, `karaoke-list`), optionally via a shared helper under `lib/shared/metadata/`.
- DJ: metadata on [`(dj-public)`](../../src/frontend/app/(dj-public)) and [`(dj-private)`](../../src/frontend/app/(dj-private)) route segments.
- `{EventName}`: `events.name` when present, else `event_code`; document loading/fallback while event fetch is pending.

**Always on:** not gated by `NEXT_PUBLIC_ENABLE_ONBOARDING`.

### Cross-cutting

- **Feature flag**: onboarding UI is gated (extend [`src/frontend/lib/shared/config/feature-flags.ts`](../../src/frontend/lib/shared/config/feature-flags.ts) with e.g. `NEXT_PUBLIC_ENABLE_ONBOARDING`); flag off = no onboarding UI and no errors.
- **Accessibility**: keyboard operable, visible focus, `prefers-reduced-motion` respected; avoid trapping focus in a way that blocks core navigation without an escape.
- **Analytics** (optional): event names agreed in Phase 0 (`onboarding_started`, `onboarding_step_viewed`, `onboarding_completed`, `onboarding_skipped` with `persona=dj|guest`); vendor wiring deferred.

## Phase 0 Decisions (locked)

**Phase 0 sign-off:** 2026-06-02 — self-review; product choices captured in sprint AskQuestion. Full storyboards below; sprint board summarizes in [`sprint-2026-08-onboarding.md`](../sprints/sprint-2026-08-onboarding.md).

- **UI pattern:** Hybrid — modal for narrative steps; spotlight for at most **two** in-context steps per persona (stable DOM anchors required).
- **Rationale:** Modals carry lifecycle/mode copy without fragile selectors; spotlight grounds “Create event” and optional guest nav without a full page tour.
- **DJ entry:** `/dj/dashboard` only; mount after auth + verification gates (Phase 1 documents ordering).
- **DJ exit:** **Done** on step 6 only; no Skip on steps 1–5; dismiss without Done does not persist → re-show on next eligible dashboard visit.
- **Guest scope:** Global per browser for `onboarding_version` (not per `eventCode`).
- **Guest `ended` / `archived`:** Suppress onboarding entirely.
- **Return-to-event (always on):** Label `Return to {EventName}`; href = last subpath with Scan fallback; see [Return-to-event navigation (locked)](#return-to-event-navigation-locked).
- **Document titles (always on):** Matrix signed off 2026-06-02 — see [Document title matrix (signed off)](#document-title-matrix-signed-off).
- **DJ persistence:** Recommended `dj_profiles` server fields — **locked in Phase 1** (not Phase 0).
- **Feature flag (implementation Phase 1+):** `NEXT_PUBLIC_ENABLE_ONBOARDING` → `featureFlags.onboarding`; default off until Phase 5 sign-off.

## DJ onboarding storyboard

**Entry:** First eligible visit to [`/dj/dashboard`](../../src/frontend/app/(dj-private)/dj/dashboard/page.tsx) while `featureFlags.onboarding` is on and DJ has not completed the current `onboarding_version`.

**UI:** Hybrid (see Phase 0 decisions). **Six steps:**

| Step | UI | Anchor / route | Copy intent |
| ---- | -- | -------------- | ----------- |
| 1 | Modal | — | Welcome: Suplio reduces booth interruptions; this one-time tour walks through essentials |
| 2 | Modal | — | Profile: set `stage_name` and avatar via Profile when incomplete; link/CTA to [`/dj/profile`](../../src/frontend/app/(dj-private)/dj/profile/page.tsx) |
| 3 | Spotlight | Dashboard “Create event” control | Create or manage events; high-level `song_request` vs `karaoke` modes |
| 4 | Modal | — | Lifecycle: `draft` → `live` → `ended` / `archived`; when guests can request and vote |
| 5 | Modal | — | Moderation: accept / reject / played; karaoke mentions performer flow and queue (no deep link in v1) |
| 6 | Modal | — | Share: event code and QR on event manage screen; **Done** ends tour and persists completion (Phase 1) |

**Interaction rules:**

- No **Skip** on steps 1–5; step 6 exposes **Done** only.
- **Escape** or overlay dismiss without **Done** does **not** persist completion; tour re-appears on the next eligible `/dj/dashboard` visit.
- Flag off: no onboarding UI.
- Do not mount on blocked or unverified DJ routes (Phase 1).

## Guest onboarding storyboard

**Trigger:** First visit to any `/event/[eventCode]/*` while the flag is on and the global guest onboarding storage key is unset for the current `onboarding_version`.

**Global scope:** Once the guest **completes** or **skips** (persisted in Phase 1), no further guest onboarding in that browser until `onboarding_version` bumps — applies across all events.

**Cross-persona difference:** Guest tours remain **skippable on every step**; DJ tours require **Done** on step 6.

| Lifecycle | Mode | Steps | UI mix | Notes |
| --------- | ---- | ----- | ------ | ----- |
| `draft` | any | 2 | Modal | Scan-only; do not promise Request/Vote until event is live |
| `live` | `song_request` | 4 (+0–1 spotlight) | Modal (+ optional header nav spotlight) | Scan → Request (mention 60s throttle) → Vote → **Done**; optional spotlight on Scan / Request / Vote nav |
| `live` | `karaoke` | 3 | Modal | Scan → Request List (“Karaoke Queue” in nav) → **Done**; **no Vote copy** |
| `ended` | any | 0 | — | Suppressed; [`EventOver`](../../src/frontend/components/EventOver.tsx) suffices |
| `archived` | any | 0 | — | Suppressed |

**Guest step actions:** **Skip** and **Done** available on each step (Phase 2 implements controls). Either action ends the global tour for the current version when persisted per Phase 1.

## Exit criteria

| Persona | Tour stops re-showing when | Success metrics (Phase 0 — qualitative) |
| ------- | -------------------------- | --------------------------------------- |
| **DJ** | **Done** on step 6 persists completion for `onboarding_version` (Phase 1: e.g. `onboarding_completed_at` on `dj_profiles`) | DJ can create an event, go live, and moderate without support |
| **Guest** | **Done** or **Skip** persists global completion/skipped state for `onboarding_version` | Guest understands Scan / Request / third tab and is not surprised by request throttle (`429`) |
| **Dismiss without Done (DJ only)** | Does not set completion; re-show on next eligible `/dj/dashboard` visit | — |

Analytics instrumentation is optional; vendor wiring deferred to Phase 5.

## Analytics events (names only)

| Event | Properties |
| ----- | ---------- |
| `onboarding_started` | `persona` (`dj` \| `guest`), `onboarding_version`, optional `eventCode`, `lifecycle`, `event_mode` |
| `onboarding_step_viewed` | `persona`, `step_id`, `step_index` |
| `onboarding_completed` | `persona`, `onboarding_version` |
| `onboarding_skipped` | `persona`, `step_id`, `onboarding_version` |

**Vendor:** deferred (Phase 5 optional).

## Accessibility expectations

- **Modal steps:** Focus trap, `aria-modal="true"`, initial focus on step title; **Escape** dismisses without DJ completion (re-show per exit criteria).
- **Spotlight steps:** Target is focusable or linked via `aria-describedby`; minimum 44×44px effective tap padding on mobile.
- **`prefers-reduced-motion`:** No step transition animations; instant show/hide.
- **DJ non-blocking:** Overlay must not prevent reaching live event management — use non-blocking overlay regions or safe click-through on primary nav where product allows.
- **Guest:** Skip control keyboard-reachable on every step.

## Return-to-event navigation (locked)

Extends [Guest navigation — return to event](#guest-navigation--return-to-event). **Always on** (not gated by `NEXT_PUBLIC_ENABLE_ONBOARDING`).

| Rule | Detail |
| ---- | ------ |
| **Label** | `Return to {EventName}` where `{EventName}` = `events.name` when present, else `event_code` |
| **Show on** | [`routes.home`](../../src/frontend/lib/shared/constants/routes.ts) (`/`), [`routes.dj.entry`](../../src/frontend/lib/shared/constants/routes.ts) (`/dj`), `/dj/login`, `/dj/signup` when valid stored event code exists |
| **Hide on** | Any guest event route (`/event/[eventCode]/*`); missing/invalid/cleared storage |
| **Href** | Last guest subpath: `scan`, `request`, `vote`, or `karaoke-list` via [`routes.guest.*`](../../src/frontend/lib/shared/constants/routes.ts); fallback `routes.guest.scan(code)` if subpath missing or invalid |
| **Persist on** | Every navigation under `/event/[eventCode]/*` — update code, name, and subpath |

**Phase 1 storage keys (documented here; implementation Phase 1 / 4):**

- `suplio:last_guest_event_code` (or agreed prefix)
- `suplio:last_guest_event_name` (optional, for label only — public event name)
- `suplio:last_guest_event_subpath` — `scan` \| `request` \| `vote` \| `karaoke-list`

**Privacy:** Store only public event code and display name; no guest PII.

## Document title matrix (signed off)

**Signed off:** 2026-06-02 — patterns unchanged from [Document titles and metadata](#document-titles-and-metadata).

| Surface | Tab title pattern |
| ------- | ----------------- |
| Marketing `/` | `Suplio \| DJ Song Requests and Voting` (unchanged) |
| Guest Scan | `{EventName} — Scan \| Suplio` |
| Guest Request | `{EventName} — Request \| Suplio` |
| Guest Vote | `{EventName} — Vote \| Suplio` |
| Guest Karaoke list | `{EventName} — Queue \| Suplio` |
| DJ login / signup | `DJ Login \| Suplio` / `DJ Sign Up \| Suplio` |
| DJ dashboard | `Dashboard \| Suplio` |
| DJ event management | `{EventName} — Manage \| Suplio` |

**Footnotes:**

- `{EventName}`: use `events.name` when loaded, else `event_code` until fetch resolves.
- Implementation: Phase 5 via `generateMetadata` and optional helper under `lib/shared/metadata/`.
- Return link and titles must work when onboarding flag is off.

## Implementation Phases

### Phase 0 - UX discovery and success metrics

**Goal:** Lock storyboards, exit criteria, and analytics naming before implementation.

**Scope**

- DJ storyboard: profile → create event → dashboard/event management → go live → moderate or karaoke queue.
- Guest storyboard: landing → Scan → Request → Vote or karaoke Request List; throttle and realtime tips as needed.
- Return-to-event link UX: label, visibility rules, default destination tab (Scan).
- Document title template matrix sign-off.
- Exit criteria: e.g. “dismissed or completed” vs “created first event” for DJ; “skipped or completed” for guest.
- Analytics event list (names only) and accessibility expectations.

**Definition of Done**

- [x] DJ onboarding storyboard documented (screens + step order + copy intent).
- [x] Guest onboarding storyboard documented with lifecycle and mode branches.
- [x] Exit criteria documented per persona.
- [x] Analytics event names listed (implementation optional).
- [x] Accessibility expectations documented (keyboard, focus, reduced motion).
- [x] Copy and step order reviewed (stakeholder or self-review with sign-off note).
- [x] Return-to-event link storyboard and visibility rules documented.
- [x] Document title template matrix reviewed and signed off.

### Phase 1 - Technical approach and state model

**Goal:** Choose persistence, versioning, and conflict rules with auth and guests.

**Scope**

- DJ: `dj_profiles` columns vs Supabase Auth `user_metadata` — document chosen approach, migration if DB, RLS implications (owner read/update only).
- Guest: `localStorage` / cookie key strategy (`eventCode`, global guest key), privacy note (no unnecessary PII).
- Guest last-event keys: `last_guest_event_code`, `last_guest_event_name`, `last_guest_event_subpath` (alongside onboarding keys).
- **Versioning**: integer or semver `onboarding_version`; bump to re-show “what’s new.”
- Feature flag key and default (off in production until ready).
- Document interaction with email verification and private DJ routes.

**Definition of Done**

- [ ] ADR or short “Decision” subsection: DJ persistence, guest persistence, versioning, reset policy for QA.
- [ ] Data shape specified (column names or storage keys).
- [ ] Privacy review note for guest storage scope.
- [ ] Feature flag name and env var documented.
- [ ] Documented ordering vs auth/verification gates (no bypass of security).
- [ ] Last-guest-event storage keys documented (`last_guest_event_code`, optional name, `last_guest_event_subpath`); privacy note covers public event code/name only.

### Phase 2 - Shared onboarding primitives (frontend)

**Goal:** Reusable step runner used by both personas.

**Scope**

- Provider or hook: steps, next/back, complete, skip, `version`.
- Step config type: id, title, body, optional `targetSelector`, optional route.
- UI pattern: **hybrid** (locked Phase 0) — modal + spotlight; respect reduced motion.

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
- [ ] Done on step 6 persists completion; dismiss-without-Done re-shows; guest Skip/Done per Phase 1 model.
- [ ] Graceful degradation if user navigates away mid-flow.
- [ ] E2E or Playwright path for complete + skip (env-gated if needed).
- [ ] Manual smoke: auth, verification gate, dashboard unchanged when flag off.

### Phase 4 - Guest onboarding implementation

**Goal:** Ship guest first-visit flow behind the same or sibling flag.

**Scope**

- Trigger on guest event routes under [`src/frontend/app/(guest)/event/[eventCode]/`](../../src/frontend/app/(guest)/event/[eventCode]/).
- Respect `draft` / `live` / `ended` / `archived` and `event_mode`.
- Guest return-to-event link in [`TopNavShell.tsx`](../../src/frontend/components/navigation/TopNavShell.tsx) on home and DJ entry surfaces (always on).

**Definition of Done**

- [ ] Guest onboarding shows per first-visit / version rules only (not every client navigation).
- [ ] Mode-specific copy and optional steps for `song_request` vs `karaoke`.
- [ ] Lifecycle-specific behavior matches product rules (align with [`docs/runbook-regression.md`](../runbook-regression.md)).
- [ ] Tests for at least one guest path (storage mocked or isolated).
- [ ] No major layout shift or LCP regression; defer heavy overlays if needed.
- [ ] Return-to-event link visible on `/` and DJ entry when a valid last event exists; hidden when none (always on, not onboarding-flagged).

### Phase 5 - Polish, ops, and launch

**Goal:** Production-ready docs, regression rows, and rollback verified.

**Scope**

- Copy polish, optional in-app “?” replay.
- Update [`docs/runbook-regression.md`](../runbook-regression.md) with onboarding checks.
- Per-route `metadata.title` per Phase 0 matrix (guest, DJ, marketing).
- Update [`docs/project-description.md`](../project-description.md) **Current Delivered Scope** when sprint completes.
- QA reset instructions for operators.

**Definition of Done**

- [ ] `npm run lint`, `npm run build`, and `npm run test:qa` pass from `src/frontend` per sprint standards.
- [ ] Regression runbook includes DJ and guest onboarding rows.
- [ ] Feature flag off removes all onboarding UI without errors.
- [ ] Metrics wired if Phase 0 required them (otherwise explicitly deferred in sprint notes).
- [ ] All title-matrix routes emit correct `metadata.title`; tab titles differ across Scan vs Vote vs DJ login (always on).
- [ ] Return-to-event and document-title regression rows pass.

## Acceptance Criteria (Feature Complete)

This feature is complete when all statements are true:

- [ ] DJ onboarding runs once per `onboarding_version` (or documented equivalent) for eligible authenticated DJs when the feature flag is on.
- [ ] DJ completion state persists across sessions per Phase 1 decision (default: server-side on `dj_profiles`).
- [ ] Guest onboarding runs on first visit (or version bump) per browser scope without blocking Scan in an emergency.
- [ ] Guest flow is lifecycle- and mode-aware (`draft` / `live` / `ended`, `song_request` / `karaoke`).
- [ ] Guest flow skippable; DJ must complete final **Done**; both keyboard-accessible; reduced-motion respected.
- [ ] Feature flag provides instant rollback with no console errors.
- [ ] Documentation and regression checklist updated; no regression in core DJ or guest flows.
- [ ] Guest who visited an event can return from `/` or DJ entry via navbar without re-scanning QR (always on).
- [ ] Browser tab title reflects route + event (guest) or route (DJ) per Phase 0 matrix (always on).
- [ ] Return link and document titles behave correctly when onboarding flag is off.

## Validation Checklist

### DJ validation

- [ ] With flag on, new DJ (or reset user) sees onboarding on agreed entry route.
- [ ] Done on step 6 persists; refresh does not re-show for same version.
- [ ] Escape / dismiss without Done re-shows on next eligible `/dj/dashboard` visit (no completion persisted).
- [ ] With flag off, no onboarding UI on `/dj/dashboard` or other DJ routes.
- [ ] Unverified email still follows existing verification redirects; onboarding does not appear on blocked routes incorrectly.

### Guest validation

- [ ] First load of `/event/[eventCode]` with flag on shows onboarding per rules.
- [ ] Second visit in same browser does not re-show (unless version bump).
- [ ] `draft` event: messaging matches Scan-only expectations.
- [ ] `live` + `song_request`: Request and Vote tabs explained appropriately.
- [ ] `live` + `karaoke`: Request List path explained; no vote-oriented CTA in onboarding copy.
- [ ] `ended` / `archived`: onboarding suppressed per Phase 0 storyboard.
- [ ] Guest Skip on any step ends tour for version (global scope); second event in same browser does not re-show.

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
- [`src/frontend/components/navigation/TopNavShell.tsx`](../../src/frontend/components/navigation/TopNavShell.tsx) — return-to-event link (always on).
- [`src/frontend/app/layout.tsx`](../../src/frontend/app/layout.tsx) — default title template.
- Guest event layout/pages and DJ route layouts/pages — `generateMetadata`.
- Optional shared helper e.g. `src/frontend/lib/shared/metadata/` — title builders.

### Documentation

- Backlog: [`../backlog-ideas.md`](../backlog-ideas.md) (IDEA-010)
- Sprint tracker: [`../sprints/sprint-2026-08-onboarding.md`](../sprints/sprint-2026-08-onboarding.md)
- Post-delivery updates: [`../project-description.md`](../project-description.md), [`../runbook-regression.md`](../runbook-regression.md)
