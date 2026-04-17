# DJ Login and Event Management

## Updated Project Timeline

Below is the revised plan with the new **Phase 0.5** inserted at the right point, and each phase includes key gap-closure tasks.

---

## Phase 0 - Foundation and Product Decisions (0.5 day)

### Goals
- Confirm IA/routes for guest and DJ.
- Finalize UX rule: guest navbar has `Are you a DJ?` only.
- Lock auth choice options to evaluate in next phase.

### Tasks
- Define route map (`/dj`, `/dj/login`, `/dj/signup`, `/dj/dashboard`, `/dj/events/[eventCode]`, `/dj/profile`).
- Define profile fields (required vs optional): `stage_name` required; `bio`, `avatar_url`, `website`, social links, and contact info optional.
- Confirm event ownership model (`events.dj_id` target state).

### Gap tasks covered
- Prevent route churn by freezing URL conventions early.
- Prevent profile scope creep by freezing required fields now.

---

## Phase 0.5 - Security/Auth Contract (0.5 day)

### Goals
- Eliminate the biggest architecture risks before coding.

### Finalized Decisions
- **Session strategy:** Supabase Auth-only.
- **PIN migration policy:** immediate sunset.
- **Ownership backfill:** set `events.dj_id` to the admin account; admin is the first account created when user creation is enabled.
- **RLS matrix direction:**
  - `dj_profiles`: owner can `select/insert/update`; delete is admin-only.
  - `events`: owner can `select/insert/update`; delete is admin-only.
  - `requests`: guests create via server route; DJs update status (use `rejected` instead of delete for non-admin behavior); delete is admin-only.
  - `votes`: guests can add/remove their own vote through server route; one active vote per (`request_id`, `voter_id`); delete row on vote removal is allowed; delete outside vote removal is admin-only.
- **Guest anti-abuse controls:**
  - request throttling: 60 seconds between requests per user.
  - vote throttling: max one active vote per song/request per user, no time limit for keeping a vote.
  - duplicate-vote policy: no double-voting on the same active request vote.
  - enforcement: both client and server.
- **Account recovery baseline:**
  - password reset flow: email entry -> verify account exists -> send reset link -> set new password -> return to login.
  - email verification required within 24 hours.
  - login lockout/backoff: 5 failed attempts in 15 minutes triggers progressive backoff (30s, 60s, 120s, 300s, 600s). 10 failed attempts in 60 minutes triggers 30-minute lockout.
- **DB constraint script:** `phase-0.5-votes-unique-constraint.sql` adds unique constraint `votes_request_id_voter_id_key` on `votes(request_id, voter_id)`.

### Gap tasks covered
- Auth/session ambiguity
- PIN-to-account migration risk
- Missing RLS contract
- Missing anti-abuse rules
- Missing recovery flow

---

## Phase 1 - UI Modernization (shadcn/ui + Radix + Tailwind Branding) (2.0-3.0 days)

### Goals
- Establish a modern, reusable design system before new features.

### Tasks
- Add `shadcn/ui` with Radix primitives and Tailwind configuration.
- Create tokenized theme (colors, typography, spacing, radii, shadows).
- Switch design tokens to an HSL color system with hue-driven variables.
- Rename `tertiary`/`auxiliary` color naming to `accent`.
- Remove `narrow` layout behavior and make all screens responsive (no hardcoded page widths).
- Replace shared primitives first (`Button`, `Input`, `Card`, etc.).
- Build global navbar visual style and responsive behavior.
- Accessibility pass (contrast, focus, keyboard).

### Gap tasks covered
- Add SSR/hydration checkpoint for `shadcn/ui` + Radix with App Router.
- Add mobile nav requirement explicitly (drawer/collapsed menu).
- Add loading/skeleton/error visual standards for consistency.

---

## Phase 2 - Data Model + Security Implementation (1.0-1.5 days)

### Goals
- Ship account-based ownership and hardened access control.

### Tasks
- Create `dj_profiles`.
- Add `events.dj_id` + FK + indexes.
- Implement owner-based RLS for events/profile.
- Keep guest permissions narrowly scoped.
- Apply DB lint remediations (`search_path`, permissive policy cleanup).

### Gap tasks covered
- Backfill script for orphaned events (`dj_id` null).
- Rollback script for migration safety.
- Verify RLS matrix parity with implemented SQL.

---

## Phase 3 - Auth + DJ Entry Flow (1.0-1.5 days)

### Goals
- DJs can land, sign up, log in, and recover account.

### Tasks
- Build `/dj` landing page with Login/Create Account options.
- Build `/dj/login` and `/dj/signup`.
- Create profile bootstrap on signup, with required `stage_name` in the signup form.
- Add logout and auth guard behavior.

