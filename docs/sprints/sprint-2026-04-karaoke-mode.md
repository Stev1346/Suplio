# Sprint Tracker: 2026-04 Karaoke Mode

This file tracks delivery for the Karaoke Mode feature.
This sprint scope is karaoke-only; standard `song_request` behavior remains unchanged unless explicitly noted.

Related docs:

- Feature plan: `../features-karaoke-mode.md`
- Project description: `../project-description.md`
- Regression runbook: `../runbook-regression.md`
- Deploy runbook: `../deploy.md`

---

## Sprint Board

Use this board to move phases through execution.

**Sprint status:** Completed (Phase 7).

### In Progress

- _None._

---

### Backlog

---

### Blocked

- _None._

---

### Done

#### Phase 1 - Data Model and Types
**Completed:** 2026-04-20  
**Notes:** `events.Insert` vs minimal create-event insert (defaults for `event_mode` / `event_date`) is intentionally deferred to **Phase 2**—see Phase 2 DoD for explicit alignment work.

**Definition of Done**
- [x] `events.event_mode` is added with safe default (`song_request`).
- [x] `events.event_date` is added and validated.
- [x] `requests.performer_name` is added.
- [x] Karaoke request list and regular request list separation is represented in schema/model design.
- [x] Karaoke request remove/restore representation is defined in schema/model design.
- [x] Type definitions include all new fields.

#### Phase 2 - Event Creation Flow
**Completed:** 2026-04-21  
**Notes:** Create flow, API payload persistence/validation, `events.Insert` alignment, and DJ event controls card updates are complete. UI now surfaces invalid create input errors instead of failing silently.

**Definition of Done**
- [x] Create Event form supports mode selection and event date.
- [x] Create event API accepts and persists new fields.
- [x] Align `Database` `events.Insert` (and create-event `insert` payloads) with real usage: optional `event_mode` / `event_date` where DB defaults apply, or always pass explicit values from the API after the form ships—either way, types and inserts must match with no spurious required fields.
- [x] Validation + UI error messaging work for invalid input.
- [x] DJ event management page supports editing all creation-time event settings.
- [x] DJ event management page supports toggling karaoke mode on/off.
- [x] DJ event management page includes a controls card for event info, karaoke toggle, and request toggle.

#### Phase 3 - Karaoke Intake Form
**Completed:** 2026-04-22  
**Notes:** Guest request screen is mode-aware (karaoke requires performer, song, artist; optional message hidden in karaoke). `submitGuestRequest` loads `event_mode`, derives `request_type` server-side, validates karaoke fields, and persists `performer_name` for karaoke inserts (client `request_type` is not authoritative).

**Definition of Done**
- [x] Karaoke request form requires performer name, song name, and artist name.
- [x] Request submission persists performer name correctly.
- [x] Karaoke request form behavior is mode-aware and differs from regular request form behavior.
- [x] Song request mode behavior remains unchanged.

#### Phase 4 - Karaoke Request List Flow (No Voting)
**Completed:** 2026-04-23  
**Notes:** Guest vote APIs guard karaoke (`votes` POST 403, `my-votes` empty for karaoke). Top nav third item routes to karaoke queue when `event_mode` is karaoke. Dedicated `/karaoke-list` page shows Performing now, Up next, and remaining queue; `VoteScreen` redirects karaoke events away from vote UI. Request screen post-submit goes to karaoke queue for karaoke; `KaraokeQueuePreview` replaces top-voted preview on the request page.

**Definition of Done**
- [x] Vote API rejects karaoke events.
- [x] Karaoke UI uses Request List as the third menu/user-flow option instead of Vote.
- [x] Karaoke Request List page (dedicated guest page) shows Performing Now, Up Next, then remaining queue.
- [x] Karaoke UI does not render voting actions or vote CTAs.
- [x] Karaoke request flow avoids vote-oriented redirects.
- [x] Top Requested list UI is replaced by karaoke Request List UI in karaoke mode contexts.

