create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('new_user', 'new_appointment', 'canceled_appointment')),
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.admin_notifications enable row level security;

drop policy if exists "admin_notifications_admin_all" on public.admin_notifications;
create policy "admin_notifications_admin_all"
  on public.admin_notifications
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.admin_notifications to authenticated;

-- Activer le temps réel sur la table
alter publication supabase_realtime add table public.admin_notifications;

-- Trigger Nouvel Utilisateur
create or replace function public.notify_admin_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_notifications (type, message, link)
  values (
    'new_user', 
    'Nouvel utilisateur inscrit : ' || coalesce(new.first_name, '') || ' ' || coalesce(new.last_name, ''), 
    '/admin/utilisateurs'
  );
  return new;
end;
$$;

drop trigger if exists on_user_profile_created_notify_admin on public.user_profiles;
create trigger on_user_profile_created_notify_admin
  after insert on public.user_profiles
  for each row execute function public.notify_admin_new_user();

-- Trigger Nouveau Rendez-vous
create or replace function public.notify_admin_new_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_notifications (type, message, link)
  values (
    'new_appointment', 
    'Nouveau rendez-vous pris par ' || new.first_name || ' ' || new.last_name, 
    '/admin/rendez-vous/' || new.id
  );
  return new;
end;
$$;

drop trigger if exists on_appointment_created_notify_admin on public.appointments;
create trigger on_appointment_created_notify_admin
  after insert on public.appointments
  for each row execute function public.notify_admin_new_appointment();

-- Trigger Annulation Rendez-vous
create or replace function public.notify_admin_canceled_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status != old.status and new.status in ('annule_client', 'annule_admin') then
    insert into public.admin_notifications (type, message, link)
    values (
      'canceled_appointment', 
      'Rendez-vous annulé pour ' || new.first_name || ' ' || new.last_name, 
      '/admin/rendez-vous/' || new.id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_appointment_canceled_notify_admin on public.appointments;
create trigger on_appointment_canceled_notify_admin
  after update on public.appointments
  for each row execute function public.notify_admin_canceled_appointment();
