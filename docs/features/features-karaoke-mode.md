# Karaoke Mode Feature Plan

## Overview

Karaoke mode introduces a singer intake workflow for events where voting is disabled and requests are handled in first-in-first-out order.

This mode is designed for collecting who is performing what song, instead of crowd-ranked song voting.
These requirements are karaoke-only behavior and do not replace standard `song_request` event behavior.

## Product Behavior

### Event setup

- DJ can select event mode during event creation:
  - `song_request` (current behavior)
  - `karaoke` (new behavior)
- DJ can set an event date during event creation.
- Karaoke mode is toggleable in DJ event management (`karaoke` <-> `song_request`) after event creation.
- For karaoke events, all event-creation options are editable from DJ event management:
  - event name
  - event mode
  - event date
- DJ event management includes an event controls card for:
  - editing event information
  - toggling karaoke mode
  - toggling requests on/off
- The rest of DJ event management renders mode-relevant cards based on whether karaoke mode is active.

### Guest intake (karaoke mode)

- Guest request form must require:
  - performer name
  - song name
  - artist name
- The third guest menu/user-flow option is a **Request List** (not Vote) for karaoke events.
- Request List shows:
  - who is **Performing Now**
  - who is **Up Next**
  - the rest of the queue order
- Karaoke Request List is on its own dedicated guest page.
- Voting is disabled for karaoke events.
- Request lists must sort by oldest request first (`created_at` ascending) for queue order.
- Karaoke and regular requests are maintained as separate lists and stay separated when mode is toggled.
- Karaoke mode changes guest request form fields and guest routing:
  - karaoke mode -> karaoke request form + karaoke Request List page
  - regular mode -> regular request form + vote page
- Where karaoke mode is active, Top Requested list UI is replaced by karaoke request list UI.

### DJ karaoke queue flow

- DJ request-state workflow for karaoke is queue-oriented, not moderation/vote-oriented.
- Replace status controls from `pending` / `accepted` / `rejected` / `played` to:
  - `performing_now` (**Performing Now**)
  - `up_next` (**Up Next**)
  - queue (remaining FIFO order)
- DJ can remove a request from karaoke Request List and restore a removed request when needed.
- DJ view must not include any voting order list for karaoke mode.

### Non-karaoke behavior

- Existing song request + voting flow remains unchanged for `song_request` events.
- Karaoke queue behavior does not alter any non-karaoke user-facing flow.

## Implementation Phases

### Phase 1 - Data Model and Types
**Goal:** Add schema support for karaoke mode and required intake fields.

**Scope**
- Add `events.event_mode` with default `song_request`.
- Add `events.event_date`.
- Add `requests.performer_name`.
- Add request list separation support so karaoke requests and regular requests are maintained independently.
- Add remove/restore representation for karaoke requests.
- Update generated/shared TypeScript DB types.

**Definition of Done**
- [ ] Migration adds all new columns safely for existing data.
- [ ] Existing events are valid after migration (default mode set).
- [ ] `src/frontend/types/database.ts` includes new fields.

### Phase 2 - Event Creation Flow
**Goal:** Allow DJs to create karaoke events and provide event date.

**Scope**
- Update create-event UI to include mode selector + date input.
- Update client submit hook payload.
- Update `/api/dj/events` POST validation and insert behavior.
- Add DJ event-management editing support for all create-time settings.
- Add toggle karaoke mode behavior on event management.
- Add event controls card behavior (info + karaoke mode + request toggle).

**Definition of Done**
- [ ] Create Event form captures name, mode, and date.
- [ ] API persists `event_mode` and `event_date`.
- [ ] Validation errors are shown for invalid payloads.
- [ ] DJ can edit event name, event mode, event date, and other creation-time settings on event management page.
- [ ] DJ can toggle karaoke mode between `karaoke` and `song_request` from event management.
- [ ] Event management renders mode-relevant cards from a single controls card baseline.

### Phase 3 - Karaoke Intake Form
**Goal:** Turn guest request screen into karaoke singer intake for karaoke events.

**Scope**
- Load event mode in guest event fetch.
- Make performer/song/artist required in karaoke mode.
- Persist `performer_name` in request insert flow.

