create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  template_key text not null,
  source_type text not null,
  source_label text not null,
  recipient_email text not null,
  subject text not null,
  appointment_id uuid references public.appointments(id) on delete set null,
  resend_email_id text,
  delivery_status text not null default 'sent',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists email_logs_reference_idx on public.email_logs(reference);
create index if not exists email_logs_created_at_idx on public.email_logs(created_at desc);
create index if not exists email_logs_appointment_id_idx on public.email_logs(appointment_id);

alter table public.email_logs
  drop constraint if exists email_logs_delivery_status_check;

alter table public.email_logs
  add constraint email_logs_delivery_status_check
  check (delivery_status in ('sent', 'not_configured', 'failed'));
