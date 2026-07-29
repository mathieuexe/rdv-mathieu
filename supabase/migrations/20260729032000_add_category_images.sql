alter table public.categories
  add column if not exists thumbnail_image_url text,
  add column if not exists banner_image_url text;
