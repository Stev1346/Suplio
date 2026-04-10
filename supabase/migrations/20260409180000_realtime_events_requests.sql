-- Realtime delivery for public.events and public.requests.
-- RLS on these tables still controls which rows anon/authenticated clients may read.
-- If a table is already in supabase_realtime, applying this migration may error; remove the duplicate line or skip.

alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.requests;
