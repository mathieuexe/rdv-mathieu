alter table public.site_settings
  add column if not exists maintenance_allowed_ips text[] not null default '{}'::text[];

update public.site_settings
set maintenance_allowed_ips = '{}'::text[]
where maintenance_allowed_ips is null;
