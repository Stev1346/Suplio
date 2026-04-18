create extension if not exists pg_cron with schema extensions;

-- ---- 1) live -> ended after 24h ----
create or replace function public.sweep_events_live_to_ended()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  with updated as (
    update public.events e
       set lifecycle_status  = 'ended',
           allow_requests    = false,
           ended_entered_at  = now()
     where e.lifecycle_status = 'live'
       and e.live_entered_at is not null
       and e.live_entered_at < now() - interval '24 hours'
    returning e.id, e.dj_id
  ),
  logged as (
    insert into public.dj_audit_log (dj_id, event_id, action, metadata)
    select u.dj_id, u.id, 'event.auto_ended',
           jsonb_build_object('reason','live > 24h')
      from updated u
    returning 1
  )
  select count(*)::int into v_count from updated;

  return v_count;
end;
$$;

-- ---- 2) ended -> archived after 7d ----
create or replace function public.sweep_events_ended_to_archived()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  with updated as (
    update public.events e
       set lifecycle_status = 'archived',
           allow_requests   = false
     where e.lifecycle_status = 'ended'
       and e.ended_entered_at is not null
       and e.ended_entered_at < now() - interval '7 days'
    returning e.id, e.dj_id
  ),
  logged as (
    insert into public.dj_audit_log (dj_id, event_id, action, metadata)
    select u.dj_id, u.id, 'event.auto_archived',
           jsonb_build_object('reason','ended > 7d')
      from updated u
    returning 1
  )
  select count(*)::int into v_count from updated;

  return v_count;
end;
$$;

revoke all on function public.sweep_events_live_to_ended() from public;
revoke all on function public.sweep_events_ended_to_archived() from public;

-- ---- 3) schedule hourly sweeps ----
select cron.schedule(
  'events-sweep-live-to-ended',
  '*/15 * * * *',
  $$select public.sweep_events_live_to_ended();$$
);

select cron.schedule(
  'events-sweep-ended-to-archived',
  '17 * * * *',
  $$select public.sweep_events_ended_to_archived();$$
);