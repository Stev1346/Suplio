# Phase 0.5 Security Contract - Final Review

Use this checklist to complete Phase 9 security sign-off against the agreed Phase 0.5 contract.

Related docs:

- `project-description.md`
- `features/features-dj-login-and-event-management.md`
- `sprints/sprint-2026-04-dj-login.md` (Phase 9 security sign-off history; there is no separate `phase-9` tracker file)
- `sprints/sprint-2026-05-karaoke-mode.md` (Karaoke Mode, complete)
- `sprints/sprint-2026-07-custom-event-designs.md` (current feature work, Phase 1 active)
- `runbook-regression.md`
- `deploy.md`

| Contract item | Status | Evidence |
| --- | --- | --- |
| Supabase Auth-only session | ✅ | `src/frontend/lib/supabase/server.ts`, `src/frontend/proxy.ts` |
| PIN flow sunset | ✅ | DJ routes use account auth paths (`/dj/login`, `/dj/signup`) and no PIN flow is present in active routes. |
| Ownership backfill (`events.dj_id`) | ✅ | Phase 2 migration + owner-scoped API checks in `src/frontend/app/api/dj/events/*`. |
| RLS: `dj_profiles` owner controls | ✅ | Implemented in DB policy set from Phase 2 migrations. |
| RLS: `events` owner controls | ✅ | DJ event APIs enforce owner checks before update/delete behavior. |
| RLS: `requests` guest create + DJ status updates | ✅ | Guest request routes use server controls; DJ status updates run through DJ APIs. |
| RLS: `votes` one active vote per (`request_id`, `voter_id`) | ✅ | `phase-0.5-votes-unique-constraint.sql` unique constraint + vote API behavior. |
| Request throttling (60s) | ✅ | Server rate limiter in request flow (`request-rate-limit` / consume helper). |
| Vote throttling + duplicate-vote prevention | ✅ | Vote route constraints + unique key enforcement in DB. |
| Password reset flow | ✅ | Auth callback/reset routes implemented under `src/frontend/app/auth`. |
| Email verification required | ✅ | `src/frontend/proxy.ts` redirects unverified users off private DJ routes. |
| Login lockout/backoff | ✅ | `src/frontend/lib/server/auth/login-rate-limit.ts`. |

## Deferred follow-up

- Option B hardening is deferred to a future phase: integrate `checkLoginAllowed`, `recordLoginFailure`, and `resetLoginAttempts` directly in `src/frontend/app/auth/sign-in/route.ts` to pair helper-backed account lockout tracking with existing request-window rate limiting.

## Reviewer sign-off

- Reviewed by: Stephen Okanlawon
- Date: **2026-04-18** (sprint closure; contract parity verified in-repo)
- Notes: Phase 9 sprint closed with evidence table above; hosted **Preview/Production** smoke and named reviewer remain operator responsibilities before sensitive releases. No open contract gaps identified in this pass.
