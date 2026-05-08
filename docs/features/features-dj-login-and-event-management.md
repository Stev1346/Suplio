# DJ Login and Event Management Feature Plan

## Overview

This feature delivers **DJ accounts**, **Supabase Auth-only sessions**, **owner-scoped event management**, and **role-aware navigation**—replacing the legacy PIN-based model with an auditable, RLS-backed access model.

**Delivery status:** Phases **0 through 9** were executed and marked complete in [`docs/sprints/sprint-2026-04-dj-login.md`](../sprints/sprint-2026-04-dj-login.md). This document is the **feature definition** and roadmap archive; that sprint tracker remains the source of truth for `[x]` completion history.

## Product Behavior

### DJ entry and authentication

- DJs land on `/dj` with **Log in** and **Create account** paths to `/dj/login` and `/dj/signup`.
- **Signup** bootstraps `dj_profiles` with required `stage_name`.
- **Email verification** gates access to private `/dj/*` routes per Phase 0.5 contract (verification-safe paths excepted).
- **Password reset**: forgot password → email link → update password → return to login.
- **Login lockout / backoff**: 5 failed attempts within 15 minutes triggers progressive backoff (30s, 60s, 120s, 300s, 600s); 10 failed attempts within 60 minutes triggers a 30-minute lockout.
- **Logout** clears session and aligns with route guards (`proxy` / private route groups).

### Profile (`dj_profiles`)

- **Required:** `stage_name`.
- **Optional:** `bio`, `avatar_url`, `website`, social links, contact info.
- **RLS:** owner can select/insert/update; delete admin-only.

### Events and ownership

- Events are owned via **`events.dj_id`** (FK to authenticated DJ).
- **Lifecycle:** `draft`, `live`, `ended`, `archived`; transitions drive **`allow_requests`** (e.g. only `live` may enable requests per server rules).
- DJs manage a single event at **`/dj/events/[eventCode]`** (public code in URL; mutations use server APIs as implemented).
- **Rename**, **request availability**, **request status** operations; sensitive actions emit **audit log** entries (`dj_audit_log`).
- **Lifecycle timestamps** (`live_entered_at`, `ended_entered_at`) support automation; **`pg_cron`** jobs sweep lifecycle transitions per deploy runbook.

### Dashboard

- **`/dj/dashboard`**: create-event entry point, **per-lifecycle metrics**, recent/past events list with **pagination** strategy.

### Event search (DJ-only)

- **Debounced** search in DJ nav by **event name** and **event code**.
- Results limited and **ownership-enforced** (`dj_id = auth.uid()`); archived excluded by default contract.
- Indexes support performant lookup.

### Navigation

- **Guest** nav: event-local **Scan**, **Request**, **Vote** (or karaoke equivalent where applicable); single **Are you a DJ?** → `/dj`.
- **DJ** nav: **Dashboard**, **My Events**, **Create Event**, **Profile**, **Logout**; search shell in DJ context.
- **Responsive** behavior (mobile-first); nav must not leak privileged links to guests.

### Guest anti-abuse and voting (contract from Phase 0.5)

- **Request throttle:** 60 seconds between requests per guest identity (client + server).
- **Votes:** at most **one active vote per (`request_id`, `voter_id`)**; duplicate voting prevented; enforcement client + server.
- **DB:** unique constraint `votes_request_id_voter_id_key` on `votes(request_id, voter_id)`.

### Cross-cutting engineering behavior

- **Session strategy:** Supabase Auth-only (no parallel custom cookie auth).
- **PIN migration:** immediate sunset (no dual-run).
- **Ownership backfill:** orphaned events assigned per operator strategy (admin-first-account pattern documented in Phase 0.5).
- **Observability:** server errors logged via `captureServerError()` baseline.
- **Feature flags:** centralized in [`src/frontend/lib/shared/config/feature-flags.ts`](../../src/frontend/lib/shared/config/feature-flags.ts) with `NEXT_PUBLIC_ENABLE_*` pattern.
- **RLS matrix** for `dj_profiles`, `events`, `requests`, `votes` as approved in Phase 0.5 and verified in tests.

## Implementation Phases

### Phase 0 - Foundation and Product Decisions

**Goal:** Freeze information architecture and data contracts before build churn.

**Scope**

- Route map: `/dj`, `/dj/login`, `/dj/signup`, `/dj/dashboard`, `/dj/events/[eventCode]`, `/dj/profile`.
- Guest navbar rule: **`Are you a DJ?` only** (no extra global guest chrome beyond event context).
- Profile field scope: `stage_name` required; optional bio, avatar, website, socials, contact.
- Target ownership model: **`events.dj_id`**.

**Definition of Done**

- [ ] Route map documented and stable for Phase 3+ implementation.
- [ ] Guest vs DJ nav rules documented.
- [ ] Profile required/optional fields frozen.
- [ ] Event ownership target (`events.dj_id`) approved.

### Phase 0.5 - Security / Auth Contract

**Goal:** Remove architecture ambiguity before coding sensitive paths.

**Scope**

