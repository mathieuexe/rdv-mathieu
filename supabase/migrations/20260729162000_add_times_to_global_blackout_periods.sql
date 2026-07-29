alter table public.global_blackout_periods
  add column if not exists start_time time not null default '00:00',
  add column if not exists end_time time not null default '23:59';

alter table public.global_blackout_periods
  drop constraint if exists global_blackout_periods_datetime_check;

alter table public.global_blackout_periods
  add constraint global_blackout_periods_datetime_check
  check ((start_date, start_time) <= (end_date, end_time));
