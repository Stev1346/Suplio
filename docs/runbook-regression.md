# Suplio – Release Regression Checklist

Run through this before promoting a build from Preview → Production.

**Karaoke Mode delivery** (Phase 7 complete 2026-04-23; sprint tracker `sprints/sprint-2026-05-karaoke-mode.md`): Automated checks executed from `src/frontend`:
- `npm run lint` (0 errors, warnings only)
- `npm run build` (success)
- `npm run test:qa` (6 passed, 6 skipped, 0 failed)

**Sprint 2026-06 Public Landing (Phase 6 verification, 2026-05-08):** Automated checks executed from `src/frontend`:
- `npm run lint` (0 errors, 3 warnings — unused imports in `app/auth/sign-in/route.ts`)
- `npm run build` (success)
- `npm run test:qa` (6 passed, 6 skipped, 0 failed; requires `npx playwright install chromium` where browsers are missing)

**Sprint 2026-07 Custom Event Designs (Phase 7 verification, 2026-06-02):** Automated checks executed from `src/frontend`:
- `npm run lint` (0 errors, 4 warnings — pre-existing in `app/auth/sign-in/route.ts` and `tier-gates.ts`)
- `npm run build` (success)
- `npm run test:unit` (Vitest: 35 passed across 6 files — pure-helper coverage for event-code rules, color normalization, QR color resolution, guest theme resolution, the create-design parser, and the QR filename)
- `npm run test:qa` requires Supabase/E2E credentials per `src/frontend/.env.example`; custom-designs Playwright specs skip unless `E2E_CED_ENABLED=1` + `E2E_LIVE_EVENT_CODE` are set; restart the dev server with `NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS=true` when exercising flag-gated UI

Rows below remain the **human** gate for each Preview -> Production promotion. Tick boxes per release.

Related docs:

- `project-description.md`
- `features/features-dj-login-and-event-management.md`
- `features/features-custom-event-designs.md`
- `features/features-public-landing.md`
- `features/features-onboarding.md`
- `sprints/sprint-2026-05-karaoke-mode.md`
- `sprints/sprint-2026-07-custom-event-designs.md`
- `sprints/sprint-2026-06-public-landing.md`
- `sprints/sprint-2026-08-onboarding.md`
- `deploy.md`
- `security-review.md`

## Sprint 2026-08 Onboarding (and navigation/metadata)

Onboarding tours require `NEXT_PUBLIC_ENABLE_ONBOARDING=true` when exercising flag-gated UI. **Return-to-event link** and **document titles** are always on (not gated by the onboarding flag). **Phase 0 UX locked 2026-06-02** — see [`features/features-onboarding.md`](features/features-onboarding.md); expand human rows in Phase 5 when implementation lands. Human rows below remain the gate until checked on Preview.

### Onboarding (flag-gated)

- [ ] With flag on: DJ first-run onboarding shows on `/dj/dashboard`; Done on step 6 persists; dismiss without Done re-shows per Phase 0.
- [ ] With flag on: guest first-run onboarding shows per first-visit rules; not on every in-event navigation.
- [ ] With flag off: no onboarding UI; no console errors.

### Return to event (always on)

- [ ] Visit live guest event (note subpath, e.g. Vote) → go to `/` via Suplio logo → **Return to {EventName}** visible → returns to last subpath (fallback Scan).
- [ ] Same flow via **Are you a DJ?** → DJ login → return link still available → returns to event.
- [ ] Incognito / no prior event → no return link on `/` or DJ login.
- [ ] Mobile sheet menu shows return link when applicable.

### Document titles (always on)

- [ ] Guest Scan / Request / Vote (or Karaoke) tabs show distinct titles including event name.
- [ ] DJ login and dashboard tabs are not generic `"Suplio"` only.
- [ ] Marketing `/` title unchanged from approved landing copy.

## Custom Event Designs (flag-gated)

Requires `NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS=true` on the deployment under test (Preview recommended; keep off in Production until the human rows below pass on Preview). Automated coverage: pure-helper logic is covered by `npm run test:unit` (Vitest); the guest/DJ flows have env-gated Playwright specs (`vote-queue-filter`, `scan-qr-popup`, `qr-png-download`, `custom-event-code-api`). The rows below remain the human gate.

### Custom event code

- [ ] Creating an event with a valid custom code persists and routes correctly at `/event/{code}`.
- [ ] Creating with an invalid / reserved / duplicate (non-archived) code shows a clear error (API returns 400/409).
- [ ] Editing a custom code from event management decrements **edits remaining** only on an actual change.
- [ ] After 2 successful edits, the edit input is hidden in the UI and the API rejects further edits (400).
- [ ] `dj_audit_log` records an `event_code_changed` entry per change with previous/next values.

### Custom event color

- [ ] Color set at creation appears on guest event pages (scan, request, vote, karaoke list).
- [ ] Editing color from event management updates guest pages on next load (no 2-edit cap on color).
- [ ] Contrast fallback engages for an extreme/near-white color (affected surface uses the platform default hue).
- [ ] DJ shells, auth pages, and marketing landing are visually unchanged.

### QR design

- [ ] All curated designs (basic, rounded, frame, bold) render on the guest Scan page and the DJ event-management surface.
- [ ] Tinted designs reflect the event color; light colors fall back to a scannable foreground.
- [ ] Switching designs from event management updates the rendered output.

### QR PNG download

- [ ] DJ can download the QR PNG from event management.
- [ ] Guest can download the QR PNG from `/event/{live_eventCode}/scan` when the flag is on.
- [ ] Download produces `suplio-qr-{eventCode}.png` (~1024×1024, transparent background); QR scans to `/event/{eventCode}/request`.
- [ ] With the flag off, the Scan page has no download button and matches pre-sprint behavior.

### Scan popup

- [ ] QR control (header action row) is visible on guest event pages while `live`.
- [ ] Clicking opens a dialog with the Scan view content without navigating away.
- [ ] Escape and overlay click close the popup; reduced motion is respected.
- [ ] Underlying page state survives popup close (e.g. a partially typed request).
- [ ] Control is hidden on `ended` / `archived` events (matches EventOver).

### Queue filter (song_request mode)

- [ ] Vote page renders **All / Active / Played**, with **Active** selected by default.
- [ ] Switching filters changes only the visible list (no API call).
- [ ] Played rows show a **Played** badge and have voting disabled.
- [ ] Karaoke guest pages share the header QR chrome; the vote filter is not shown on the karaoke list.

### Cross-cutting

- [ ] Feature flag off = no new UI; existing guest/DJ/karaoke/lifecycle/auth flows behave exactly as today, with no console errors.
- [ ] Tier-gate helper (`isTierAllowedForFeature`) returns `true` for all DJs today; the single flip point is reserved for IDEA-009.
- [ ] No new RLS policies; new `events` columns inherit the existing owner-based policy.

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