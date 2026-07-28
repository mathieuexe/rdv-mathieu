create extension if not exists btree_gist;

drop index if exists public.appointments_unique_active_slot_idx;

alter table public.appointments
  drop constraint if exists appointments_no_overlap_active;

alter table public.appointments
  add constraint appointments_no_overlap_active
  exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status in ('en_attente', 'accepte'));
