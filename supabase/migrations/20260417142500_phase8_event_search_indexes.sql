-- For code lookups/prefix lookups by owner
create index if not exists events_dj_id_event_code_idx
  on public.events (dj_id, event_code);

-- For name ILIKE searches (trigram)
create extension if not exists pg_trgm;

create index if not exists events_name_trgm_idx
  on public.events using gin (name gin_trgm_ops);