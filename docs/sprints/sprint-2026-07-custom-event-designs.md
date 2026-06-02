# Sprint Tracker: 2026-07 Custom Event Designs

This file tracks delivery for the **Custom Event Designs** feature ([IDEA-001](../backlog-ideas.md)). Scope is custom event code (vanity slug, edit-twice cap), custom event color (guest theming), QR design picker, downloadable QR PNG, header Scan popup on guest event pages, and a guest queue filter on the Vote page (`song_request` mode). Karaoke, auth, RLS, lifecycle, and existing request/vote behavior are unchanged unless a phase explicitly extends them.

**Subscription tier gating is intentionally deferred to [IDEA-009](../backlog-ideas.md).** Phase 0 lands a single tier-gate helper (returns `true` today) so the eventual gate flip is one file.

**Related sprint order:** The public marketing landing is **complete** — see [`sprint-2026-06-public-landing.md`](sprint-2026-06-public-landing.md). **Onboarding** (DJ + guest first-run) is the next planned sprint — see [`sprint-2026-08-onboarding.md`](sprint-2026-08-onboarding.md).

Related docs:

- Feature plan: [`../features/features-custom-event-designs.md`](../features/features-custom-event-designs.md)
- Backlog: [`../backlog-ideas.md`](../backlog-ideas.md) (IDEA-001)
- Project description: [`../project-description.md`](../project-description.md)
- Regression runbook: [`../runbook-regression.md`](../runbook-regression.md)
- Deploy runbook: [`../deploy.md`](../deploy.md)
- Tier-gating follow-up: [IDEA-009](../backlog-ideas.md)

---

## Sprint Board

Use this board to move phases through execution.

**Sprint status:** **Complete** (Phases 0–7, through 2026-06-02).

### In Progress

- _None._

---

### Phase 0 Decisions (locked)

- QR library: `qrcode.react` (keep existing dependency) + design wrapper for presets.
- Rationale:
  - already in use on guest Scan page;
  - lower migration risk than swapping renderer mid-sprint;
  - enough for preset-driven style variants and PNG export pipeline.
- Edit counter: `events.event_code_edits_remaining` starts at `2`.
- Decrement rule: decrement only when normalized code value actually changes.
- No decrement on failed validation, duplicate conflict, or no-op edit.
- Audit log actions:
  - `event_code_changed`
  - `event_color_changed`
  - `event_qr_design_changed`
- Audit metadata shape:
  - `{ eventId, field, previousValue, nextValue, editsRemainingAfter? }`
- PNG export:
  - Resolution: 1024x1024
  - Margin: 32px quiet zone
  - Background: white
  - Filename: `suplio-qr-{eventCode}.png`
- Event color policy (guest UI theming — Phase 4):
  - Input format: hex `#RRGGBB`
  - Contrast thresholds: text 4.5:1, large text 3.0:1 (WCAG AA)
  - Per-surface fallback: if chosen color fails threshold on a surface, use tokens derived from `EVENT_COLOR_POLICY.platformDefaultHue` (`170`); page background tokens keep the DJ's chosen hue
  - Surfaces: `primaryButton`, `headingAccent`, `focusRing`, `badgeAccent`
  - Source of truth: `src/frontend/lib/shared/custom-event-designs/color-policy.ts` + `resolve-guest-event-theme.ts`
- QR module color policy (Phase 5):
  - Scannability gate: if `event_color` contrast against `#ffffff` is below ~3:1, use `EVENT_COLOR_POLICY.fallbackAccent` (`#7c3aed`) for QR modules only (UI theming unchanged)
- Custom event code rules:
  - Length: 4–24 chars
  - Pattern: `^[a-z0-9-]+$` (normalized to lowercase)
  - Reserved: `admin`, `api`, `dj`, `event`, `events`, `login`, `signup`, `scan`
  - Uniqueness scope: unique among **non-archived** events (`draft`, `live`, `ended`)
  - Source of truth: `src/frontend/lib/shared/custom-event-designs/event-code-rules.ts`
