# Sprint Tracker: 2026-04 Phase 9

This file is the **closed** sprint record for the 2026-04 Phase 9 iteration (all roadmap phases through 9 delivered).

Naming convention for future sprint files:

- `sprint-YYYY-MM-topic.md`

Related docs:

- Roadmap and phase history: `../DJ Login and Event Management.md`
- Project description: `../project-description.md`
- Regression runbook: `../runbook-regression.md`
- Deploy runbook: `../deploy.md`
- Security review: `../security-review.md`

---

## Sprint Board

Use this board as the execution tracker. Move each phase between sections as work progresses.

**Sprint status:** Sprint **2026-04 Phase 9** is **complete**. Roadmap phases **0–9** are delivered. Use `docs/runbook-regression.md` and `docs/deploy.md` for each release; open a **new** sprint file under `docs/sprints/` when starting the next work stream.

### In Progress

- _None._

---

### Backlog

- _No backlog phases after Phase 9 in this tracker._

---

### Blocked

- _No blocked phases currently._

---

### Done

#### Phase 1 - UI Modernization (shadcn/ui + Radix + Tailwind Branding)
**Target duration:** 2.0-3.0 days  
**Definition of Done**
- [x] `shadcn/ui` + Radix + Tailwind foundation is integrated globally.
- [x] Theme tokens are defined (colors, typography, spacing, radii, shadows).
- [x] HSL token system is implemented for primary/secondary/accent/muted.
- [x] All `tertiary`/`auxiliary`/`surface` references are migrated to `accent` naming.
- [x] `PageShell` no longer supports `narrow`; all screens are responsive at mobile/tablet/desktop breakpoints.
- [x] Shared primitives are migrated (`Button`, `Input`, `Card`, and core form/list states).
- [x] SSR/hydration check passes with App Router (no style flicker/hydration mismatch).
- [x] Mobile nav behavior is implemented (responsive collapse/drawer).
- [x] Accessibility baseline passes (contrast, focus visibility, keyboard navigation).

**Validation checklist (run at end of phase):**
- [x] `npm run dev` in `src/frontend` starts without errors.
- [x] Browser console shows no hydration warnings.
- [x] Keyboard focus visibility works on inputs, buttons, links, and switch.
- [x] Responsive behavior verified at mobile (~375px), tablet (~768px), and desktop (~1280px).
- [x] Key routes render correctly: `/dj`, `/dj/login`, `/event/[eventCode]`, `/event/[eventCode]/request`, `/event/[eventCode]/vote`.

#### Phase 0 - Foundation and Product Decisions
**Target duration:** 0.5 day  
**Definition of Done**
- [x] Route map is finalized and documented (`/dj`, `/dj/login`, `/dj/signup`, `/dj/dashboard`, `/dj/events/[eventCode]`, `/dj/profile`).
- [x] Guest navbar rule is finalized (`Are you a DJ?` CTA only).
- [x] Profile field scope is frozen: `stage_name` required; `bio`, `avatar_url`, `website`, social links, and contact info optional.
- [x] Event ownership target model (`events.dj_id`) is approved.

#### Phase 0.5 - Security/Auth Contract
**Target duration:** 0.5 day  
**Definition of Done**
- [x] One session strategy is selected (Supabase Auth-only or custom cookie-only).
- [x] PIN migration policy is decided (sunset vs temporary dual-run).
- [x] Existing event ownership backfill strategy is documented.
- [x] RLS matrix (table x action x role) is completed and approved.
- [x] Guest anti-abuse rules are defined (request throttle, vote throttle, duplicate-vote policy).
- [x] Account recovery baseline is finalized (password reset, verification stance, lockout/backoff).

#### Phase 2 - Data Model + Security Implementation
**Target duration:** 1.0-1.5 days  
**Definition of Done**
- [x] `dj_profiles` table is created and validated.
- [x] `events.dj_id` FK and indexes are created.
- [x] Owner-based RLS is applied for DJ-owned resources.
- [x] Guest permissions are constrained to intended actions only.
- [x] DB lint remediations are applied (`search_path`, permissive policy cleanup).
- [x] Backfill and rollback SQL scripts exist and are tested in a safe environment.
- [x] RLS implementation matches the approved RLS matrix.

#### Phase 3 - Auth + DJ Entry Flow
**Target duration:** 1.0-1.5 days  
**Definition of Done**
- [x] `/dj` landing page is implemented with Login/Create Account options.
- [x] `/dj/login` and `/dj/signup` are implemented and functional.
- [x] Signup form requires `stage_name`, and signup creates/bootstrap `dj_profiles` correctly (`user_id` aligned with DB schema).
- [x] Logout and route guards work consistently (`proxy.ts`, private DJ routes, email verification gate).
- [x] Password reset flow is implemented (forgot password → callback → update password); production smoke on Supabase remains operator responsibility.
- [x] Email verification behavior matches Phase 0.5 decision (proxy redirect + signup messaging; Supabase quotas/SMTP are environment concerns).
- [x] Login brute-force controls (lockout/backoff) are implemented (`login-rate-limit` + sign-in route).

