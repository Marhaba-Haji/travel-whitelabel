-- Create storage bucket for hero images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hero-images',
  'hero-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

drop policy if exists "Hero images public read access" on storage.objects;
create policy "Hero images public read access" on storage.objects
  for select using (bucket_id = 'hero-images');

drop policy if exists "Hero images upload access" on storage.objects;
create policy "Hero images upload access" on storage.objects
  for insert with check (
    bucket_id = 'hero-images'
    and (
      public.has_role(auth.uid(), 'superadmin'::app_role)
      or exists (
        select 1
        from public.admin_users
        where user_id = auth.uid()
          and is_active = true
      )
    )
  );

drop policy if exists "Hero images update access" on storage.objects;
create policy "Hero images update access" on storage.objects
  for update using (
    bucket_id = 'hero-images'
    and (
      public.has_role(auth.uid(), 'superadmin'::app_role)
      or exists (
        select 1
        from public.admin_users
        where user_id = auth.uid()
          and is_active = true
      )
    )
  );

drop policy if exists "Hero images delete access" on storage.objects;
create policy "Hero images delete access" on storage.objects
  for delete using (
    bucket_id = 'hero-images'
    and (
      public.has_role(auth.uid(), 'superadmin'::app_role)
      or exists (
        select 1
        from public.admin_users
        where user_id = auth.uid()
          and is_active = true
      )
    )
  );