- Feature flag:
  - Env var: `NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS`
  - Code key: `featureFlags.customEventDesigns`
  - Default when unset: `false`
  - Preview rollout: `true`
  - Production rollout: `false` until Phase 7 sign-off
  - Source: `src/frontend/lib/shared/config/feature-flags.ts`
- Tier gate (IDEA-009 deferred):
  - File: `src/frontend/lib/server/tier-gates.ts`
  - Signature: `isTierAllowedForFeature({ djId, feature: "custom_event_designs" }): Promise<boolean>`
  - Current behavior: always returns `true`
  - Future: only this helper changes when subscription tiers ship
---

### Backlog

- _None._

---

### Blocked

- _None._

---

### Done

#### Phase 7 - QA, regression, and documentation

**Completed:** 2026-06-02  
**Notes:** [`runbook-regression.md`](../runbook-regression.md) extended with full **Custom Event Designs** human regression rows (code, color, QR, PNG, scan popup, queue filter, cross-cutting). [`project-description.md`](../project-description.md) **Current Delivered Scope** updated. [`deploy.md`](../deploy.md) feature-flag guidance expanded. [IDEA-001](../backlog-ideas.md) flipped to **Done**. Vitest unit coverage for pure helpers (`npm run test:unit`: 35 passed, 6 files). Validation from `src/frontend`: `npm run lint` (0 errors, 4 warnings — pre-existing in auth route + tier-gates), `npm run build` (success). `npm run test:qa` requires Supabase/E2E credentials per `src/frontend/.env.example`; custom-designs Playwright specs skip unless `E2E_CED_ENABLED=1` and related vars — use the runbook human gate before enabling the flag in Production.

**Definition of Done**

- [x] `npm run lint`, `npm run build`, and `npm run test:unit` from `src/frontend` pass; `npm run test:qa` documented with E2E/env prerequisites (same pattern as prior sprints).
- [x] [`docs/runbook-regression.md`](../runbook-regression.md) updated with rows for: custom code create + edit, color theming, QR design switch, PNG download, scan popup, queue filter.
- [x] [`docs/project-description.md`](../project-description.md) **Current Delivered Scope** updated.
- [x] [`docs/deploy.md`](../deploy.md) lists the feature flag env var and rollout guidance.
- [x] Backlog row for [IDEA-001](../backlog-ideas.md) flipped to **Done**.

#### Phase 6 - Scan popup + guest queue filter

**Completed:** 2026-06-02  
**Notes:** [`ScanQrPopup.tsx`](../../src/frontend/features/guest/event/scan/ScanQrPopup.tsx) opens Scan content in a Radix dialog (keyboard focus trap, Escape, overlay close; `motion-reduce:animate-none` on content). Trigger lives in [`AppHeader.tsx`](../../src/frontend/components/ui/AppHeader.tsx) beside the DJ profile icon button and a context nav toggle (Request / Vote / Queue); wired on guest request, vote, and karaoke-list pages via `event` + `eventCode` props while `live` and `featureFlags.customEventDesigns`. [`VoteScreen.tsx`](../../src/frontend/features/guest/event/vote/VoteScreen.tsx) adds client-only **All / Active / Played** filter (default **Active**). [`RequestCard.tsx`](../../src/frontend/components/RequestCard.tsx) shows a subtle **Played** badge and disables voting on played rows. Product choices vs original Phase 0 brief: header action row (not floating corner); filter defaults to Active; karaoke request/list pages share the same header chrome including QR popup. Validation from `src/frontend`: `npm run lint` (warnings only), `npm run build` pass.

**Definition of Done**

