alter table public.user_profiles
  add column if not exists phone text;

create table if not exists public.account_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null check (
    action_type in (
      'connexion',
      'deconnexion',
      'prise_rendez_vous',
      'annulation_rendez_vous',
      'mise_a_jour_profil'
    )
  ),
  action_label text not null,
  description text,
  appointment_id uuid references public.appointments(id) on delete set null,
  ip_address text,
  country text,
  region text,
  city text,
  device_type text,
  operating_system text,
  browser text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists account_activity_logs_user_id_idx on public.account_activity_logs(user_id);
create index if not exists account_activity_logs_created_at_idx on public.account_activity_logs(created_at desc);
create index if not exists account_activity_logs_action_type_idx on public.account_activity_logs(action_type);

grant select, insert on public.account_activity_logs to authenticated;

alter table public.account_activity_logs enable row level security;

drop policy if exists "account_activity_logs_own_read" on public.account_activity_logs;
create policy "account_activity_logs_own_read"
  on public.account_activity_logs
  for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "account_activity_logs_own_insert" on public.account_activity_logs;
create policy "account_activity_logs_own_insert"
  on public.account_activity_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id or public.is_admin());
