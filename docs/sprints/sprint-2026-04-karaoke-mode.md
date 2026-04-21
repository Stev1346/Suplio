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

**Sprint status:** In Progress (Phase 3).

### In Progress

#### Phase 3 - Karaoke Intake Form
**Target duration:** 0.75-1.0 day  
**Definition of Done**
- [ ] Karaoke request form requires performer name, song name, and artist name.
- [ ] Request submission persists performer name correctly.
- [ ] Karaoke request form behavior is mode-aware and differs from regular request form behavior.
- [ ] Song request mode behavior remains unchanged.

---

### Backlog

#### Phase 4 - Karaoke Request List Flow (No Voting)
**Target duration:** 0.75 day  
**Definition of Done**
- [ ] Vote API rejects karaoke events.
- [ ] Karaoke UI uses Request List as the third menu/user-flow option instead of Vote.
- [ ] Karaoke Request List page (dedicated guest page) shows Performing Now, Up Next, then remaining queue.
- [ ] Karaoke UI does not render voting actions or vote CTAs.
- [ ] Karaoke request flow avoids vote-oriented redirects.
- [ ] Top Requested list UI is replaced by karaoke Request List UI in karaoke mode contexts.

#### Phase 5 - FIFO Sorting Rules
**Target duration:** 0.5-0.75 day  
**Definition of Done**
- [ ] Karaoke guest request/list screens sort by oldest-first.
- [ ] Karaoke DJ request management list sorts by oldest-first.
- [ ] DJ queue controls are performer-flow based (`performing_now`, `up_next`, queue) instead of `pending`/`accepted`/`rejected`/`played`.
- [ ] DJ can remove requests from karaoke Request List and restore them later.
- [ ] Karaoke request list and regular request list remain separated during and after mode toggles.
- [ ] DJ karaoke views do not include a voting-order list.
- [ ] Non-karaoke sorting behavior is unchanged.

#### Phase 6 - QA, Regression, Documentation
**Target duration:** 0.75-1.0 day  
**Definition of Done**
- [ ] Manual QA for karaoke and non-karaoke flows passes.
- [ ] Automated checks for karaoke paths pass.
- [ ] Documentation updates are complete.

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

---

## Current Phase Start Checklist (Phase 3)

### Karaoke intake form behavior
- [ ] Ensure karaoke request form requires performer name, song name, and artist name.
- [ ] Confirm request submission persists `performer_name` for karaoke mode.
- [ ] Keep song request mode behavior unchanged.

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
