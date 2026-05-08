# Custom Event Designs Feature Plan

## Overview

Custom Event Designs gives DJs branded, recognizable events. DJs can pick a **custom event code** (vanity URL slug), choose a **custom event color** that themes the entire guest event experience, select a **QR code design** from a small curated set, and **download** the rendered QR as a PNG to drop into flyers, slides, or signage. The same sprint also adds two guest-facing extras explicitly attached to this idea: a **corner scan popup** so guests can re-surface the QR over the current page, and a **queue filter** that lets guests view played-only / active-only / all on the Vote page (`song_request` mode).

**Subscription gating is deferred to [IDEA-009](../backlog-ideas.md).** This sprint is built and shipped without tier checks today: a single tier-gate helper is introduced in Phase 0 that returns `true` for all DJs and is referenced everywhere this feature would otherwise be tier-gated. When [IDEA-009](../backlog-ideas.md) lands, only that helper changes — call sites do not.

This feature is **additive**: existing event creation, lifecycle, request, vote, karaoke, auth, and RLS behavior remain unchanged unless a phase explicitly extends them.

Product positioning aligns with [`docs/project-description.md`](../project-description.md): QR-based song requests, guest voting where applicable, DJ dashboard control, and crowd engagement.

## Product Behavior

### Custom event code (vanity slug)

- DJ may set a **custom event code** at event creation. If omitted, the existing auto-generated code remains.
- **Edit rule:** the custom code can be **edited up to 2 times after creation** (3 total possible values: initial + 2 edits). Once exhausted, the event-management UI hides the edit affordance and the API rejects further edits.
- **Validation:** length, allowed character set (URL-safe), case rules, reserved-word list, and uniqueness across active (non-archived) events. Exact regex frozen in Phase 0.
- **Audit:** every code change emits a `dj_audit_log` entry with the previous and new code.
- **Routing:** existing public route shape `/event/[eventCode]` is unchanged; the slug being DJ-set vs auto-generated is invisible to guests.
- **Old-code behavior:** the previous code is **not preserved** as a redirect alias for this sprint (kept simple); existing materials referring to the old code are the DJ's responsibility, and the edit-twice cap helps prevent thrash. A redirect alias model can be revisited as a follow-up idea if the data shows demand.

### Custom event color

- DJ picks a color (hex) at create time and may change it any time from event management — **not** subject to the 2-edit cap.
- The chosen color drives **guest event pages only** (`/event/[eventCode]/*` shells: scan, request, vote, karaoke list). DJ surfaces and the marketing/auth shells are **not** themed.
- Implemented as a CSS custom property override at the guest event layout level so existing tokens (e.g. accent / primary scales) re-derive from the chosen hue without per-component edits.
- **Contrast safety:** if the chosen color produces unreadable contrast against page backgrounds or buttons, the system falls back to the existing accent token for the affected surface. The exact contrast threshold is finalized in Phase 0.

### QR code design

- DJ chooses from a **small curated set of QR designs** (e.g. classic, rounded, dotted, framed) at create time and may change the choice any time from event management — not subject to the 2-edit cap.
- Designs render consistently across the DJ "share" surface and the guest Scan page.
- The chosen color tints the QR design where the design supports it (e.g. dot color); pure-black designs ignore tinting and are noted as such in the picker.

### QR PNG download

- A **Download QR (PNG)** action is available on:
  - The DJ event-management surface (so DJs can grab the asset for promo materials).
  - The guest Scan page (so guests / promoters can save and share offline).
- The downloaded file is named after the event code (e.g. `suplio-<event_code>.png`).
- PNG resolution is high enough to print legibly at common flyer sizes (target finalized in Phase 0).

### Corner scan popup

- Guest event pages display a small QR icon in a corner of the event chrome. Clicking it opens the **Scan view as a Radix dialog popup** layered over the current page (request, vote, or karaoke list) without navigating away.
- Closing the popup returns the guest to the page they were on, with no state loss in the underlying view.
- Hidden when the event lifecycle is `ended` / `archived` (matches the existing `EventOver` behavior).

### Guest queue filter (song_request mode)

