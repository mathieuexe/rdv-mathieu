-- Permet de modifier localement une indisponibilité importée de Google Agenda
-- (titre, date, heure) sans que la synchronisation suivante n'écrase la retouche.
--
-- Les colonnes `summary`, `starts_at` et `ends_at` portent désormais les valeurs
-- *effectives* (celles utilisées par le site) ; les colonnes `google_*`
-- conservent les dernières valeurs reçues de Google.

alter table public.google_calendar_events
  add column if not exists google_summary text,
  add column if not exists google_starts_at timestamptz,
  add column if not exists google_ends_at timestamptz,
  add column if not exists google_is_all_day boolean not null default false,
  add column if not exists is_overridden boolean not null default false,
  add column if not exists overridden_at timestamptz;

update public.google_calendar_events
set
  google_summary = coalesce(google_summary, summary),
  google_starts_at = coalesce(google_starts_at, starts_at),
  google_ends_at = coalesce(google_ends_at, ends_at),
  google_is_all_day = is_all_day
where google_starts_at is null or google_ends_at is null;