- [x] QR control visible on guest event pages while `live`; opens Scan in a Radix dialog without navigation.
- [x] Popup is keyboard-operable (focus trap + Escape) and respects reduced motion on dialog content.
- [x] Underlying page state (e.g. partially typed request) survives popup close.
- [x] QR control hidden on `ended` / `archived` (matches `EventOver`).
- [x] [`VoteScreen.tsx`](../../src/frontend/features/guest/event/vote/VoteScreen.tsx) gains All / Active / Played filter; default **Active** (product choice).
- [x] Filter is client-only (no API changes).
- [x] Karaoke guest pages use the same header chrome (DJ + QR popup + nav toggle).

#### Phase 5 - QR designs + PNG download

**Completed:** 2026-06-01  
**Notes:** [`resolve-qr-colors.ts`](../../src/frontend/lib/shared/custom-event-designs/resolve-qr-colors.ts) resolves module/background colors with hex validation, 3:1 scannability gate vs white, and `fallbackAccent` for light brand colors (UI theming unchanged). [`EventQrCode.tsx`](../../src/frontend/components/custom-event-designs/EventQrCode.tsx) is the single renderer for `display` (`QRCodeSVG`) and `export` (`QRCodeCanvas`, transparent background) with preset shells (`basic`, `rounded`, `frame`, `bold`). Wired on guest [`ScanScreen.tsx`](../../src/frontend/features/guest/event/scan/ScanScreen.tsx), DJ [`DjEventControlsCard.tsx`](../../src/frontend/features/dj/events/components/DjEventControlsCard.tsx), post-create [`CreatedEventInfo.tsx`](../../src/frontend/features/dj/events/components/CreatedEventInfo.tsx) via [`DjCreateEventModalContext.tsx`](../../src/frontend/contexts/DjCreateEventModalContext.tsx), and **View Event Info** dialogs on [`RecentEventsList.tsx`](../../src/frontend/features/dj/dashboard/components/RecentEventsList.tsx) and [`DjEventManageScreen.tsx`](../../src/frontend/features/dj/events/detail/DjEventManageScreen.tsx). PNG compositor: [`download-event-qr-png.ts`](../../src/frontend/lib/client/download-event-qr-png.ts) (1024×1024, 32px quiet zone, `suplio-qr-{eventCode}.png`). Guest fetch already includes `event_color` / `qr_design` via [`fetchEventByCode`](../../src/frontend/lib/client/api/events.ts). Validation from `src/frontend`: `npm run lint` (warnings only), `npm run build`, `npm run test:qa` (6 passed, 6 skipped).

**Definition of Done**

- [x] [`resolve-qr-colors.ts`](../../src/frontend/lib/shared/custom-event-designs/resolve-qr-colors.ts) implements hex validation, scannability fallback, and defaults per implementation notes.
- [x] [`EventQrCode.tsx`](../../src/frontend/components/custom-event-designs/EventQrCode.tsx) renders display and export variants with matching resolved colors.
- [x] Guest fetch includes `event_color` and `qr_design`; [`ScanScreen.tsx`](../../src/frontend/features/guest/event/scan/ScanScreen.tsx) uses `EventQrCode` for visible QR and hidden export canvas.
- [x] Curated QR designs render on Scan and DJ surfaces ([`CreatedEventInfo.tsx`](../../src/frontend/features/dj/events/components/CreatedEventInfo.tsx), [`DjEventControlsCard.tsx`](../../src/frontend/features/dj/events/components/DjEventControlsCard.tsx)).
- [x] **Download QR (PNG)** on DJ event-management and guest Scan; transparent background; module color matches display.
- [x] PNG resolution and filename pattern match Phase 0 (background amended to transparent).
- [x] Flag off / no color → basic black-on-white QR.
- [x] Low-contrast `event_color` falls back to `fallbackAccent` on QR modules only.

#### Phase 4 - Guest event theming

