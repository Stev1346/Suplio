# Ideas backlog

Pre-feature parking lot for raw product ideas. Entries here are **not** a commitment to build; they become formal work when promoted into [`features/`](features/) and [`sprints/`](sprints/).

Related docs:

- Project hub: [`project-description.md`](project-description.md)

---

## How to use

1. Add a row to the **Ideas** table below (copy from the template).
2. When you are ready to spec work: create or update a feature doc under `docs/features/`, set **Status** to **Scoped** (or keep **Triage** until the doc is ready), and set **Feature doc** to a link such as `features/<file>.md`.
3. When you schedule delivery: add or use a sprint tracker under `docs/sprints/`, set **Status** to **Sprint**, and set **Sprint** to a link such as `sprints/<file>.md`.
4. When shipped: update **Current Delivered Scope** in [`project-description.md`](project-description.md) as needed, set **Status** to **Done**, and add any closure link in **Notes** (PR, release, or sprint wrap-up). You may keep the row for history.

**Linking:** This file lives in `docs/`. Use paths relative to this file, e.g. `features/features-onboarding.md` and `sprints/sprint-2026-08-onboarding.md` (same style as other docs, adjusted for this location).

**IDs:** Use `IDEA-001`, `IDEA-002`, … in order so ideas have stable references in chat and commits.

---

## Status values

| Status   | Meaning                                      |
| -------- | -------------------------------------------- |
| Icebox   | Captured only                                |
| Triage   | Being discussed; rough scope                   |
| Scoped   | Has a feature doc (link in **Feature doc**)  |
| Sprint   | On a sprint board (link in **Sprint**)       |
| Done     | Delivered (optional link in **Notes**)     |

---

## Ideas

| ID       | Title   | Summary   | Area   | Added   | Priority | Status | Feature doc | Sprint | Notes   |
| -------- | ------- | --------- | ------ | ------- | -------- | ------ | ----------- | ------ | ------- |
| IDEA-001 | Custom Event designs | This will allow DJs in the Pro and above tier to be able to create custom EventCodes, assign a custom eventColour (which will change the Guest website to accomodate the eventColour for the specific event) and choose from a variety of QR Code designs when creating an event. This code will be editable twice. QR code will also be a downloadable PNG file that can be downloaded and sent. | DJ/Guest | 2026-05-04 | P1 | Done | [features/features-custom-event-designs.md](features/features-custom-event-designs.md) | [sprints/sprint-2026-07-custom-event-designs.md](sprints/sprint-2026-07-custom-event-designs.md) | Delivered 2026-06-02 (Sprint 2026-07, Phases 0–7): migration/types, create flow, event-management edits, guest theming, QR presets/tint + PNG download, header Scan popup, vote queue filter (default Active), played-row UX, regression runbook + Vitest unit tests. Tier gating deferred to IDEA-009; tier-gate helper returns true today. |
| IDEA-002 | Spotify Search | This will allow Guests to search spotify for songs instead of just typing in text | Guest / DJ | 2026-05-04 | P3 | Icebox |  — |  — | This will be a paid feature. it will also check if a song has been played before or is in queue and will prevent it from being requested. |
| IDEA-003 | Song blacklist | Allow DJs to blacklist songs from being requested | DJ | 2026-05-04 | P0 | Icebox  | — | — | DJs can add either specific songs, genres, or artists to a list that prevents Guests from requesting those specific songs. Limit of 10 songs, 5 artists and 1 genre for Free Users, Pro tier gets unlimited |
| IDEA-004 | Additional DJ sorting | This will allow DJs to choose how they sort their full Request list | DJ | 2026-05-04 | P0 | Icebox | — | — | Paid feature. This will allow DJs to sort (only in non-Karaoke mode) the FullRequestList either by song name, artist name, time received, vote count, genre or even by BPM (need to add ability to determine song BPM) |
| IDEA-005 | Tip the DJ/ Tip to play | Guests will be able to Tip the DJ, or tip to boost their songs on the vote list | Guest / DJ / Platform | 2026-05-04 | P2 | Icebox | — | — | Guests can either tip the DJ directly and drop a message or "buy votes" to boost their songs on the Voted list ($1 per vote ie $100 = 100 votes on song. Request will also give an indication when a song has "bought votes" on it). For free DJs, a 30% of the money will be kept for Suplio but PRO and above DJs will get 100% of the money [minus processing fees] |
| IDEA-006 | Feedback/Bug reporting | Allow guests and DJs to submit feature requsts, feedback or report a bug | Guest / DJ | 2026-05-04 | P3 | Icebox | — | — | - |
| IDEA-007 | Venue specific adaptation | Allows venues to create a venue account | Platform | 2026-05-04 | P0 | Icebox | — | — | This will allow for specific Venue flows and options. One QR code for the venue, create specific themed events which get custom QR codes. default QR code goes to generic in house playlist. does not have or allow for similar DJ flow so DJs are incentivized to have their own accounts. Venue can add specific DJ for the night (DJ will accept invite). If there is a themed event on the Day the default QR code is scanned, there should be a popup asking if the guest is attending the themed event and would like to go to that event to make a request. When a DJ is linked, default QR code will link to the DJ's Event that's linked to the Venue for that day (add venue selection to Event creation) |
| IDEA-008 | Create staging environments | Create dev, QA and prod environments so Prod DB and Prod sites aren't impacted by changes on website | Ops | 2026-05-04 | P3 | Triage | — | — | Create staging environments on GitHub, Vercel and supabase. Evaluate costs and create as necessary |
| IDEA-009 | Subscription tiers | Implement subscription tiers (Free, Pro and Pro plus) | DJ / Platform| 2026-05-07 | P2 | Icebox | — | — | This will implement adding authorization gates to specific features unless the user has a specified subscription tier |
---

## New idea (template)

Copy the line below into the table and fill in. Use `—` where a field does not apply yet.

```text
| IDEA-### | Short title | One-line summary. | Guest / DJ / Platform / Ops | YYYY-MM-DD | P0–P3 or — | Icebox / Triage / Scoped / Sprint / Done | features/… or — | sprints/… or — | Optional notes. |
```
