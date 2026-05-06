-- Create storage bucket for partner logos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'partner-logos',
  'partner-logos',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

-- Set up RLS policies for partner-logos bucket
create policy "Public read access" on storage.objects
  for select using (bucket_id = 'partner-logos');

create policy "Authenticated users can upload partner logos" on storage.objects
  for insert with check (
    bucket_id = 'partner-logos' 
    and auth.uid() in (
      select id from auth.users 
      where email in (select email from public.admin_users)
    )
  );

create policy "Admins can update partner logos" on storage.objects
  for update using (
    bucket_id = 'partner-logos'
    and auth.uid() in (
      select id from auth.users 
      where email in (select email from public.admin_users)
    )
  );

create policy "Admins can delete partner logos" on storage.objects
  for delete using (
    bucket_id = 'partner-logos'
    and auth.uid() in (
      select id from auth.users 
      where email in (select email from public.admin_users)
    )
  );
