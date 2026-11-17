-- Fase 3 — leitura pública da página de uma república.
-- Mesmo padrão da busca: security definer, só repúblicas aprovadas e só colunas públicas
-- (nada de owner_user_id, consent_at ou status).

create function public.get_republic(p_slug text)
returns table (
  id uuid,
  slug text,
  name text,
  kind public.republic_kind,
  neighborhood text,
  lat double precision,
  lng double precision,
  description text,
  price_min integer,
  price_max integer,
  open_spots integer,
  total_residents integer,
  amenities text[],
  house_rules text,
  photos text[],
  instagram text,
  whatsapp text,
  contact_name text,
  verified boolean,
  is_sample boolean,
  city_slug text,
  city_name text,
  city_state text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    r.id,
    r.slug,
    r.name,
    r.kind,
    r.neighborhood,
    extensions.st_y(r.approx_location::extensions.geometry) as lat,
    extensions.st_x(r.approx_location::extensions.geometry) as lng,
    r.description,
    r.price_min,
    r.price_max,
    r.open_spots,
    r.total_residents,
    r.amenities,
    r.house_rules,
    r.photos,
    r.instagram,
    r.whatsapp,
    r.contact_name,
    r.verified,
    r.is_sample,
    c.slug as city_slug,
    c.name as city_name,
    c.state as city_state,
    r.updated_at
  from public.republics r
  join public.cities c on c.id = r.city_id
  where r.slug = p_slug
    and r.status = 'approved';
$$;

-- Faculdades perto de uma república aprovada, com a distância calculada na hora.
-- "declared" = a república disse que atende essa faculdade (tabela republic_institutions).
create function public.republic_nearby_institutions(
  p_republic_id uuid,
  p_max_distance_m integer default 10000
)
returns table (
  institution_id uuid,
  slug text,
  name text,
  acronym text,
  city_slug text,
  distance_m integer,
  declared boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    i.id as institution_id,
    i.slug,
    i.name,
    i.acronym,
    c.slug as city_slug,
    round(extensions.st_distance(r.approx_location, i.location))::integer as distance_m,
    exists (
      select 1 from public.republic_institutions ri
      where ri.republic_id = r.id and ri.institution_id = i.id
    ) as declared
  from public.republics r
  join public.institutions i
    on extensions.st_dwithin(
      r.approx_location,
      i.location,
      least(greatest(coalesce(p_max_distance_m, 10000), 100), 50000)
    )
  join public.cities c on c.id = i.city_id
  where r.id = p_republic_id
    and r.status = 'approved'
  order by distance_m
  limit 10;
$$;

revoke execute on function public.get_republic from public;
grant execute on function public.get_republic to anon, authenticated;
revoke execute on function public.republic_nearby_institutions from public;
grant execute on function public.republic_nearby_institutions to anon, authenticated;
