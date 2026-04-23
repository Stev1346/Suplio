-- Fix: first request was rejected because new rows started at hits=1 with p_max_hits=1.
create or replace function public.consume_rate_limit(
  p_key text,
  p_window_seconds integer,
  p_max_hits integer
)
returns table(ok boolean, retry_after_sec integer)
language plpgsql
security definer
as $$
declare
  v_now timestamptz := now();
  v_row public.rate_limits%rowtype;
begin
  insert into public.rate_limits (key, window_start, hits)
  values (p_key, v_now, 0)
  on conflict (key) do nothing;

  select * into v_row
  from public.rate_limits
  where key = p_key
  for update;

  if extract(epoch from (v_now - v_row.window_start)) >= p_window_seconds then
    update public.rate_limits
    set window_start = v_now, hits = 1
    where key = p_key;
    return query select true, 0;
    return;
  end if;

  if v_row.hits >= p_max_hits then
    return query
    select false,
           greatest(1, p_window_seconds - extract(epoch from (v_now - v_row.window_start))::int);
    return;
  end if;

  update public.rate_limits
  set hits = hits + 1
  where key = p_key;

  return query select true, 0;
end;
$$;