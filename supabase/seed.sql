insert into public.site_settings (maintenance_mode, maintenance_message)
values (
  false,
  'Le planning est temporairement indisponible. Merci de revenir un peu plus tard.'
)
on conflict do nothing;

insert into public.categories (
  id,
  title,
  description,
  duration_minutes,
  appointment_mode,
  slug,
  is_online,
  custom_message
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Consultation découverte 30 min',
    'Un premier échange pour comprendre votre besoin et cadrer la prochaine étape.',
    30,
    'visioconference',
    'consultation-30min',
    true,
    'Merci d''indiquer en quelques mots l''objet du rendez-vous.'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Audit express 45 min',
    'Un rendez-vous plus approfondi pour analyser votre contexte et proposer un plan d''action.',
    45,
    'physique',
    'audit-express-45min',
    true,
    'Merci d''apporter les éléments nécessaires à l''analyse.'
  )
on conflict (slug) do nothing;

insert into public.category_availability_rules (category_id, weekday, start_time, end_time)
values
  ('11111111-1111-1111-1111-111111111111', 1, '09:00', '12:00'),
  ('11111111-1111-1111-1111-111111111111', 2, '09:00', '12:00'),
  ('11111111-1111-1111-1111-111111111111', 4, '14:00', '18:00'),
  ('22222222-2222-2222-2222-222222222222', 3, '10:00', '12:00'),
  ('22222222-2222-2222-2222-222222222222', 5, '14:00', '18:00');

insert into public.global_blackout_periods (start_date, end_date, message)
values ('2026-08-10', '2026-08-17', 'Congés d''été : reprise des rendez-vous à partir du 18 août.')
on conflict do nothing;
