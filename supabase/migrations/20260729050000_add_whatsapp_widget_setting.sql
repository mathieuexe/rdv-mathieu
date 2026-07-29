alter table public.site_settings
  add column if not exists enable_whatsapp_widget boolean not null default false;
