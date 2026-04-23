# Suplio – Release Regression Checklist

Run through this before promoting a build from Preview → Production.

**Sprint 2026-04 Phase 9 (2026-04-18):** Automated Playwright suite (`npm run test:qa` in `src/frontend`) passes for the covered paths; rows below stay the **human** gate for each promotion. Tick boxes when you complete them for that release.

Related docs:

- `project-description.md`
- `DJ Login and Event Management.md`
- `sprints/sprint-2026-04-phase-9.md`
- `deploy.md`
- `security-review.md`

## Guest flow
- [ ] `/event/[eventCode]` loads for a `draft` event (should show Scan only, not request/vote).
- [ ] `/event/[eventCode]` for a `live` event shows Scan, Request, Vote.
- [ ] `/event/[eventCode]` for `ended`/`archived` event shows EventOver.
- [ ] Request submission enforces 60s throttle (second submit within 60s returns 429).
- [ ] Vote toggle respects one-active-vote-per-request rule (server + client).
- [ ] Realtime updates: a new request appears on Vote page without refresh.

## DJ flow
- [ ] Signup requires `stage_name`; row created in `dj_profiles` with matching `user_id`.
- [ ] Login lockout triggers after 5 failed attempts within 15 minutes (see `login-rate-limit.ts`).
- [ ] Password reset email arrives; reset link opens update-password screen.
- [ ] Unverified email is blocked from `/dj/*` private routes except the verification-safe paths.
- [ ] `/dj/dashboard` shows per-lifecycle metric cards.
- [ ] `/dj/events/[eventCode]` allows rename, lifecycle transitions, allow_requests toggle.
- [ ] Lifecycle transition `draft → live` clears `ended_entered_at` and sets `live_entered_at`.
- [ ] Lifecycle transition `live → ended` sets `ended_entered_at` and flips `allow_requests` off.
- [ ] Archive from list calls PATCH with `lifecycle_status: archived` and refetches.
- [ ] Event Search filters by name + code, excludes archived.
- [ ] Logout returns to `/dj/login` and clears the Supabase session cookie.

## Cross-cutting
- [ ] 404 page renders for an unknown `eventCode`.
- [ ] Keyboard focus visible on all interactive elements.
- [ ] Mobile (~375px), tablet (~768px), desktop (~1280px) all render without horizontal scroll.