**Completed:** 2026-05-30  
**Notes:** [`GuestEventThemeLayout.tsx`](../../src/frontend/components/guests/GuestEventThemeLayout.tsx) wraps guest event routes with a themed `<main>` and syncs CSS vars to `<html>` for overscroll. [`resolveGuestEventTheme`](../../src/frontend/lib/shared/custom-event-designs/resolve-guest-event-theme.ts) maps `event_color` → `--hue` plus derived background/foreground tokens; per-surface contrast fallback (`primaryButton`, `headingAccent`, `focusRing`, `badgeAccent`) uses `EVENT_COLOR_POLICY.platformDefaultHue` (170) when a surface fails WCAG thresholds while preserving the DJ's chosen hue on page tokens. Realtime updates via `useEvent(..., { realtime: true })`. Guest CTAs consume `--guest-*` vars in [`Button.tsx`](../../src/frontend/components/ui/Button.tsx), [`AppHeader.tsx`](../../src/frontend/components/ui/AppHeader.tsx), and [`ScanScreen.tsx`](../../src/frontend/features/guest/event/scan/ScanScreen.tsx). DJ, auth, and marketing shells unchanged.

**Definition of Done**

- [x] Guest event layout under [`src/frontend/app/(guest)/event/[eventCode]/`](../../src/frontend/app/(guest)/event/[eventCode]/) applies `event_color` via CSS custom properties.
- [x] Affected surfaces (CTAs, headings, focus rings, accent areas) reflect the chosen color.
- [x] Contrast fallback engages for poor-contrast colors per Phase 0 policy (per-surface; platform default hue for failing surfaces).
- [x] DJ shells, auth pages, and marketing surfaces are unaffected.
- [x] No new hydration warnings on guest event pages.

#### Phase 3 - Event management edits + edit-twice rule

**Completed:** 2026-05-27  
**Notes:** [`DjEventControlsCard.tsx`](../../src/frontend/features/dj/events/components/DjEventControlsCard.tsx) edits custom code, color, and QR design behind `NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS`. [`PATCH /api/dj/events/[eventId]`](../../src/frontend/app/api/dj/events/[eventId]/route.ts) validates design fields, enforces the edit-twice cap (decrement only on actual code change), and emits `event_code_changed`, `event_color_changed`, and `event_qr_design_changed` audit entries. [`fetchEventByCode`](../../src/frontend/lib/client/api/events.ts) and [`EventState`](../../src/frontend/hooks/guest/useEventByCode.ts) include design fields for the DJ manage screen; successful code renames call `router.replace` to the new `/dj/events/[eventCode]` URL. Shared `applyPatchedEvent` merges API responses for all patch handlers (name, lifecycle, mode, date, and design fields).

**Definition of Done**

- [x] [`DjEventControlsCard.tsx`](../../src/frontend/features/dj/events/components/DjEventControlsCard.tsx) supports editing custom code, color, and QR design.
- [x] **Edits remaining** is surfaced for the custom code; UI hides / disables the editor at `0`.
- [x] API decrements `event_code_edits_remaining` only on a successful actual code change.
- [x] API rejects code edit when counter is `0`.
- [x] `dj_audit_log` entries emitted for each code / color / QR-design change.

#### Phase 2 - Event creation flow

**Completed:** 2026-05-24  
**Notes:** Create-event flow now carries optional custom code, color, and QR design behind `NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS`. Validation is centralized in [`parse-create-design-fields.ts`](../../src/frontend/lib/server/custom-event-designs/parse-create-design-fields.ts); `/api/dj/events` persists the new fields, checks duplicate non-archived custom codes, and references the inert tier gate. `npm run lint`, `npm run build`, and `npm run test:qa` were run from `src/frontend` (QA: 6 passed, 6 skipped).

**Definition of Done**

- [x] [`CreateEventForm.tsx`](../../src/frontend/features/dj/dashboard/components/CreateEventForm.tsx) captures optional custom code, color, and QR design.
- [x] [`/api/dj/events`](../../src/frontend/app/api/dj/events/route.ts) validates and persists new fields (custom code regex / reserved / uniqueness checks per Phase 0).
- [x] Tier-gate helper is referenced at the API boundary (returns `true` today).
- [x] [`useCreateEvent`](../../src/frontend/hooks/dj/useCreateEvent.ts) and [`lib/client/api/events.ts`](../../src/frontend/lib/client/api/events.ts) carry new fields.
- [x] Event creation without any new fields still works (backwards compatible).

