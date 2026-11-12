-- Pipeline commercial de l'administration : une fiche par prospect, rangée
-- dans une colonne (étape) comme sur un tableau Trello.

create table if not exists public.pipeline_cards (
  id uuid primary key default gen_random_uuid(),
  stage text not null default 'nouveau'
    check (stage in ('nouveau', 'contacte', 'rendez_vous', 'proposition', 'gagne', 'perdu')),
  position integer not null default 0,
  first_name text not null default '',
  last_name text not null,
  company_name text,
  company_siren text,
  email text,
  phone text,
  estimated_amount numeric(12, 2),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pipeline_cards_stage_position_idx on public.pipeline_cards(stage, position);

-- Données internes : aucune politique publique, seule la clé de service
-- (utilisée par l'administration côté serveur) peut lire et écrire.
alter table public.pipeline_cards enable row level security;
