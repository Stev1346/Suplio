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

## Sprint Tracking

Sprint boards are tracked under:

- `docs/sprints/`

**Latest closed sprint:** `docs/sprints/sprint-2026-04-phase-9.md` (Phase 9 — QA, Hardening, Deploy Readiness; closed **2026-04-18**).

When you start the next iteration, add a new file (for example `docs/sprints/sprint-2026-05-<topic>.md`) and link it here as the active tracker.
