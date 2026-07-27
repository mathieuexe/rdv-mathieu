create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  maintenance_mode boolean not null default false,
  maintenance_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.global_blackout_periods (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  message text,
  created_at timestamptz not null default now(),
  check (start_date <= end_date)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  appointment_mode text not null check (appointment_mode in ('telephone', 'physique', 'visioconference')),
  slug text not null unique,
  is_online boolean not null default true,
  custom_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.category_availability_rules (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create table if not exists public.category_blackout_periods (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null,
  start_date date not null,
  end_date date not null,
  message text,
  created_at timestamptz not null default now(),
  check (start_date <= end_date)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  client_message text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'en_attente' check (status in ('en_attente', 'accepte', 'refuse')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_slug_idx on public.categories(slug);
create index if not exists category_availability_rules_category_idx on public.category_availability_rules(category_id);
create index if not exists category_blackout_periods_category_idx on public.category_blackout_periods(category_id);
create index if not exists appointments_category_id_idx on public.appointments(category_id);
create index if not exists appointments_status_idx on public.appointments(status);
create index if not exists appointments_starts_at_idx on public.appointments(starts_at);

create unique index if not exists appointments_unique_active_slot_idx
  on public.appointments(category_id, starts_at)
  where status in ('en_attente', 'accepte');

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  );
$$;

grant usage on schema public to anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant select on public.global_blackout_periods to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.category_availability_rules to anon, authenticated;
grant select on public.category_blackout_periods to anon, authenticated;
grant insert on public.appointments to anon, authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;
grant select, insert, update, delete on public.global_blackout_periods to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.category_availability_rules to authenticated;
grant select, insert, update, delete on public.category_blackout_periods to authenticated;
grant select, update, delete on public.appointments to authenticated;

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.global_blackout_periods enable row level security;
alter table public.categories enable row level security;
alter table public.category_availability_rules enable row level security;
alter table public.category_blackout_periods enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "admin_users_admin_only" on public.admin_users;
create policy "admin_users_admin_only"
  on public.admin_users
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "site_settings_admin_manage" on public.site_settings;
create policy "site_settings_admin_manage"
  on public.site_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "global_blackout_public_read" on public.global_blackout_periods;
create policy "global_blackout_public_read"
  on public.global_blackout_periods
  for select
  to anon, authenticated
  using (true);

drop policy if exists "global_blackout_admin_manage" on public.global_blackout_periods;
create policy "global_blackout_admin_manage"
  on public.global_blackout_periods
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "categories_public_read_online" on public.categories;
create policy "categories_public_read_online"
  on public.categories
  for select
  to anon, authenticated
  using (is_online = true);

drop policy if exists "categories_admin_manage" on public.categories;
create policy "categories_admin_manage"
  on public.categories
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "availability_rules_public_read" on public.category_availability_rules;
create policy "availability_rules_public_read"
  on public.category_availability_rules
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.categories
      where categories.id = category_availability_rules.category_id
        and categories.is_online = true
    )
  );

drop policy if exists "availability_rules_admin_manage" on public.category_availability_rules;
create policy "availability_rules_admin_manage"
  on public.category_availability_rules
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "category_blackouts_public_read" on public.category_blackout_periods;
create policy "category_blackouts_public_read"
  on public.category_blackout_periods
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.categories
      where categories.id = category_blackout_periods.category_id
        and categories.is_online = true
    )
  );

drop policy if exists "category_blackouts_admin_manage" on public.category_blackout_periods;
create policy "category_blackouts_admin_manage"
  on public.category_blackout_periods
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "appointments_public_insert_pending" on public.appointments;
create policy "appointments_public_insert_pending"
  on public.appointments
  for insert
  to anon, authenticated
  with check (
    status = 'en_attente'
    and rejection_reason is null
  );

drop policy if exists "appointments_admin_read" on public.appointments;
create policy "appointments_admin_read"
  on public.appointments
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "appointments_admin_update" on public.appointments;
create policy "appointments_admin_update"
  on public.appointments
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "appointments_admin_delete" on public.appointments;
create policy "appointments_admin_delete"
  on public.appointments
  for delete
  to authenticated
  using (public.is_admin());
