alter table public.user_profiles
add column if not exists is_banned boolean not null default false,
add column if not exists ban_reason text;
