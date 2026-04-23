-- Ensure max 1 performing_now per event (karaoke only)
create unique index if not exists requests_one_karaoke_performing_now_per_event
on public.requests (event_id)
where request_type = 'karaoke' and status = 'performing_now';

-- Ensure max 1 up_next per event (karaoke only)
create unique index if not exists requests_one_karaoke_up_next_per_event
on public.requests (event_id)
where request_type = 'karaoke' and status = 'up_next';

create or replace function public.set_karaoke_status_with_queue_rules(
  p_request_id uuid,
  p_new_status text
)
returns void
language plpgsql
security definer
as $$
declare
  v_event_id uuid;
  v_old_status text;
  v_up_next_id uuid;
  v_queued_id uuid;
begin
  if p_new_status not in ('queued','up_next','performing_now','performed','rejected') then
    raise exception 'Invalid karaoke status: %', p_new_status;
  end if;

  -- Lock target row and read current state
  select event_id, status
  into v_event_id, v_old_status
  from public.requests
  where id = p_request_id
    and request_type = 'karaoke'
  for update;

  if not found then
    raise exception 'Karaoke request not found: %', p_request_id;
  end if;

  -- Lock all karaoke rows for event (serializes queue transitions)
  perform 1
  from public.requests
  where event_id = v_event_id
    and request_type = 'karaoke'
  for update;

  -- Enforce single slot behavior when explicitly setting these
  if p_new_status = 'up_next' then
    update public.requests
    set status = 'queued'
    where event_id = v_event_id
      and request_type = 'karaoke'
      and status = 'up_next'
      and id <> p_request_id;
  end if;

  if p_new_status = 'performing_now' then
    update public.requests
    set status = 'performed'
    where event_id = v_event_id
      and request_type = 'karaoke'
      and status = 'performing_now'
      and id <> p_request_id;
  end if;

  -- Apply requested status change
  update public.requests
  set status = p_new_status
  where id = p_request_id;

  -- Your rule:
  -- if moved OUT of performing_now, promote up_next -> performing_now
  -- then first queued -> up_next
  if v_old_status = 'performing_now' and p_new_status <> 'performing_now' then
    select id
    into v_up_next_id
    from public.requests
    where event_id = v_event_id
      and request_type = 'karaoke'
      and status = 'up_next'
    order by created_at asc, id asc
    limit 1;

    if v_up_next_id is not null then
      update public.requests
      set status = 'performing_now'
      where id = v_up_next_id;

      select id
      into v_queued_id
      from public.requests
      where event_id = v_event_id
        and request_type = 'karaoke'
        and status = 'queued'
      order by created_at asc, id asc
      limit 1;

      if v_queued_id is not null then
        update public.requests
        set status = 'up_next'
        where id = v_queued_id;
      end if;
    end if;
  end if;
end;
$$;