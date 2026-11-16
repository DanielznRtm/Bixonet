-- Fase 2 — diretório público de instituições, já com latitude/longitude e a cidade.
-- A API do Supabase devolve colunas geography num formato binário; aqui o front recebe números.
-- security_invoker: a view respeita o RLS de quem consulta (instituições e cidades são públicas).

create view public.institution_directory
with (security_invoker = on)
as
select
  i.id,
  i.slug,
  i.name,
  i.acronym,
  i.campus_name,
  i.website,
  i.housing_contact_url,
  i.housing_contact_email,
  i.housing_contact_phone,
  i.has_own_housing,
  i.housing_notes,
  extensions.st_y(i.location::extensions.geometry) as lat,
  extensions.st_x(i.location::extensions.geometry) as lng,
  c.id as city_id,
  c.slug as city_slug,
  c.name as city_name,
  c.state as city_state
from public.institutions i
join public.cities c on c.id = i.city_id;

grant select on public.institution_directory to anon, authenticated;