- The guest **Vote page** gains a filter control with three options: **All** (default — current behavior), **Active only** (hide played), **Played only** (show played history).
- Filter is **session-scoped** UI state only; no persistence and no API change.
- **Karaoke mode is unchanged.** The karaoke Request List already segments `Performing Now` / `Up Next` / queue and is out of scope for this filter.

### Cross-cutting

- **Tier gate:** a single helper (target location: `src/frontend/lib/shared/auth/dj-tier.ts`) returns `true` today and is the only place to flip when [IDEA-009](../backlog-ideas.md) ships. UI affordances and API guards both reference this helper rather than inlining tier checks.
- **Feature flag:** all new UI is gated by a single new flag on [`src/frontend/lib/shared/config/feature-flags.ts`](../../src/frontend/lib/shared/config/feature-flags.ts) with the `NEXT_PUBLIC_ENABLE_*` pattern (exact name finalized in Phase 0). Flag off = current behavior, no console errors.
- **Accessibility:** color picker, QR picker, scan popup, and queue filter must be keyboard operable with visible focus and `prefers-reduced-motion` respected.
- **No RLS expansion:** new columns inherit existing `events` owner-based policy; no new permissive policies introduced.

## Implementation Phases

### Phase 0 - Discovery and decisions

**Goal:** Lock the small set of decisions that gate downstream work so build phases do not stall.

**Scope**

- Choose QR rendering library: continue with [`qrcode.react`](../../src/frontend/features/guest/event/scan/ScanScreen.tsx) plus a thin design-preset wrapper, or adopt `qr-code-styling` for richer designs. Trade-offs noted in sprint.
- Custom event code rules: regex, min/max length, case handling, reserved-word list (e.g. `dj`, `auth`, `event`, `api`, etc.), uniqueness scope (active vs all-time).
- Edit-counter mechanic: store as integer column on `events` (`event_code_edits_remaining` defaulting to `2`); decrement only on actual code change.
- Color guardrails: input format (hex), contrast threshold (e.g. WCAG AA), per-surface fallback rule.
- QR design preset list (names + visual brief).
- Tier-gate helper location and signature.
- Feature flag name and default (off in Production until Phase 7 sign-off).
- PNG download target resolution and filename pattern.

**Definition of Done**

- [ ] QR library decision recorded with rationale.
- [ ] Custom event code rules frozen (regex, length, reserved words, uniqueness scope).
- [ ] Edit-counter mechanic and audit-log shape documented.
- [ ] Color contrast / fallback policy documented.
- [ ] QR design preset list approved.
- [ ] Tier-gate helper file path and signature documented.
- [ ] Feature flag name and default value documented.
- [ ] PNG download resolution and filename pattern documented.

### Phase 1 - Data model and types

**Goal:** Schema additions land safely behind defaults so existing events stay valid.

**Scope**

- New idempotent migration under `supabase/migrations/*` adding:
  - `events.event_color` (text, nullable).
  - `events.qr_design` (text, default the chosen "classic" preset, check constraint over the curated set).
  - `events.event_code_edits_remaining` (integer, not null, default `2`).
- Sync new fields into [`src/frontend/types/database.ts`](../../src/frontend/types/database.ts) (`Row`, `Insert`, `Update` shapes).
- No RLS changes.

**Definition of Done**

- [ ] Migration is idempotent and safe to re-run.
- [ ] Existing events remain valid after migration (defaults applied).
- [ ] `Database` types include all new fields with correct nullability.
- [ ] No regression in existing reads/writes that ignore the new fields.

### Phase 2 - Event creation flow

**Goal:** DJs can set custom code, color, and QR design at create time.

**Scope**

- Extend [`CreateEventForm.tsx`](../../src/frontend/features/dj/dashboard/components/CreateEventForm.tsx) with optional **custom code** input, **color picker**, and **QR design picker**.
- Update [`/api/dj/events`](../../src/frontend/app/api/dj/events/route.ts) POST validation:
  - Validate custom code (regex / reserved / unique-active) and reject on conflict with a friendly message.
  - Persist `event_color`, `qr_design`, and seed `event_code_edits_remaining = 2`.