#### Phase 1 - Data model and types

**Completed:** 2026-05-24  
**Notes:** Migration [`20260524120000_custom_event_designs_phase1.sql`](../../supabase/migrations/20260524120000_custom_event_designs_phase1.sql) adds `event_color` (nullable), `qr_design` (default `basic`, check-constrained), `event_code_edits_remaining` (default `2`). [`database.ts`](../../src/frontend/types/database.ts) includes `QrDesignPresetId` and new `Row` / optional `Insert` fields. Phase 2 now wires create-time API usage; guest event fetches remain unchanged until Phase 5.

**Definition of Done**

- [x] Idempotent migration adds `events.event_color`, `events.qr_design`, and `events.event_code_edits_remaining` (default `2`).
- [x] Existing events remain valid after migration (defaults applied).
- [x] [`src/frontend/types/database.ts`](../../src/frontend/types/database.ts) is updated with new fields (`Row`, `Insert`, `Update`).
- [x] No regression to existing reads/writes that ignore the new fields (`npm run build` passes).

#### Interim — Phase 5 spike (guest Scan PNG download)

**Completed:** 2026-05-24 (superseded by full Phase 5 on 2026-06-01).

**Scope delivered (interim)**

- [`download-event-qr-png.ts`](../../src/frontend/lib/client/download-event-qr-png.ts) compositor and guest Scan download CTA (later refactored to `EventQrCode` + tinted modules in Phase 5).

**Definition of Done (interim only)**

- [x] Guest Scan exposes download when `NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS=true`.
- [x] Downloaded PNG matches Phase 0 resolution and filename pattern.
- [x] Flag off hides download CTA; existing Scan UX unchanged.
- [x] DJ download, presets, and `EventQrCode` / `resolve-qr-colors` — completed in Phase 5 (2026-06-01).

#### Phase 0 - Discovery and decisions

**Completed:** 2026-05-08  
**Notes:** Decisions locked in this sprint doc and shared constants under `src/frontend/lib/shared/custom-event-designs/`, `src/frontend/lib/server/tier-gates.ts`, and `src/frontend/lib/shared/config/feature-flags.ts`. Feature flag env var documented in [`deploy.md`](../deploy.md) and [`src/frontend/.env.example`](../../src/frontend/.env.example).

**Definition of Done**

- [x] QR library decision recorded with rationale (`qrcode.react` + design wrapper vs `qr-code-styling`).
- [x] Custom event code rules frozen (regex, min/max length, case handling, reserved-word list, uniqueness scope).
- [x] Edit-counter mechanic and audit-log shape documented (column name, decrement-only-on-change rule).
- [x] Color contrast / fallback policy documented (threshold + per-surface fallback rule).
- [x] Curated QR design preset list approved.
- [x] Tier-gate helper file path and signature documented (single flip point for [IDEA-009](../backlog-ideas.md)).
- [x] Feature flag name and default documented (extend [`src/frontend/lib/shared/config/feature-flags.ts`](../../src/frontend/lib/shared/config/feature-flags.ts) with a `NEXT_PUBLIC_ENABLE_*` entry).
- [x] PNG download resolution and filename pattern documented.

---

## Current Phase Start Checklist

### Sprint kickoff

- [x] Confirm tier-gate deferral approach (single helper today; flipped by [IDEA-009](../backlog-ideas.md)).
- [x] Confirm feature flag default for Preview vs Production (on in Preview, off in Production until Phase 7 sign-off).
- [x] Reserve time for the Phase 7 regression pass with the new runbook rows.

### Phase 0 entry

