-- Durable timestamps for automated lifecycle transitions
alter table public.events
  add column if not exists live_entered_at timestamptz,
  add column if not exists ended_entered_at timestamptz;

create index if not exists events_lifecycle_live_entered_at_idx
  on public.events (lifecycle_status, live_entered_at)
  where lifecycle_status = 'live';

create index if not exists events_lifecycle_ended_entered_at_idx
  on public.events (lifecycle_status, ended_entered_at)
  where lifecycle_status = 'ended';