-- Fase 1 — schema principal (skill bixo-dados).
-- O PostGIS mora no schema "extensions"; por isso os tipos e funções geográficas vêm qualificados.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.republic_kind as enum ('male', 'female', 'mixed');
create type public.republic_status as enum ('pending', 'approved', 'rejected', 'archived');
create type public.listing_status as enum ('active', 'inactive');
create type public.report_reason as enum (
  'wrong_info',       -- informação errada
  'closed',           -- república não existe mais
  'no_consent',       -- cadastrada sem autorização dos moradores
  'removal_request',  -- pedido de remoção (LGPD)
  'other'
);

-- ---------------------------------------------------------------------------
-- Cidades e instituições
-- ---------------------------------------------------------------------------
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state char(2) not null default 'SP',
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id) on delete restrict,
  name text not null,
  acronym text,
  campus_name text,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  location extensions.geography(Point, 4326) not null,
  website text,
  housing_contact_url text,
  housing_contact_email text,
  housing_contact_phone text,
  has_own_housing boolean not null default false,
  housing_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, slug)
);

create index institutions_city_id_idx on public.institutions (city_id);
create index institutions_location_idx on public.institutions using gist (location);

-- ---------------------------------------------------------------------------
-- Repúblicas
-- ---------------------------------------------------------------------------
create table public.republics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 80),
  kind public.republic_kind not null,
  city_id uuid not null references public.cities (id) on delete restrict,
  neighborhood text,
  -- Ponto APROXIMADO: a trigger snap_approx_location arredonda para ~100 m ao salvar.
  approx_location extensions.geography(Point, 4326) not null,
  description text check (char_length(description) <= 2000),
  price_min integer check (price_min >= 0),
  price_max integer check (price_max >= 0),
  open_spots integer not null default 0 check (open_spots >= 0),
  total_residents integer check (total_residents >= 0),
  amenities text[] not null default '{}',
  house_rules text check (char_length(house_rules) <= 2000),
  photos text[] not null default '{}' check (cardinality(photos) <= 12),
  instagram text check (instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  -- Só dígitos, com DDI e DDD: 55 + 2 dígitos de DDD + 8 ou 9 dígitos.
  whatsapp text check (whatsapp ~ '^55[0-9]{10,11}$'),
  contact_name text check (char_length(contact_name) <= 80),
  owner_user_id uuid references auth.users (id) on delete set null,
  status public.republic_status not null default 'pending',
  verified boolean not null default false,
  consent_at timestamptz not null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (price_max is null or price_min is null or price_max >= price_min)
);

create index republics_location_idx on public.republics using gist (approx_location);
create index republics_status_idx on public.republics (status);
create index republics_city_id_idx on public.republics (city_id);
create index republics_owner_user_id_idx on public.republics (owner_user_id);

-- Faculdades que a república declara atender ("rep de alunos da UNESP").
-- A distância NÃO fica guardada aqui: ela é calculada na hora da busca.
create table public.republic_institutions (
  republic_id uuid not null references public.republics (id) on delete cascade,
  institution_id uuid not null references public.institutions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (republic_id, institution_id)
);

create index republic_institutions_institution_id_idx
  on public.republic_institutions (institution_id);

-- ---------------------------------------------------------------------------
-- Imóveis (apartamentos/kitnets) — só links externos, sem scraping
-- ---------------------------------------------------------------------------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  city_id uuid not null references public.cities (id) on delete restrict,
  approx_location extensions.geography(Point, 4326),
  price integer check (price >= 0),
  bedrooms integer check (bedrooms >= 0),
  furnished boolean,
  external_url text not null check (external_url ~ '^https://'),
  source text,
  status public.listing_status not null default 'active',
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_location_idx on public.listings using gist (approx_location);
create index listings_city_id_idx on public.listings (city_id);

-- ---------------------------------------------------------------------------
-- Denúncias / pedidos de remoção
-- ---------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  republic_id uuid not null references public.republics (id) on delete cascade,
  reason public.report_reason not null,
  message text check (char_length(message) <= 1000),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index reports_republic_id_idx on public.reports (republic_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Mantém updated_at sempre atualizado.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger institutions_set_updated_at
  before update on public.institutions
  for each row execute function public.set_updated_at();

create trigger republics_set_updated_at
  before update on public.republics
  for each row execute function public.set_updated_at();

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- LGPD: arredonda o ponto para uma grade de 0,001° (~100 m) antes de gravar.
-- Roda no banco, então nem um formulário adulterado consegue salvar a localização exata.
create function public.snap_approx_location()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.approx_location is not null then
    new.approx_location := extensions.st_snaptogrid(
      new.approx_location::extensions.geometry, 0.001
    )::extensions.geography;
  end if;
  return new;
end;
$$;

create trigger republics_snap_approx_location
  before insert or update of approx_location on public.republics
  for each row execute function public.snap_approx_location();

create trigger listings_snap_approx_location
  before insert or update of approx_location on public.listings
  for each row execute function public.snap_approx_location();