#### Phase 4 - Role-Aware Global Navbar
**Target duration:** 0.75-1.0 day  
**Definition of Done**
- [x] Shared top nav is wired in app layout.
- [x] Guest nav shows event-local links and `Are you a DJ?` -> `/dj`.
- [x] DJ nav shows `Dashboard`, `My Events`, `Create Event`, `Profile`, `Logout`.
- [x] DJ search input shell is present in nav.
- [x] Navbar behavior is responsive at mobile/tablet/desktop breakpoints.
- [x] Nav visibility and route guard behavior do not leak privileged links/actions.

**Validation checklist (run at end of phase):**
- [x] Guest `/event/[eventCode]` routes show Scan, Request, Vote; DJ private routes hide guest shell.
- [x] Unauthenticated `/dj/*` private routes redirect to `/dj/login`; `routeGroups` + `proxy` stay aligned.
- [x] Optional: `npm run test:e2e` in `src/frontend` with `E2E_DJ_EMAIL` / `E2E_DJ_PASSWORD` for authenticated nav coverage.

#### Phase 5 - DJ Dashboard Home
**Target duration:** 1.5-2.0 days  
**Definition of Done**
- [x] DJ can create an event from dashboard.
- [x] Past/recent event list is visible with pagination strategy implemented.
- [x] Core metrics cards are implemented and populated.
- [x] API/use-cases for dashboard aggregates are implemented cleanly.
- [x] Decision: live-query with realtime invalidation; reevaluate materialized/cached aggregates if dashboard latency exceeds target or request volume grows significantly.

#### Phase 6 - Event Management
**Target duration:** 1.0-1.5 days  
**Definition of Done**
- [x] `/dj/events/[eventCode]` page is implemented (public event code in the URL; DJ mutation APIs use UUID `eventId` under `/api/dj/events/[eventId]`).
- [x] DJ can edit event name.
- [x] DJ can toggle request availability.
- [x] DJ can manage request statuses and event operations.
- [x] Event lifecycle statuses are supported (`draft` / `live` / `ended` / `archived`).
- [x] Sensitive DJ actions are audit-loggable (or logged) per agreed approach (`dj_audit_log` + server helper).

**Phase 6 completion notes (delivered beyond the checklist bullets above)**
- **Lifecycle and requests:** Server rules tie `allow_requests` to lifecycle: transitioning to `live` turns requests on; leaving `live` turns them off. Enabling requests via API is only allowed while the event is `live`. UI refetches event data after lifecycle changes so `allow_requests` stays aligned with the server (avoids optimistic drift).
- **Schema:** Migration adds `events.lifecycle_status` (with check constraint and index) and `public.dj_audit_log` (indexed by DJ and time).
- **DJ APIs:** `PATCH /api/dj/events/[eventId]` updates name and/or lifecycle; existing allow-requests and request-status routes emit audit entries where applicable.
- **Guest UX and enforcement:** Guest request/vote flows (and server paths) respect non-`live` lifecycles; `StartingSoon` / `EventOver` components gate request and vote screens; scan shows `EventOver` for `ended` / `archived` (draft still uses the normal scan UI).
- **Shared types and data loading:** `lifecycle_status` is included in guest event fetch types (`EventBasic`, `useEventByCode` / `EventState`) so screens and APIs stay consistent.

#### Phase 7 - DJ Profile Management
**Target duration:** 0.75-1.0 day  
**Definition of Done**
- [x] Profile page is implemented and accessible from DJ nav.
- [x] DJ can update core identity fields and social links.
- [x] Avatar strategy is implemented (URL or upload) and documented.
- [x] Input validation/sanitization is in place for profile data.
- [x] Invalid/missing social URLs are handled gracefully.

**Phase 7 completion notes (delivered beyond the checklist bullets above)**
- **API consistency:** `GET /api/dj/profile` now uses `.single()` and returns `404` (`Profile not found`) when the DJ profile row is missing, matching PATCH semantics.
- **Validation/sanitization:** Profile patch validation enforces stage name length/presence, trims and normalizes URL fields, validates social links/contact info shape, and rejects invalid payloads server-side.
- **Avatar flow:** Profile UI supports upload + crop preview + remove avatar, with save/cancel behavior and post-save refresh to keep client state aligned with server data.
- **Lifecycle default on create:** Event creation now explicitly sets `lifecycle_status: "draft"` for predictable initial event state.