- Session strategy (Supabase Auth-only); PIN sunset; ownership backfill policy.
- RLS matrix direction for `dj_profiles`, `events`, `requests`, `votes`.
- Guest anti-abuse: request throttle, vote rules, duplicate-vote policy; server + client enforcement.
- Account recovery: password reset flow; email verification window; login lockout/backoff numeric rules.
- SQL artifact for votes uniqueness (`phase-0.5-votes-unique-constraint.sql` / `votes_request_id_voter_id_key`).

**Definition of Done**

- [ ] Written contract matches intended Supabase Auth-only approach.
- [ ] RLS matrix documented and approved for implementation in Phase 2.
- [ ] Anti-abuse rules documented with enforcement surfaces (API + UI).
- [ ] Recovery + lockout behavior documented with measurable thresholds.
- [ ] Votes uniqueness constraint specified for schema migration.

### Phase 1 - UI Modernization (shadcn/ui + Radix + Tailwind)

**Goal:** Establish a reusable design system before feature velocity.

**Scope**

- Integrate `shadcn/ui`, Radix, Tailwind; tokenized theme (HSL-driven primary/secondary/accent).
- Migrate naming from `tertiary`/`auxiliary` to **`accent`**.
- Remove `PageShell` **`narrow`** pattern; responsive layouts at mobile/tablet/desktop.
- Migrate shared primitives (`Button`, `Input`, `Card`, core states).
- Global navbar styling + **mobile nav** (drawer/collapse).
- Accessibility baseline (contrast, focus, keyboard).
- SSR/hydration sanity with App Router.

**Definition of Done**

- [ ] Design tokens and primitives available app-wide.
- [ ] No reliance on deprecated layout width shortcuts.
- [ ] Mobile navigation implemented.
- [ ] Hydration/style regressions absent on key routes.

### Phase 2 - Data Model + Security Implementation

**Goal:** Ship schema + RLS aligned with Phase 0.5.

**Scope**

- Create **`dj_profiles`**; add **`events.dj_id`** + FK + indexes.
- Owner-based RLS for DJ-owned tables; narrow guest permissions.
- DB lint remediations (`search_path`, permissive policy cleanup).
- Backfill / rollback scripts for `dj_id` migration safety.

**Definition of Done**

- [ ] Schema supports profiles and event ownership.
- [ ] RLS implementation matches approved matrix.
- [ ] Guest paths remain least-privilege.
- [ ] Backfill and rollback scripts exist and were exercised in a safe environment.

### Phase 3 - Auth + DJ Entry Flow

**Goal:** DJs can sign up, log in, reset password, and hit guarded routes correctly.

**Scope**

- `/dj` landing; `/dj/login`, `/dj/signup`; profile bootstrap on signup.
- Logout + alignment with **`proxy`** / private DJ routes + email verification gate.
- Password reset flow end-to-end.
- Login brute-force controls wired to sign-in route helpers.

**Definition of Done**

- [ ] Signup creates `dj_profiles` with required `stage_name`.
- [ ] Private `/dj/*` routes redirect unauthenticated users to login.
- [ ] Password reset works through callback/update-password UX.
- [ ] Email verification behavior matches Phase 0.5.
- [ ] Lockout/backoff triggers per documented thresholds.

### Phase 4 - Role-Aware Global Navbar

**Goal:** One consistent top navigation across guest and DJ shells.

**Scope**

- Guest: Scan / Request / Vote + **Are you a DJ?** → `/dj`.
- DJ: Dashboard, My Events, Create Event, Profile, Logout + search shell.
- Responsive breakpoints; tests or checks that privileged links do not appear for guests.

**Definition of Done**

- [ ] Guest and DJ nav variants render in correct route groups.
- [ ] No role leakage of DJ actions to guest layout.
- [ ] DJ search shell present (wired in later phase).

### Phase 5 - DJ Dashboard Home

**Goal:** Dashboard is the control center for creating and reviewing events.

**Scope**

- Create-event card/form.
- Recent/past events list with pagination.
- Metrics cards; dashboard aggregate APIs/use-cases (live query + realtime invalidation strategy as documented in sprint).

**Definition of Done**

- [ ] DJs can create events from dashboard.
- [ ] Event list paginates sensibly.
- [ ] Metrics populate from server aggregates.

### Phase 6 - Event Management

**Goal:** DJs can operate a single event safely with lifecycle discipline.

**Scope**

- `/dj/events/[eventCode]` management screen.
- Rename event; toggle **allow_requests** consistent with lifecycle rules.
- Manage request statuses and operations.
- Lifecycle states `draft` / `live` / `ended` / `archived`.
- Audit logging for sensitive DJ actions.

**Definition of Done**

- [ ] Event detail page supports rename + lifecycle transitions + allow-requests behavior per server rules.
- [ ] Request moderation APIs/UI aligned with non-admin delete policy (`rejected` vs hard delete).
- [ ] Audit entries emitted where contract requires.

### Phase 7 - DJ Profile Management

**Goal:** DJs maintain public-facing identity fields safely.

**Scope**

- Profile edit UI; validation/sanitization for URLs and text fields.
- Avatar strategy (URL and/or upload) with remove flow.