### Gap tasks covered
- Implement password reset flow now (not later).
- Add email verification toggle decision from Phase 0.5.
- Add lockout/backoff rules for brute-force on login endpoints.

---

## Phase 4 - Role-Aware Global Navbar (0.75-1.0 day)

### Goals
- One consistent top nav for all app contexts.

### Tasks
- Guest nav:
  - event-local links (`Scan`, `Request`, `Vote`)
  - single CTA `Are you a DJ?` -> `/dj`
- DJ nav:
  - `Dashboard`, `My Events`, `Create Event`, `Profile`, `Logout`
- Add search input shell placeholder for DJ area.

### Gap tasks covered
- Responsive breakpoint behavior (mobile-first).
- Route guard + nav visibility tests to avoid role leakage.

---

## Phase 5 - DJ Dashboard Home (1.5-2.0 days)

### Goals
- Central control center for DJs.

### Tasks
- Create event card/form.
- Past/recent events list.
- Metrics cards and recent activity snapshot.
- API use-cases for dashboard aggregates.

### Gap tasks covered
- Define metrics source-of-truth (direct query vs cached/materialized view).
- Add pagination strategy for event lists.

---

## Phase 6 - Event Management (1.0-1.5 days)

### Goals
- DJs can manage a single event safely.

### Tasks
- `/dj/events/[eventCode]` management page.
- Rename event.
- Toggle request availability.
- See/manage request statuses and operations.

### Gap tasks covered
- Add event lifecycle statuses (`draft/live/ended/archived`).
- Add audit log hooks for sensitive DJ actions.

---

## Phase 7 - DJ Profile Management (0.75-1.0 day)

### Goals
- DJs can manage profile and account-facing identity.

### Tasks
- Profile edit form.
- Social links + bio + stage/display name.
- Avatar strategy (URL or upload).

### Gap tasks covered
- Validation/sanitization rules for profile fields.
- Clear handling for missing/invalid social URLs.

---

## Phase 8 - Event Search (DJ-only) + UX Polish (0.75-1.25 days)

### Goals
- Fast event lookup and jump navigation.

### Tasks
- Debounced DJ-owned event search.
- Search by event name and event code.
- Dropdown results with quick-open.
- Empty/loading/error states.

### Gap tasks covered
- Ownership enforcement in search endpoint (`dj_id = auth.uid()`).
- Define search behavior (limit, ranking, pagination/fallback).
- Add indexing for performant search.

---

## Phase 9 - QA, Hardening, Deploy Readiness (1.0-1.5 days)

### Goals
- Production safety and release confidence.

### Tasks
- Full regression: guest + DJ paths.
- Auth/session edge-case testing.
- RLS verification tests.
- Vercel env/setup checks and smoke tests.
- Documentation updates (README/deploy/runbook).

### Gap tasks covered
- Add observability (error tracking/logging).
- Add feature flags or staged rollout toggles.
- Final security review against Phase 0.5 contract.

---

## Updated Total Estimate

- Core (through Phase 6): **~8.25 to 11.5 days**
- Full scope (through Phase 9): **~10.75 to 15.25 days**

---

## Sprint Board

Use this board as the execution tracker. Move each phase between sections as work progresses.

**Sprint status:** Phase 7 (DJ Profile Management) is **complete**. **In progress:** Phase 8 — Event Search (DJ-only) + UX Polish.

### In Progress

#### Phase 8 - Event Search (DJ-only) + UX Polish
**Target duration:** 0.75-1.25 days  
**Definition of Done**
- [ ] Debounced event search is implemented in DJ nav.
- [ ] Search supports event name and event code.
- [ ] Result dropdown supports quick-open navigation.
- [ ] Empty/loading/error states are polished and consistent.
- [ ] Search endpoint enforces ownership (`dj_id = auth.uid()`).
- [ ] Search behavior is documented (limit, ranking, pagination/fallback).
- [ ] Required indexes for search performance are in place.

---

### Backlog

#### Phase 9 - QA, Hardening, Deploy Readiness
**Target duration:** 1.0-1.5 days  
**Definition of Done**
- [ ] Full regression suite/checklist passes for guest and DJ flows.
- [ ] Auth/session edge-case tests pass.
- [ ] RLS verification tests pass against expected policy matrix.
- [ ] Vercel env and smoke checks pass in preview/production.
- [ ] Documentation is updated (README, deploy guide, runbook).
- [ ] Observability is configured (error tracking/logging).
- [ ] Feature flags/staged rollout strategy is in place (or explicitly waived).
- [ ] Final security review against Phase 0.5 contract is completed.

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
