# Suplio – Release Regression Checklist

Run through this before promoting a build from Preview → Production.

**Sprint 2026-04 Karaoke Mode (through Phase 7, 2026-04-23):** Automated checks executed from `src/frontend`:
- `npm run lint` (0 errors, warnings only)
- `npm run build` (success)
- `npm run test:qa` (6 passed, 6 skipped, 0 failed)

**Sprint 2026-06 Public Landing (Phase 6 verification, 2026-05-08):** Automated checks executed from `src/frontend`:
- `npm run lint` (0 errors, 3 warnings — unused imports in `app/auth/sign-in/route.ts`)
- `npm run build` (success)
- `npm run test:qa` (6 passed, 6 skipped, 0 failed; requires `npx playwright install chromium` where browsers are missing)

Rows below remain the **human** gate for each Preview -> Production promotion. Tick boxes per release.

Related docs:

- `project-description.md`
- `features/features-dj-login-and-event-management.md`
- `features/features-custom-event-designs.md`
- `features/features-public-landing.md`
- `sprints/sprint-2026-04-karaoke-mode.md`
- `sprints/sprint-2026-05-custom-event-designs.md`
- `sprints/sprint-2026-06-public-landing.md`
- `deploy.md`
- `security-review.md`

## Public landing (`/`)
- [ ] `/` returns 200; page shows hero, Why Suplio, how it works (guest, DJ, karaoke), pricing, and footer.
- [ ] Hero and footer CTAs: **Create account** → `/dj/signup`; **Log in** → `/dj/login`.
- [ ] Spot-check visible copy has no developer or infrastructure jargon (compare to `bannedWordsChecklist` in `src/frontend/features/landing/content.ts`).
- [ ] Responsive smoke at ~375px, ~768px, and ~1280px: landing remains readable with no unusable horizontal overflow.

## Guest flow
- [ ] `/event/[eventCode]` loads for a `draft` event (should show Scan only, not request/vote).
- [ ] `/event/[eventCode]` for a `live` event shows Scan, Request, and third link based on mode (`Vote` for song request, `Karaoke Queue` for karaoke).
- [ ] `/event/[eventCode]` for `ended`/`archived` event shows EventOver.
- [ ] Request submission enforces 60s throttle (second submit within 60s returns 429).
- [ ] Vote toggle respects one-active-vote-per-request rule (server + client).
- [ ] Realtime updates: a new request appears on Vote page without refresh.
- [ ] Karaoke mode route guard redirects `/event/[eventCode]/vote` to karaoke list.
- [ ] Karaoke queue page shows `Performing Now`, `Up Next`, then remaining queue in FIFO order.

## DJ flow
- [ ] Signup requires `stage_name`; row created in `dj_profiles` with matching `user_id`.
- [ ] Login lockout triggers after 5 failed attempts within 15 minutes (see `login-rate-limit.ts`).
- [ ] Password reset email arrives; reset link opens update-password screen.
- [ ] Unverified email is blocked from `/dj/*` private routes except the verification-safe paths.
- [ ] `/dj/dashboard` shows per-lifecycle metric cards.
- [ ] `/dj/events/[eventCode]` allows rename, lifecycle transitions, allow_requests toggle.
- [ ] DJ karaoke request controls enforce single `performing_now` and single `up_next` behavior.
- [ ] Lifecycle transition `draft → live` clears `ended_entered_at` and sets `live_entered_at`.
- [ ] Lifecycle transition `live → ended` sets `ended_entered_at` and flips `allow_requests` off.
- [ ] Archive from list calls PATCH with `lifecycle_status: archived` and refetches.
- [ ] Event Search filters by name + code, excludes archived.
- [ ] Logout returns to `/dj/login` and clears the Supabase session cookie.

## Cross-cutting
- [ ] 404 page renders for an unknown `eventCode`.
- [ ] Keyboard focus visible on all interactive elements.
- [ ] Mobile (~375px), tablet (~768px), desktop (~1280px) all render without horizontal scroll.
- [ ] Rebrand copy appears as `Suplio` on primary UI surfaces and docs.