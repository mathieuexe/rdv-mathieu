alter table public.site_settings
add column if not exists booking_blocked boolean not null default false,
add column if not exists booking_blocked_message text;
