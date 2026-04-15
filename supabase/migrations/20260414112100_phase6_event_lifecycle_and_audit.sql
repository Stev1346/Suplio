-- 1) Event lifecycle state
alter table public.events
  add column if not exists lifecycle_status text not null default 'live'
  check (lifecycle_status in ('draft', 'live', 'ended', 'archived'));

create index if not exists events_lifecycle_status_idx
  on public.events (lifecycle_status);

-- 2) Audit log for sensitive DJ actions
create table if not exists public.dj_audit_log (
  id uuid primary key default gen_random_uuid(),
  dj_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  event_id uuid null references public.events(id) on delete set null,
  request_id uuid null references public.requests(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists dj_audit_log_dj_id_created_at_idx
  on public.dj_audit_log (dj_id, created_at desc);