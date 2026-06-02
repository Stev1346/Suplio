-- Custom Event Designs: Phase 1 schema (IDEA-001)
-- Idempotent: safe to re-run in local/preview (add column if not exists).

-- 1) Optional brand color (hex validated in API Phase 2+)
alter table public.events
  add column if not exists event_color text null;

-- 2) Curated QR preset (must match qr-presets.ts ids)
alter table public.events
  add column if not exists qr_design text not null default 'basic'
  check (qr_design in ('basic', 'rounded', 'frame', 'bold'));

-- 3) Custom event code edits remaining (Phase 0: starts at 2)
alter table public.events
  add column if not exists event_code_edits_remaining integer not null default 2
  check (event_code_edits_remaining >= 0);