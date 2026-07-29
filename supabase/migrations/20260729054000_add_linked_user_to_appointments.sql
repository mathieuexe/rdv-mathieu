alter table public.appointments
  add column if not exists linked_user_id uuid references auth.users(id) on delete set null;

create index if not exists appointments_linked_user_id_idx on public.appointments(linked_user_id);
