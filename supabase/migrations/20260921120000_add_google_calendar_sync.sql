-- Synchronisation de l'agenda Google personnel de l'administrateur.
-- Les rendez-vous perso importés créent des indisponibilités sur le site public.

create table if not exists public.google_calendar_accounts (
  id uuid primary key default gen_random_uuid(),
  google_email text not null,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz not null,
  scope text,
  calendar_ids text[] not null default array['primary'],
  sync_enabled boolean not null default true,
  last_synced_at timestamptz,
  last_sync_error text,
  last_synced_event_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.google_calendar_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.google_calendar_accounts(id) on delete cascade,
  google_event_id text not null,
  calendar_id text not null,
  calendar_summary text,
  summary text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_all_day boolean not null default false,
  html_link text,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create unique index if not exists google_calendar_events_unique_idx
  on public.google_calendar_events(calendar_id, google_event_id);
create index if not exists google_calendar_events_starts_at_idx
  on public.google_calendar_events(starts_at);

-- Ces tables contiennent des jetons OAuth et des évènements privés :
-- seul le service role (backend) peut y accéder.
alter table public.google_calendar_accounts enable row level security;
alter table public.google_calendar_events enable row level security;

revoke all on public.google_calendar_accounts from anon, authenticated;
revoke all on public.google_calendar_events from anon, authenticated;
