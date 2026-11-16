-- Fase 1 — busca de repúblicas perto de uma instituição (skill bixo-geo-busca).
--
-- A distância é calculada na hora (ST_Distance entre o ponto aproximado e o campus),
-- em vez de ficar guardada: se a coordenada de um campus for corrigida, nada fica velho.
-- A busca não filtra por cidade: uma rep em Votorantim a 2 km do campus também aparece.
--
-- security definer: o público não lê a tabela republics; esta função devolve só
-- repúblicas aprovadas e só colunas que podem ser públicas.

create function public.search_republics(
  p_institution_id uuid,
  p_max_distance_m integer default 5000,
  p_kind public.republic_kind default null,
  p_max_price integer default null,
  p_only_open boolean default false
)
returns table (
  id uuid,
  slug text,
  name text,
  kind public.republic_kind,
  neighborhood text,
  lat double precision,
  lng double precision,
  price_min integer,
  price_max integer,
  open_spots integer,
  verified boolean,
  is_sample boolean,
  cover_photo text,
  distance_m integer
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
    r.price_min,
    r.price_max,
    r.open_spots,
    r.verified,
    r.is_sample,
    r.photos[1] as cover_photo,
    round(extensions.st_distance(r.approx_location, i.location))::integer as distance_m
  from public.institutions i
  join public.republics r
    on extensions.st_dwithin(
      r.approx_location,
      i.location,
      -- Raio entre 100 m e 50 km, para ninguém pedir o estado inteiro de uma vez.
      least(greatest(coalesce(p_max_distance_m, 5000), 100), 50000)
    )
  where i.id = p_institution_id
    and r.status = 'approved'
    and (p_kind is null or r.kind = p_kind)
    -- "até X reais": a vaga mais barata da rep cabe no orçamento.
    and (p_max_price is null or r.price_min <= p_max_price)
    and (not coalesce(p_only_open, false) or r.open_spots > 0)
  order by distance_m, r.name
  limit 200;
$$;

revoke execute on function public.search_republics from public;
grant execute on function public.search_republics to anon, authenticated;