**Definition of Done**

- [ ] Profile updates persist correctly with server validation.
- [ ] Invalid social URLs handled gracefully.
- [ ] Avatar flows match agreed UX (upload/preview/remove).

### Phase 8 - Event Search (DJ-only) + UX Polish

**Goal:** Fast jump navigation across owned events.

**Scope**

- Debounced search by name + code; dropdown quick-open.
- Search API ownership filter; limit/ranking contract; DB indexes.
- Private DJ layout polish (fixed header / scroll regions) as delivered in sprint notes.

**Definition of Done**

- [ ] Search returns only DJ-owned rows.
- [ ] Archived filtering matches product rules.
- [ ] Indexes exist for search performance.

### Phase 9 - QA, Hardening, Deploy Readiness

**Goal:** Production confidence and operator documentation.

**Scope**

- Regression passes (guest + DJ); auth edge E2E; RLS verification tests.
- Deploy/smoke guidance; observability baseline; feature flags documented.
- Security review sign-off against Phase 0.5.

**Definition of Done**

- [ ] Automated QA scripts green per environment constraints (`npm run lint`, `npm run build`, `npm run test:qa` from `src/frontend` where applicable).
- [ ] RLS probes pass when keys configured.
- [ ] README, deploy runbook, regression runbook, security checklist updated.
- [ ] Feature flags and rollback strategy documented.

## Acceptance Criteria (Feature Complete)

This feature is complete when all statements are true:

- [ ] DJs can sign up, verify email, log in, log out, and reset password.
- [ ] Private DJ routes are guarded; unverified users follow verification redirects.
- [ ] `dj_profiles` and `events.dj_id` enforce owner-based access via RLS.
- [ ] Dashboard creates events and shows metrics + paginated lists.
- [ ] Event management supports lifecycle, rename, allow-requests, and request operations with audit logging where required.
- [ ] Profile management supports stage name, optional fields, and avatar strategy.
- [ ] DJ event search is ownership-scoped and performant.
- [ ] Guest request/vote anti-abuse rules are enforced client + server with votes uniqueness in the database.
- [ ] Observability + feature flags + documentation + security review baseline exist per Phase 9.

## Validation Checklist

### Auth and session

- [ ] Signup requires `stage_name`; `dj_profiles` row aligns with `user_id`.
- [ ] Login lockout/backoff matches documented thresholds.
- [ ] Password reset completes through update-password screen.
- [ ] Unverified email cannot access private `/dj/*` except verification-safe paths.

### DJ flow

- [ ] `/dj/dashboard` loads metrics and lists.
- [ ] `/dj/events/[eventCode]` supports lifecycle transitions and allow-requests rules.
- [ ] Archive action uses PATCH with `lifecycle_status: archived` and UI refetches.
- [ ] Event search filters by name + code and excludes archived per contract.
- [ ] Logout clears session and returns to login flow.

### Guest flow (contract alignment)

- [ ] Guest nav shows **Are you a DJ?** and event-local links only.
- [ ] Request throttle enforced (60s) server-side.
- [ ] Vote behavior respects one active vote per request per voter.

### Cross-cutting

- [ ] RLS tests pass when `SUPABASE_SERVICE_ROLE_KEY` and relevant env vars are set.
- [ ] No hydration regressions on primary screens after UI modernization.
- [ ] `captureServerError` baseline active on server routes per observability doc.

## Traceability

### Data model and migrations

- Tables/columns: `dj_profiles`, `events.dj_id`, `events.lifecycle_status`, `events.live_entered_at`, `events.ended_entered_at`, `public.dj_audit_log`.
- Constraint: `votes_request_id_voter_id_key` on `votes(request_id, voter_id)`.
- RLS policies per Phase 0.5 matrix; migrations under `supabase/migrations/*`.
- Regenerate or align [`src/frontend/types/database.ts`](../../src/frontend/types/database.ts) with schema.

### Likely impacted frontend areas

- [`src/frontend/app/(dj-public)/`](../../src/frontend/app/(dj-public)/) — DJ entry, login, signup, password flows.
- [`src/frontend/app/(dj-private)/`](../../src/frontend/app/(dj-private)/) — dashboard, events, profile.
- [`src/frontend/app/api/dj/`](../../src/frontend/app/api/dj/) — DJ APIs.
- [`src/frontend/components/navigation/`](../../src/frontend/components/navigation/) — role-aware shells.
- [`src/frontend/lib/server/observability.ts`](../../src/frontend/lib/server/observability.ts) — `captureServerError`.
- [`src/frontend/lib/shared/config/feature-flags.ts`](../../src/frontend/lib/shared/config/feature-flags.ts) — feature toggles.

### Documentation

- Sprint tracker (completion history): [`docs/sprints/sprint-2026-04-dj-login.md`](../sprints/sprint-2026-04-dj-login.md)
- Product context: [`docs/project-description.md`](../project-description.md)
- Regression: [`docs/runbook-regression.md`](../runbook-regression.md)
- Deploy: [`docs/deploy.md`](../deploy.md)
- Security sign-off: [`docs/security-review.md`](../security-review.md)
