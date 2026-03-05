-- Create public buckets
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Anyone can read (public URLs work)
create policy "Public read product-images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Public read blog-images" on storage.objects
  for select using (bucket_id = 'blog-images');

-- Only authenticated users can upload/delete
create policy "Auth upload product-images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Auth upload blog-images" on storage.objects
  for insert with check (bucket_id = 'blog-images' and auth.role() = 'authenticated');

create policy "Auth delete product-images" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Auth delete blog-images" on storage.objects
  for delete using (bucket_id = 'blog-images' and auth.role() = 'authenticated');