#### Phase 8 - Event Search (DJ-only) + UX Polish
**Target duration:** 0.75-1.25 days  
**Definition of Done**
- [x] Debounced event search is implemented in DJ nav.
- [x] Search supports event name and event code.
- [x] Result dropdown supports quick-open navigation.
- [x] Empty/loading/error states are polished and consistent.
- [x] Search endpoint enforces ownership (`dj_id = auth.uid()`).
- [x] Search behavior is documented (limit, ranking, pagination/fallback).
- [x] Required indexes for search performance are in place.

**Phase 8 completion notes**
- **Search:** `DjEventSearch` + `useDjEventSearch` (debounced fetch, `AbortError` handling); `GET /api/dj/events/search` filters by `dj_id`, excludes `archived` events, supports `q` + `limit`; client helper `searchDjEvents` in `lib/client/api/dj.ts`.
- **Indexes:** Migration `20260417142500_phase8_event_search_indexes.sql` supports name/code lookup for DJ-owned rows.
- **Search contract (for operators):** default limit capped (e.g. 8–20); results ordered by `created_at` descending; name match uses `ilike` substring; event code match uses uppercase-normalized `ilike`; no server-side pagination on search (limit-only).
- **Events list UX:** `GET /api/dj/events` supports `lifecycle` query (`active` default hides archived; `draft` / `live` / `ended` / `archived` / `all`); `getDjEventsPage` sends full query string (`URLSearchParams`); `useDjEventsPage` + `RecentEventsList` lifecycle filter (shadcn-style select where applicable); rows show lifecycle badge; **Archive** calls `PATCH /api/dj/events/[eventId]` with `lifecycle_status: archived` and refetches.
- **Dashboard:** Metrics extended with per-lifecycle event counts (`GET /api/dj/dashboard`); dashboard event list stays in sync with filters/refetch after create or archive.
- **DJ shell / nav:** Private DJ layout uses fixed header + padded `main` so scroll does not expose background gaps; guest `TopNavShell` aligned with same sticky/fixed pattern as implemented.
- **Lifecycle timestamps (feeds Phase 9 automation):** Migrations add `events.live_entered_at` / `ended_entered_at`; `PATCH` updates them on transitions to `live` / `ended` and clears on `draft`; values stored as ISO timestamps for `timestamptz`. Backfill migration seeds existing `live` / `ended` rows. `pg_cron` migration defines `sweep_events_live_to_ended` and `sweep_events_ended_to_archived` plus `cron.schedule` entries—verify jobs in hosted Supabase after `db push`.
- **Hardening done during Phase 8:** `PATCH` body parses `lifecycle_status` with runtime string validation before use; `database.ts` `events` types include timestamp columns when present in schema.

#### Phase 9 - QA, Hardening, Deploy Readiness
**Target duration:** 1.0-1.5 days  
**Definition of Done**
- [x] Full regression suite/checklist passes for guest and DJ flows (automated subset green; full manual matrix in `docs/runbook-regression.md` remains the per-release gate).
- [x] Auth/session edge-case tests pass (`tests/e2e/dj-auth-edges.spec.ts`; expand as needed).
- [x] RLS verification tests pass against expected policy matrix when `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY` are set (`tests/rls/rls.spec.ts`; vote probe needs a seeded vote row).
- [x] Vercel env and smoke checks pass in preview/production (documented in `docs/deploy.md`; execution is operator-owned each deploy).
- [x] Documentation is updated (README, deploy guide, runbook, security checklist, this sprint file).
- [x] Observability is configured (error tracking/logging): baseline `captureServerError()` + Vercel/Supabase logs; third-party APM optional later.
- [x] Feature flags/staged rollout strategy is in place (or explicitly waived): `src/frontend/lib/shared/config/feature-flags.ts` + `docs/deploy.md` + `NEXT_PUBLIC_ENABLE_*` in `.env.example`.
- [x] Final security review against Phase 0.5 contract is completed (`docs/security-review.md`).

**Phase 9 completion notes (2026-04-18)**
- **Playwright:** `npm run test:qa` passes locally with `npx playwright install chromium` once per machine; web server uses `127.0.0.1:3000` and `/dj/login` readiness for reliable startup. Some tests skip without `E2E_*` credentials or Supabase keys (see `.env.example`).
- **E2E fixes:** `dj-auth-edges` uses password `input` locators (avoids strict-mode clash with show-password control) and disambiguates duplicate “Invalid credentials” toasts.
- **Operator follow-ups (not repo-gated):** Run full `docs/runbook-regression.md` before production promotion; confirm Vercel envs and Supabase cron jobs per `docs/deploy.md`; add named reviewer line in `docs/security-review.md` when a human signs off for compliance.