- Reference the tier-gate helper at the API boundary (returns `true` today) so the gate is wired but inert.
- Update [`useCreateEvent`](../../src/frontend/hooks/dj/useCreateEvent.ts) and [`lib/client/api/events.ts`](../../src/frontend/lib/client/api/events.ts) payloads to carry the new fields.
- Leave default behavior intact (omitting any new field works exactly like today).

**Definition of Done**

- [ ] Create Event form captures optional custom code, color, and QR design.
- [ ] API persists new fields and rejects invalid / duplicate custom codes with a usable error message.
- [ ] Tier-gate helper is wired at the API boundary (returns `true` today; single flip point for IDEA-009).
- [ ] Existing event creation (no custom fields supplied) still works.

### Phase 3 - Event management edits + edit-twice rule

**Goal:** DJs can change custom code (within the 2-edit cap), color, and QR design from event management.

**Scope**

- Extend [`DjEventControlsCard.tsx`](../../src/frontend/features/dj/events/components/DjEventControlsCard.tsx) with editors for custom code, color, and QR design.
- Surface **edits remaining** for the custom code; hide / disable the edit input at `0`.
- Server-side enforcement: API rejects code edit when `event_code_edits_remaining = 0` and decrements only on a successful actual change.
- Emit `dj_audit_log` entries for code, color, and QR-design changes (sensitive-action pattern from [DJ login feature](features-dj-login-and-event-management.md)).
- Reference the tier-gate helper at API boundaries for the same reason as Phase 2.

**Definition of Done**

- [ ] DJs can edit custom code from event management when edits remain.
- [ ] DJs can edit color and QR design any time (no cap).
- [ ] API decrements `event_code_edits_remaining` exactly on successful code changes.
- [ ] API rejects code edits when the counter is `0`.
- [ ] Audit log entries are emitted for each change.

### Phase 4 - Guest event theming

**Goal:** Guest event pages reflect the chosen event color without leakage into other shells.

**Scope**

- Apply `event_color` via CSS custom property on the guest event layout that wraps `/event/[eventCode]/*` ([`src/frontend/app/(guest)/event/[eventCode]/`](../../src/frontend/app/(guest)/event/[eventCode]/)).
- Re-derive existing accent / primary tokens from the chosen hue where this is straightforward; otherwise apply the override only on the surfaces that benefit (CTAs, headings, focus rings).
- Implement the contrast fallback policy from Phase 0.
- Confirm DJ shells, marketing landing (when shipped), and auth pages are unaffected.

**Definition of Done**

- [ ] Guest event pages reflect `event_color` for affected surfaces.
- [ ] Non-event surfaces (DJ shells, auth, marketing) are visually unchanged.
- [ ] Contrast fallback applies when chosen color fails the threshold.
- [ ] No hydration warnings introduced by the theming layer.

### Phase 5 - QR designs + PNG download

**Goal:** Render the chosen QR design and let DJs / guests download a PNG.

**Scope**

- Implement the curated QR designs (per Phase 0 decision) and wire the chosen design into:
  - [`ScanScreen.tsx`](../../src/frontend/features/guest/event/scan/ScanScreen.tsx) (guest scan view).
  - [`CreatedEventInfo.tsx`](../../src/frontend/features/dj/events/components/CreatedEventInfo.tsx) (post-create handoff).
- Add **Download QR (PNG)** CTA on:
  - [`DjEventControlsCard.tsx`](../../src/frontend/features/dj/events/components/DjEventControlsCard.tsx) for the DJ.
  - [`ScanScreen.tsx`](../../src/frontend/features/guest/event/scan/ScanScreen.tsx) for guests.
- Filename pattern from Phase 0; PNG resolution targets print-quality.

**Definition of Done**

- [ ] All curated QR designs render correctly across DJ and guest surfaces.
- [ ] PNG download produces a file at the agreed resolution and filename pattern.
- [ ] Download works for tinted and non-tinted designs; tint behavior matches Phase 0 spec.
- [ ] No regression to current basic QR rendering when no design is selected (default preset behaves as today).

### Phase 6 - Scan popup + guest queue filter

