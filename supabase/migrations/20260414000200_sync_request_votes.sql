create or replace function public.sync_request_votes()
returns trigger
language plpgsql
as $$
declare
  v_request_id uuid := coalesce(new.request_id, old.request_id);
begin
  update public.requests
  set votes = (
    select count(*)::int
    from public.votes
    where request_id = v_request_id
  )
  where id = v_request_id;

  return null;
end;
$$;

drop trigger if exists trg_sync_request_votes_ins on public.votes;
create trigger trg_sync_request_votes_ins
after insert on public.votes
for each row execute function public.sync_request_votes();

drop trigger if exists trg_sync_request_votes_del on public.votes;
create trigger trg_sync_request_votes_del
after delete on public.votes
for each row execute function public.sync_request_votes();