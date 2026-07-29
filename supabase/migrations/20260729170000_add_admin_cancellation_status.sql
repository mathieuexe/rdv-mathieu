alter table public.appointments
  drop constraint if exists appointments_status_check;

alter table public.appointments
  add constraint appointments_status_check
  check (status in ('en_attente', 'accepte', 'refuse', 'annule_client', 'annule_admin'));
