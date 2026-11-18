-- Fase 4 — busca de imóveis (kitnets/apartamentos) perto de uma instituição.
--
-- Diferente das repúblicas, imóveis não têm coluna privada e o RLS já deixa o público ler
-- só os ativos. Por isso a função roda com as permissões de quem chama (security invoker,
-- o padrão): o próprio banco aplica a regra "só ativos" pelo RLS.

-- O link do anúncio identifica o imóvel: o script de importação usa isso para não duplicar.
alter table public.listings
  add constraint listings_external_url_key unique (external_url);

create function public.search_listings(
  p_institution_id uuid,
  p_max_distance_m integer default 5000,
  p_max_price integer default null,
  p_only_furnished boolean default false
)
returns table (
  id uuid,
  title text,
  price integer,
  bedrooms integer,
  furnished boolean,
  external_url text,
  source text,
  is_sample boolean,
  lat double precision,
  lng double precision,
  distance_m integer
)
language sql
stable
set search_path = ''
as $$
  select
    l.id,
    l.title,
    l.price,
    l.bedrooms,
    l.furnished,
    l.external_url,
    l.source,
    l.is_sample,
    extensions.st_y(l.approx_location::extensions.geometry) as lat,
    extensions.st_x(l.approx_location::extensions.geometry) as lng,
    round(extensions.st_distance(l.approx_location, i.location))::integer as distance_m
  from public.institutions i
  join public.listings l
    on l.approx_location is not null
   and extensions.st_dwithin(
     l.approx_location,
     i.location,
     least(greatest(coalesce(p_max_distance_m, 5000), 100), 50000)
   )
  where i.id = p_institution_id
    and l.status = 'active'
    and (p_max_price is null or l.price <= p_max_price)
    and (not coalesce(p_only_furnished, false) or l.furnished is true)
  order by distance_m, l.price nulls last
  limit 100;
$$;

grant execute on function public.search_listings to anon, authenticated;
