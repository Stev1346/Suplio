-- Public read for guest-facing avatars; scoped paths per DJ
insert into storage.buckets (id, name, public)
values ('dj-avatars', 'dj-avatars', true)
on conflict (id) do nothing;

-- DJs can upload/replace/delete only inside their own folder: {uid}/...
create policy "dj_avatars_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'dj-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "dj_avatars_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'dj-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "dj_avatars_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'dj-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public bucket: object-level select often open for public read;
-- tighten if you prefer signed URLs only (then bucket public = false + separate read policy).
create policy "dj_avatars_public_read"
  on storage.objects for select to public
  using (bucket_id = 'dj-avatars');