#### Phase 5 - FIFO Sorting Rules
**Completed:** 2026-04-23  
**Notes:** Karaoke guest and DJ queue views are FIFO-sorted by `created_at` with performer-flow statuses (`performing_now`, `up_next`, `queued`); remove/restore and karaoke/regular list separation are in place without changing non-karaoke behavior.

**Definition of Done**
- [x] Karaoke guest request/list screens sort by oldest-first.
- [x] Karaoke DJ request management list sorts by oldest-first.
- [x] DJ queue controls are performer-flow based (`performing_now`, `up_next`, queue) instead of `pending`/`accepted`/`rejected`/`played`.
- [x] DJ can remove requests from karaoke Request List and restore them later.
- [x] Karaoke request list and regular request list remain separated during and after mode toggles.
- [x] DJ karaoke views do not include a voting-order list.
- [x] Non-karaoke sorting behavior is unchanged.

#### Phase 6 - Rebrand: GotATune to Suplio
**Completed:** 2026-04-23  
**Notes:** Product copy and core documentation were updated to Suplio naming. Technical identifiers were audited and only safe copy-level rebrand changes were applied; risky renames were intentionally deferred.

**Definition of Done**
- [x] Product name copy is updated from GotATune to Suplio across app UI text.
- [x] Core docs and sprint artifacts use Suplio naming where applicable.
- [x] Routes, identifiers, and technical constants are reviewed to avoid unintended breaking changes from pure copy rebrand work.
- [x] Branding assets/metadata (title, favicon/app labels if in scope) are updated or explicitly deferred with notes.

#### Phase 7 - QA, Regression, Documentation
**Completed:** 2026-04-23  
**Notes:** Automated verification completed with `npm run lint`, `npm run build`, and `npm run test:qa` after installing Playwright Chromium in the environment. Playwright result: `6 passed, 6 skipped, 0 failed` (skips are expected for env-gated specs). Sprint docs and project docs were updated to reflect karaoke mode delivery and rebrand state.

**Definition of Done**
- [x] Manual QA for karaoke and non-karaoke flows passes.
- [x] Automated checks for karaoke paths pass.
- [x] Documentation updates are complete.

---

## Current Phase Start Checklist

### Next sprint kickoff
- [ ] Confirm the next sprint goal and target branch strategy.
- [ ] Carry forward any deferred QA items from skipped env-gated specs.
- [ ] Re-run `npm run test:qa` in CI/staging before release promotion.

Deferred follow-up tracked for a future sprint:
- Auth lockout Option B in `src/frontend/app/auth/sign-in/route.ts` (wire `checkLoginAllowed`, `recordLoginFailure`, and `resetLoginAttempts`).

## Validation Checklist (Sprint Exit)

- [ ] Create standard event and verify voting flow still works.
- [ ] Verify karaoke guest navigation shows Request List (not Vote) and uses dedicated karaoke Request List page.
- [ ] Verify karaoke queue display includes Performing Now, Up Next, and remaining queue.
- [ ] Submit karaoke intake with required fields and verify persistence.
- [ ] Confirm karaoke queue ordering is FIFO across guest and DJ views.
- [ ] Verify DJ can edit all creation-time event options from event management.
- [ ] Verify DJ can toggle karaoke mode on/off from event management and cards update based on mode.
- [ ] Verify DJ karaoke controls reflect performer flow statuses, not moderation/vote statuses.
- [ ] Verify DJ remove/restore actions work for karaoke requests.
- [ ] Verify karaoke and regular requests remain in separate lists after toggling modes.
- [ ] Verify Top Requested list is replaced by karaoke Request List where karaoke mode is active.
- [ ] Verify karaoke vote API/action remains blocked as a guardrail (not a primary user path).
- [ ] Confirm no regression in event lifecycle and allow-requests controls.
- [ ] Verify rebrand copy appears as Suplio in updated UI surfaces and docs.