**Definition of Done**
- [ ] Karaoke form blocks submit when required fields are missing.
- [ ] Successful karaoke submissions store performer + song + artist.
- [ ] Song request mode still works with current required fields.

### Phase 4 - Karaoke Request List Flow (No Voting)
**Goal:** Replace karaoke vote flow with request-list queue flow and enforce no-voting behavior.

**Scope**
- Replace karaoke third-menu option and route UX from Vote to Request List.
- Show `performing_now`, `up_next`, then remaining queue order.
- Keep karaoke Request List on a dedicated guest page.
- Reject vote API requests for karaoke events.
- Hide/disable vote actions in karaoke UI paths.
- Prevent karaoke request flow from redirecting users into vote UX.

**Definition of Done**
- [ ] Vote endpoint returns 403 for karaoke events.
- [ ] Karaoke UI does not show vote controls or vote menu labels.
- [ ] Karaoke request flow and navigation use Request List naming and destinations.
- [ ] Guests can view now-performing, up-next, and full queue order.
- [ ] Karaoke guest flow uses the dedicated karaoke Request List page.

### Phase 5 - FIFO Sorting Everywhere for Karaoke
**Goal:** Ensure karaoke queues are strictly oldest-first.

**Scope**
- Guest request/list views use `created_at` ascending in karaoke mode.
- DJ event manage request list uses `created_at` ascending in karaoke mode.
- Avoid vote-based ranking helpers for karaoke paths.
- Replace karaoke DJ status filters/controls with queue controls (`performing_now`, `up_next`, queue).
- Add DJ remove/restore actions for karaoke requests without breaking queue separation.
- Keep karaoke requests and regular requests in separate lists when mode toggles.

**Definition of Done**
- [ ] All karaoke request lists display oldest submissions first.
- [ ] Karaoke DJ queue controls reflect queue progression, not vote moderation statuses.
- [ ] DJ can remove and restore karaoke requests from karaoke Request List.
- [ ] Karaoke and regular request lists remain separate after mode toggles.
- [ ] Sorting remains vote-based/current behavior for song request mode.
- [ ] Realtime updates keep ordering stable.

### Phase 6 - QA, Regression, and Documentation
**Goal:** Validate karaoke behavior and protect existing flows.

**Scope**
- Add/adjust tests for karaoke create-event, request submit, vote rejection, sorting.
- Run manual QA on both event modes.
- Update project docs and sprint tracker.

**Definition of Done**
- [ ] Karaoke acceptance criteria pass (UI + API).
- [ ] Song request mode has no regressions in core flows.
- [ ] Documentation reflects finalized behavior and rollout notes.

## Acceptance Criteria (Feature Complete)

This feature is considered complete when all statements are true:

- [ ] DJ can create karaoke events with event date.
- [ ] DJ can edit karaoke event setup options (name/mode/date/other creation-time options) from event management.
- [ ] DJ can toggle karaoke mode on/off from event management.
- [ ] Karaoke request form requires performer name, song name, artist name.
- [ ] Guest karaoke navigation uses Request List (not Vote) on a dedicated karaoke Request List page and shows now/up-next/queue order.
- [ ] Karaoke DJ flow uses queue statuses (`performing_now`, `up_next`, queue) and no voting-order list.
- [ ] DJ can remove and restore requests in karaoke Request List flow.
- [ ] Karaoke and regular requests are maintained in separate lists.
- [ ] Voting is fully disabled for karaoke mode at API and UI levels.
- [ ] Karaoke request queues are FIFO (oldest first) across guest and DJ views.
- [ ] Standard song request events continue to support voting and existing ranking behavior.
- [ ] Regression checks pass and docs are updated.

## Validation Checklist

### API validation

- [ ] `POST /api/dj/events` accepts and persists `event_mode` and `event_date`.
- [ ] DJ event update API accepts and persists karaoke-editable setup fields (name, mode, date, other creation-time settings).
- [ ] DJ event update API supports karaoke mode toggling (`karaoke` <-> `song_request`).
- [ ] `POST /api/guest/event/[eventCode]/requests` enforces required karaoke fields (`performer_name`, `song_name`, `artist`).
- [ ] `POST /api/guest/event/[eventCode]/votes` returns `403` for karaoke events.
- [ ] DJ request action APIs support remove/restore actions for karaoke requests.

