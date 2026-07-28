alter table public.appointments
  add column if not exists origin text not null default 'utilisateur';

alter table public.appointments
  add column if not exists created_by_admin_user_id uuid references auth.users(id) on delete set null;

alter table public.appointments
  add column if not exists created_by_admin_email text;

alter table public.appointments
  drop constraint if exists appointments_origin_check;

alter table public.appointments
  add constraint appointments_origin_check
  check (origin in ('utilisateur', 'administrateur'));