- [x] Identify the QR rendering library to use (carry-forward decision in sprint notes).
- [x] Draft the custom event code regex + reserved-word list.
- [x] Draft the QR design preset list (names + visual brief) for sign-off.
- [x] Draft the contrast threshold and per-surface fallback rule.

### Phase 1 entry

- [x] Create idempotent migration for `event_color`, `qr_design`, and `event_code_edits_remaining`.
- [x] Sync [`src/frontend/types/database.ts`](../../src/frontend/types/database.ts) after migration lands.

### Phase 2 entry

- [x] Extend create-event form and `POST /api/dj/events` for optional custom code, color, and QR design.
- [x] Reference tier-gate helper at API boundary.
- [x] Confirm create without new fields still succeeds (DB defaults).

### Phase 3 entry

- [x] Extend event-management controls for custom code, color, and QR design edits.
- [x] Surface edit count and enforce the code-edit cap at UI + API.
- [x] Emit `dj_audit_log` entries for code, color, and QR-design changes.

### Phase 4 entry

- [x] Apply `event_color` on guest event layout via CSS custom properties.
- [x] Implement contrast fallback per [`color-policy.ts`](../../src/frontend/lib/shared/custom-event-designs/color-policy.ts).
- [x] Confirm DJ, auth, and marketing shells are unaffected.

### Phase 5 interim spike (complete)

- [x] Add [`download-event-qr-png.ts`](../../src/frontend/lib/client/download-event-qr-png.ts) compositor.
- [x] Wire guest Scan download CTA behind `featureFlags.customEventDesigns`.
- [x] Smoke-test PNG on a live event Scan page with flag on in Preview/local.

### Phase 5 entry

- [x] Confirm `event_color` and `qr_design` are on `events` (Phase 1 migration + types).
- [x] Include `event_color` and `qr_design` in event fetches via [`fetchEventByCode`](../../src/frontend/lib/client/api/events.ts) (Phase 3; guest theming complete in Phase 4).
- [x] Implement `resolveQrColors()` and `EventQrCode` per Phase 5 implementation notes.
- [x] Wire Scan + DJ surfaces; verify PNG export matches display module color with transparent background.

### Phase 6 entry

- [x] Add QR control on guest event header chrome (request/vote/karaoke-list) while `live`; Radix dialog with Scan content.
- [x] Ensure popup keyboard/focus behavior and `prefers-reduced-motion` compliance.
- [x] Add Vote page All / Active / Played client filter (default Active).

### Phase 7 entry

- [x] Run `npm run lint`, `npm run build`, and `npm run test:unit` from `src/frontend`; document `npm run test:qa` E2E prerequisites.
- [x] Update regression runbook with custom-designs rows (code, color, QR, PNG, popup, filter).
- [x] Update project description **Current Delivered Scope** and flip IDEA-001 to Done at sprint close.

---

## Validation Checklist (Sprint Exit)

- [x] DJ can create an event with optional custom code, color, and QR design; defaults preserved when omitted.
- [x] DJ can edit custom code up to 2 times; further attempts blocked at API + UI.
- [x] DJ can change color and QR design freely from event management.
- [x] Guest event pages reflect the chosen color; non-event surfaces unaffected.
- [x] All curated QR designs render correctly across DJ and guest surfaces.
- [x] QR module color reflects `event_color` when set; scannability fallback applies for light colors.
- [x] **Download QR (PNG)** works on both DJ and guest surfaces; transparent background; matches on-screen module color.
- [x] Scan popup opens / closes correctly with keyboard support and reduced-motion compliance on dialog content.
- [x] Vote page filter shows **All / Active / Played**; default **Active**; karaoke guest pages share header QR chrome.
- [x] Feature flag off = no new UI; current flows behave as today (human regression row in runbook; verify per Preview→Production promotion).
- [x] No regressions in DJ, karaoke, lifecycle, auth, or guest core flows (human regression + core runbook sections; verify per promotion).
- [x] Documentation set is consistent: feature plan, this sprint, regression runbook, deploy runbook, project description.
