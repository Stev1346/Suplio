-- Phase 10: Karaoke Mode schema (Phase 1 of karaoke sprint)
-- All statements are idempotent (add column if not exists, etc.)
-- so they are safe to re-run in local/preview environments.

-- 1) EVENTS: mode + scheduling metadata
alter table public.events
  add column if not exists event_mode text not null default 'song_request'
  check (event_mode in ('song_request', 'karaoke'));

alter table public.events
  add column if not exists event_date date null;

create index if not exists events_event_mode_idx
  on public.events (event_mode);

create index if not exists events_event_date_idx
  on public.events (event_date);

-- 2) REQUESTS: discriminator, performer, soft-remove
alter table public.requests
  add column if not exists request_type text not null default 'song_request'
  check (request_type in ('song_request', 'karaoke'));

alter table public.requests
  add column if not exists performer_name text null;

alter table public.requests
  add column if not exists removed_at timestamptz null;

-- 3) Broaden requests.status to include karaoke queue states.
-- Drops any existing status check constraint on public.requests,
-- then adds a single named check that allows both sets.
do $$
declare
  con record;
begin
  for con in
    select conname
    from pg_constraint
    where conrelid = 'public.requests'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%in%'
  loop
    execute format('alter table public.requests drop constraint %I', con.conname);
  end loop;
end
$$;

alter table public.requests
  add constraint requests_status_check
  check (status in (
    'pending', 'accepted', 'rejected', 'played',
    'queued', 'up_next', 'performing_now'
  ));

-- 4) Indexes for separate-list filtering and FIFO ordering
create index if not exists requests_event_type_created_at_idx
  on public.requests (event_id, request_type, created_at);

create index if not exists requests_event_type_removed_at_idx
  on public.requests (event_id, request_type, removed_at);