### UI validation

- [ ] Create Event UI includes mode selector and date input.
- [ ] DJ event management UI includes a controls card for event info, karaoke mode toggle, and request toggle.
- [ ] DJ event management UI includes editable controls for all creation-time settings.
- [ ] Karaoke request form shows required indicators and blocks invalid submissions.
- [ ] Karaoke menu label and destination use Request List (not Vote).
- [ ] Karaoke request list clearly surfaces now-performing and up-next entries.
- [ ] Karaoke request list is on a dedicated guest page.
- [ ] Top Requested list is replaced with karaoke Request List where karaoke mode is active.
- [ ] Karaoke screens do not show voting controls or vote CTAs.

### Sorting validation

- [ ] Guest karaoke request lists render oldest-first (`created_at` ascending).
- [ ] DJ karaoke request list renders oldest-first (`created_at` ascending).
- [ ] Realtime inserts appear at the correct queue position based on oldest-first sorting.
- [ ] DJ queue state updates preserve FIFO semantics for remaining queued performers.
- [ ] Remove/restore actions preserve queue integrity and list separation.

### Regression validation

- [ ] Standard `song_request` mode still supports voting behavior.
- [ ] Existing ranking behavior (vote-first ordering) still applies to non-karaoke event flows.
- [ ] Toggling karaoke mode updates visible cards/routes/forms appropriately without leaking cross-list entries.
- [ ] Event lifecycle and allow-requests controls remain unchanged outside karaoke-specific logic.

## Traceability

### Data model changes

- Add `events.event_mode` (`song_request` | `karaoke`) with a safe default.
- Add `events.event_date` for event scheduling metadata.
- Add `requests.performer_name` to support singer intake.
- Add/adjust karaoke request state representation for queue flow (`performing_now`, `up_next`, queue).
- Add/adjust request lifecycle representation for karaoke remove/restore behavior.
- Add/adjust separation model for karaoke request list vs regular request list.
- Apply through a new migration under `supabase/migrations/*`.

### Impacted files

- [`src/frontend/features/dj/dashboard/components/CreateEventCard.tsx`](../../src/frontend/features/dj/dashboard/components/CreateEventCard.tsx)
- [`src/frontend/hooks/dj/useCreateEvent.ts`](../../src/frontend/hooks/dj/useCreateEvent.ts)
- [`src/frontend/app/api/dj/events/route.ts`](../../src/frontend/app/api/dj/events/route.ts)
- [`src/frontend/lib/client/api/events.ts`](../../src/frontend/lib/client/api/events.ts)
- [`src/frontend/hooks/guest/useEventByCode.ts`](../../src/frontend/hooks/guest/useEventByCode.ts)
- [`src/frontend/features/guest/event/request/SongRequestScreen.tsx`](../../src/frontend/features/guest/event/request/SongRequestScreen.tsx)
- [`src/frontend/app/api/guest/event/[eventCode]/requests/route.ts`](../../src/frontend/app/api/guest/event/[eventCode]/requests/route.ts)
- [`src/frontend/lib/server/guest/submit-request.ts`](../../src/frontend/lib/server/guest/submit-request.ts)
- [`src/frontend/app/api/guest/event/[eventCode]/votes/route.ts`](../../src/frontend/app/api/guest/event/[eventCode]/votes/route.ts)
- [`src/frontend/features/guest/event/vote/VoteScreen.tsx`](../../src/frontend/features/guest/event/vote/VoteScreen.tsx)
- [`src/frontend/hooks/guest/useEventRequests.ts`](../../src/frontend/hooks/guest/useEventRequests.ts)
- [`src/frontend/features/dj/events/detail/DjEventManageScreen.tsx`](../../src/frontend/features/dj/events/detail/DjEventManageScreen.tsx)
- [`src/frontend/types/database.ts`](../../src/frontend/types/database.ts)