**Goal:** Guests can re-surface the QR via a corner popup and filter the Vote page queue.

**Scope**

- Add a small QR icon in the guest event chrome (visible on request and vote pages while the event is `live`); click opens a **Radix dialog** rendering the Scan view content (no navigation).
- Hide the icon for `ended` / `archived` (matches `EventOver`).
- Add a filter control on [`VoteScreen.tsx`](../../src/frontend/features/guest/event/vote/VoteScreen.tsx) with **All / Active only / Played only**; default **All** preserves current behavior.
- Karaoke flows are not modified.

**Definition of Done**

- [ ] Corner QR icon opens Scan in a popup on guest event pages without navigating away.
- [ ] Popup is keyboard-operable (focus trap, Escape closes) and respects reduced motion.
- [ ] Vote page filter renders all three options and updates the visible list correctly.
- [ ] Filter does not modify any API call; only client filtering.
- [ ] Karaoke pages are unchanged.

### Phase 7 - QA, regression, and documentation

**Goal:** Production-ready behavior with documentation and rollback in place.

**Scope**

- Add / adjust tests covering: custom code validation, edit-twice cap, color theming, QR design rendering, PNG download trigger (smoke), scan popup open/close, vote page filter.
- Update [`docs/runbook-regression.md`](../runbook-regression.md) with new rows for: custom code create/edit, color theming, QR design switch, PNG download, scan popup, queue filter.
- Update [`docs/project-description.md`](../project-description.md) **Current Delivered Scope** when sprint completes.
- Update [`docs/deploy.md`](../deploy.md) with the new feature flag env var (and any other env vars introduced).
- Run `npm run lint`, `npm run build`, and `npm run test:qa` from `src/frontend`.

**Definition of Done**

- [ ] Automated checks green from `src/frontend` (`npm run lint`, `npm run build`, `npm run test:qa`).
- [ ] Regression runbook updated with new rows for every behavior in this feature.
- [ ] Project description **Current Delivered Scope** updated.
- [ ] Deploy runbook lists the new feature flag env var (and any others).
- [ ] Backlog row for [IDEA-001](../backlog-ideas.md) flipped to **Done** at sprint close.

## Acceptance Criteria (Feature Complete)

This feature is complete when all statements are true:

- [ ] DJ can set a custom event code at creation, subject to the documented validation rules.
- [ ] DJ can edit the custom event code up to 2 times after creation; further edits are blocked at API + UI.
- [ ] DJ can set and freely change a custom event color from creation and event management.
- [ ] DJ can pick and freely change a QR design from creation and event management.
- [ ] Guest event pages reflect the chosen event color, with contrast fallback when needed; non-event surfaces are unaffected.
- [ ] Guest Scan and DJ event-management surfaces render the chosen QR design.
- [ ] Both DJ and guest surfaces expose a working Download QR (PNG) action.
- [ ] Guest event pages expose a corner QR icon that opens Scan as a popup; closing returns to the underlying page intact.
- [ ] Vote page (song_request mode) has an All / Active / Played filter; default behavior is unchanged.
- [ ] All new UI is gated by the feature flag; flag off equals current behavior with no console errors.
- [ ] Tier-gate helper is in place and inert today; flipping it (planned for [IDEA-009](../backlog-ideas.md)) is a single-file change.
- [ ] No regressions in existing DJ, guest, karaoke, lifecycle, or auth flows.
- [ ] Documentation set is consistent (feature plan, sprint tracker, regression runbook, deploy runbook, project description).

## Validation Checklist

### Custom event code

- [ ] Creating an event with a valid custom code persists and routes correctly.
- [ ] Creating with an invalid / reserved / duplicate code shows a clear error.
- [ ] Editing a custom code decrements the counter only on actual change.
- [ ] After 2 successful edits, further edit attempts are rejected at API + hidden in UI.
- [ ] Audit log contains an entry per code change with old/new values.

### Custom event color

- [ ] Color set at creation appears on guest event pages (scan, request, vote, karaoke list).
- [ ] Editing color from event management updates guest pages on next load.
- [ ] Contrast fallback engages for known-poor colors (smoke test with an extreme value).
- [ ] DJ and auth shells visually unchanged.

