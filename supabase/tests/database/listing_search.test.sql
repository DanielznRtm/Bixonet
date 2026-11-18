-- Testes da busca de imóveis (pgTAP). Rodar com: npx supabase test db
begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(7);

-- Fixtures longe de Sorocaba, para o seed não interferir.
insert into public.cities (id, name, slug)
values ('ffffffff-0000-4000-8000-000000000001', 'Imovelândia', 'imovelandia');

insert into public.institutions (id, city_id, name, slug, location) values (
  'ffffffff-0000-4000-8000-000000000101', 'ffffffff-0000-4000-8000-000000000001',
  'Universidade dos Imóveis', 'ui', st_setsrid(st_makepoint(-52.0, -23.0), 4326)::geography
);

insert into public.listings
  (title, city_id, approx_location, price, bedrooms, furnished, external_url, status)
values
  ('Kitnet perto', 'ffffffff-0000-4000-8000-000000000001',
   st_setsrid(st_makepoint(-52.0, -23.005), 4326)::geography, 900, 1, true,
   'https://example.com/t-perto', 'active'),
  ('Apê longe', 'ffffffff-0000-4000-8000-000000000001',
   st_setsrid(st_makepoint(-52.0, -23.02), 4326)::geography, 1500, 2, false,
   'https://example.com/t-longe', 'active'),
  ('Kitnet inativa', 'ffffffff-0000-4000-8000-000000000001',
   st_setsrid(st_makepoint(-52.0, -23.001), 4326)::geography, 700, 1, true,
   'https://example.com/t-inativa', 'inactive');

set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

select is(
  (select array_agg(title order by distance_m)
   from public.search_listings('ffffffff-0000-4000-8000-000000000101')),
  array['Kitnet perto', 'Apê longe'],
  'só imóveis ativos, ordenados pela distância'
);

select ok(
  (select distance_m between 500 and 600
   from public.search_listings('ffffffff-0000-4000-8000-000000000101')
   where title = 'Kitnet perto'),
  'distância em metros (~550 m)'
);

select is(
  (select array_agg(title)
   from public.search_listings('ffffffff-0000-4000-8000-000000000101', 5000, 1000)),
  array['Kitnet perto'],
  'filtro por preço máximo'
);

select is(
  (select array_agg(title)
   from public.search_listings('ffffffff-0000-4000-8000-000000000101', 5000, null, true)),
  array['Kitnet perto'],
  'filtro só mobiliados'
);

select is(
  (select count(*)::int
   from public.search_listings('ffffffff-0000-4000-8000-000000000101', 1000)),
  1,
  'raio menor deixa o imóvel longe de fora'
);

select throws_ok(
  $$ insert into public.listings (title, city_id, external_url)
     values ('Invasor', 'ffffffff-0000-4000-8000-000000000001', 'https://example.com/x') $$,
  '42501', null,
  'público não cadastra imóvel'
);

reset role;

select throws_ok(
  $$ insert into public.listings (title, city_id, external_url)
     values ('Duplicado', 'ffffffff-0000-4000-8000-000000000001', 'https://example.com/t-perto') $$,
  '23505', null,
  'o mesmo link de anúncio não entra duas vezes'
);

select * from finish();
rollback;
