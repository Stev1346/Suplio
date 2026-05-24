# Deploy runbook

Related docs:

- `project-description.md`
- `features/features-dj-login-and-event-management.md`
- `features/features-custom-event-designs.md`
- `sprints/sprint-2026-05-karaoke-mode.md`
- `sprints/sprint-2026-07-custom-event-designs.md` (active sprint)
- `runbook-regression.md`
- `security-review.md`

## Environments
- Preview: every PR auto-deploys from `main`.
- Production: promote a Preview via Vercel dashboard or `vercel promote`.

## Required environment variables (Vercel → Project → Settings → Environment Variables)
| Name | Scope | Source |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Preview + Production | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Preview + Production | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Preview + Production (server-only) | Supabase service role key |
| `GUEST_SESSION_SECRET` | Preview + Production (server-only) | 32+ random chars |
| `NEXT_PUBLIC_ENABLE_DJ_ANALYTICS` | Preview/Production (optional) | Feature flag (`true/false` or `1/0`) |
| `NEXT_PUBLIC_ENABLE_DEBUG_PANEL` | Preview/Production (optional) | Feature flag (`true/false` or `1/0`) |
| `NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS` | Preview/Production (optional) | Feature flag for custom event designs UI (`true/false` or `1/0`; default off) |

## Local and CI checks

From `src/frontend`, after `npx playwright install chromium` once per environment:

- `npm run test:qa` — Playwright E2E + RLS specs (RLS and some E2E tests skip without Supabase keys / `E2E_*` vars; see `src/frontend/.env.example`).

## Smoke checks (run against the preview URL)
1. Visit `/event/<seeded_code>` – loads.
2. Visit `/dj/login` – page renders, submit fails with bad credentials.
3. Visit `/dj/dashboard` unauthenticated – redirects to `/dj/login`.
4. Supabase dashboard → Logs → confirm no new 5xx entries in the last 10 minutes.
5. Supabase dashboard → Database → Crons: confirm `events-sweep-live-to-ended` and `events-sweep-ended-to-archived` are scheduled.

## Rollback
`vercel rollback <prev-deployment-url>` from the promoted production deployment.

## Feature flags
Feature flags are centralized in `src/frontend/lib/shared/config/feature-flags.ts`.

- Use `NEXT_PUBLIC_ENABLE_*` variables for client-visible toggles.
- Recommended staged rollout: enable in Preview, validate smoke checks, then promote and mirror the same value in Production.
- Custom Event Designs (`NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS`): enable in Preview during sprint development; keep off in Production until Phase 7 sign-off.

## Observability baseline
- Server route exceptions are logged via `captureServerError()` in `src/frontend/lib/server/observability.ts`.
- Review Vercel function logs and Supabase logs during smoke checks.