### QR design

- [ ] All curated designs render on Scan and DJ event-management surfaces.
- [ ] Tinted designs reflect the event color; non-tinted designs render in the default palette as documented.
- [ ] Switching designs from event management updates rendered output.

### QR PNG download

- [ ] DJ can download the QR PNG from event management.
- [ ] Guest can download the QR PNG from Scan.
- [ ] Filename follows the Phase 0 pattern; resolution matches Phase 0 target.

### Scan popup

- [ ] Corner QR icon visible on guest event pages while `live`.
- [ ] Clicking opens a popup with Scan view content.
- [ ] Escape and overlay click close the popup.
- [ ] Underlying page state survives popup close (e.g. partially typed request).
- [ ] Hidden on `ended` / `archived`.

### Queue filter (song_request mode)

- [ ] Vote page renders **All / Active only / Played only**.
- [ ] Default selection equals current Vote behavior.
- [ ] Filter changes only the visible list; no API changes.
- [ ] Karaoke pages unchanged.

### Cross-cutting

- [ ] Feature flag off = no new UI; existing flows behave exactly as today.
- [ ] Tier-gate helper returns `true` for all DJs today; single call site flip planned for [IDEA-009](../backlog-ideas.md).
- [ ] No new RLS policies; no permissive widening.

## Traceability

### Data model changes

- `events.event_color` (text, nullable).
- `events.qr_design` (text, default `'classic'` or equivalent, check-constrained over the curated set).
- `events.event_code_edits_remaining` (integer, not null, default `2`).
- New audit-log behavior reuses `public.dj_audit_log`.
- Migration under `supabase/migrations/*` (idempotent).
- Sync [`src/frontend/types/database.ts`](../../src/frontend/types/database.ts).

### Likely impacted frontend areas

- [`src/frontend/features/dj/dashboard/components/CreateEventForm.tsx`](../../src/frontend/features/dj/dashboard/components/CreateEventForm.tsx)
- [`src/frontend/hooks/dj/useCreateEvent.ts`](../../src/frontend/hooks/dj/useCreateEvent.ts)
- [`src/frontend/lib/client/api/events.ts`](../../src/frontend/lib/client/api/events.ts)
- [`src/frontend/app/api/dj/events/route.ts`](../../src/frontend/app/api/dj/events/route.ts)
- [`src/frontend/features/dj/events/components/DjEventControlsCard.tsx`](../../src/frontend/features/dj/events/components/DjEventControlsCard.tsx)
- [`src/frontend/features/dj/events/components/CreatedEventInfo.tsx`](../../src/frontend/features/dj/events/components/CreatedEventInfo.tsx)
- [`src/frontend/features/guest/event/scan/ScanScreen.tsx`](../../src/frontend/features/guest/event/scan/ScanScreen.tsx)
- [`src/frontend/features/guest/event/vote/VoteScreen.tsx`](../../src/frontend/features/guest/event/vote/VoteScreen.tsx)
- [`src/frontend/app/(guest)/event/[eventCode]/`](../../src/frontend/app/(guest)/event/[eventCode]/) layouts for theming.
- [`src/frontend/lib/shared/config/feature-flags.ts`](../../src/frontend/lib/shared/config/feature-flags.ts) — new flag.
- New: `src/frontend/lib/shared/auth/dj-tier.ts` — tier-gate stub for [IDEA-009](../backlog-ideas.md).
- [`src/frontend/types/database.ts`](../../src/frontend/types/database.ts) — schema sync.

### Documentation

- Sprint tracker: [`docs/sprints/sprint-2026-05-custom-event-designs.md`](../sprints/sprint-2026-05-custom-event-designs.md)
- Backlog: [`docs/backlog-ideas.md`](../backlog-ideas.md) — IDEA-001 row.
- Post-delivery updates: [`docs/project-description.md`](../project-description.md), [`docs/runbook-regression.md`](../runbook-regression.md), [`docs/deploy.md`](../deploy.md).
- Tier-gating follow-up: [IDEA-009](../backlog-ideas.md).
