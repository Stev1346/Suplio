# Deploy runbook

Related docs:

- `project-description.md`
- `features/features-dj-login-and-event-management.md`
- `features/features-custom-event-designs.md`
- `features/features-onboarding.md`
- `sprints/sprint-2026-05-karaoke-mode.md`
- `sprints/sprint-2026-07-custom-event-designs.md` (complete 2026-06-02)
- `sprints/sprint-2026-08-onboarding.md` (active)
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
| `NEXT_PUBLIC_ENABLE_ONBOARDING` | Preview/Production (optional) | Feature flag for DJ/guest onboarding tours (`true/false` or `1/0`; default off; wire in Phase 2) |

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
- Custom Event Designs (`NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS`): enable in Preview for validation; keep off in Production until human regression rows in [`runbook-regression.md`](runbook-regression.md) pass on Preview. When on: DJ create/manage expose optional custom code, color, and QR design; guest event pages theme from `event_color`; guest Scan and DJ surfaces expose **Download QR (PNG)**; guest event headers show a Scan popup; Vote page shows an All/Active/Played queue filter (default Active). Schema Phase 1 (`events.event_color`, `events.qr_design`, `events.event_code_edits_remaining`): apply [`supabase/migrations/20260524120000_custom_event_designs_phase1.sql`](../supabase/migrations/20260524120000_custom_event_designs_phase1.sql) via `supabase db push` before Preview/Production smoke that depends on new columns. Local: set the flag in `src/frontend/.env.local` and restart the dev server after changing `NEXT_PUBLIC_*` values (build-time for client bundles).
- Onboarding (`NEXT_PUBLIC_ENABLE_ONBOARDING`): documented Phase 1 (2026-06-02). Maps to `featureFlags.onboarding` in [`feature-flags.ts`](../src/frontend/lib/shared/config/feature-flags.ts) — **wire in Phase 2**. Default when unset: `false`. Enable `true` in Preview/local when exercising DJ/guest tours; keep **off in Production** until Phase 5 human regression rows in [`runbook-regression.md`](runbook-regression.md) pass on Preview. Return-to-event navbar and per-route document titles are **not** gated by this flag. DJ completion uses `dj_profiles` columns — apply [`supabase/migrations/20260602120000_onboarding_dj_profiles.sql`](../supabase/migrations/20260602120000_onboarding_dj_profiles.sql) via `supabase db push` in **Phase 3** before smoke that depends on onboarding persistence. Local: `NEXT_PUBLIC_ENABLE_ONBOARDING=false` in `src/frontend/.env.local` (or `true` for tour dev); restart the dev server after changing `NEXT_PUBLIC_*` values.

## Observability baseline
- Server route exceptions are logged via `captureServerError()` in `src/frontend/lib/server/observability.ts`.
- Review Vercel function logs and Supabase logs during smoke checks.