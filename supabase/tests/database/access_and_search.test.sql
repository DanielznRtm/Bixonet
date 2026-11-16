-- Testes do banco (pgTAP). Rodar com: npx supabase test db
-- Tudo roda dentro de uma transação e é desfeito no final (rollback).
begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(22);

-- ---------------------------------------------------------------------------
-- Fixtures (como postgres, sem RLS)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'dono@example.com'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'outra@example.com'),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'admin@example.com');

insert into public.admins (user_id) values ('aaaaaaaa-0000-4000-8000-000000000003');

insert into public.cities (id, name, slug)
values ('bbbbbbbb-0000-4000-8000-000000000001', 'Testópolis', 'testopolis');

-- Campus em (-21.0, -50.0): longe de Sorocaba, para o seed não interferir
insert into public.institutions (id, city_id, name, slug, location) values (
  'bbbbbbbb-0000-4000-8000-000000000101', 'bbbbbbbb-0000-4000-8000-000000000001',
  'Universidade de Teste', 'ut',
  st_setsrid(st_makepoint(-50.0, -21.0), 4326)::geography
);

insert into public.republics (
  id, slug, name, kind, city_id, approx_location, price_min, price_max,
  open_spots, status, consent_at, owner_user_id
) values
  -- ~550 m do campus, aprovada, feminina, com vaga
  ('cccccccc-0000-4000-8000-000000000001', 't-perto', 'Perto', 'female',
   'bbbbbbbb-0000-4000-8000-000000000001',
   st_setsrid(st_makepoint(-50.0, -21.005), 4326)::geography, 500, 600, 2, 'approved', now(), null),
  -- ~2,2 km, aprovada, mista, SEM vaga
  ('cccccccc-0000-4000-8000-000000000002', 't-longe', 'Longe', 'mixed',
   'bbbbbbbb-0000-4000-8000-000000000001',
   st_setsrid(st_makepoint(-50.0, -21.02), 4326)::geography, 900, 1000, 0, 'approved', now(), null),
  -- ~1,1 km, PENDENTE, do usuário "dono"
  ('cccccccc-0000-4000-8000-000000000003', 't-pendente', 'Pendente', 'male',
   'bbbbbbbb-0000-4000-8000-000000000001',
   st_setsrid(st_makepoint(-50.0, -21.01), 4326)::geography, 400, 500, 1, 'pending', now(),
   'aaaaaaaa-0000-4000-8000-000000000001'),
  -- ~20 km, aprovada: fora do raio padrão de 5 km
  ('cccccccc-0000-4000-8000-000000000004', 't-muito-longe', 'Muito longe', 'mixed',
   'bbbbbbbb-0000-4000-8000-000000000001',
   st_setsrid(st_makepoint(-50.0, -21.18), 4326)::geography, 300, 400, 3, 'approved', now(), null);

-- ---------------------------------------------------------------------------
-- Arredondamento da localização (LGPD)
-- ---------------------------------------------------------------------------
insert into public.republics (id, slug, name, kind, city_id, approx_location, consent_at)
values ('cccccccc-0000-4000-8000-000000000005', 't-exata', 'Exata', 'mixed',
  'bbbbbbbb-0000-4000-8000-000000000001',
  st_setsrid(st_makepoint(-47.417229876, -23.479071234), 4326)::geography, now());

select is(
  (select array[round(st_y(approx_location::geometry)::numeric, 6),
                round(st_x(approx_location::geometry)::numeric, 6)]
   from public.republics where slug = 't-exata'),
  array[-23.479000, -47.417000]::numeric[],
  'a coordenada é arredondada para 3 casas decimais ao salvar'
);

-- ---------------------------------------------------------------------------
-- Público (anon)
-- ---------------------------------------------------------------------------
set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

select throws_ok(
  $$ select id from public.republics $$,
  '42501', null,
  'anon não lê a tabela republics direto'
);

select is(
  (select array_agg(slug order by distance_m) from public.search_republics('bbbbbbbb-0000-4000-8000-000000000101')),
  array['t-perto', 't-longe'],
  'busca padrão: só aprovadas, até 5 km, ordenadas pela distância'
);

select ok(
  (select distance_m between 500 and 600 from public.search_republics('bbbbbbbb-0000-4000-8000-000000000101') where slug = 't-perto'),
  'distância calculada em metros (~550 m)'
);

select is(
  (select count(*)::int from public.search_republics('bbbbbbbb-0000-4000-8000-000000000101', 50000)
   where slug = 't-pendente'),
  0,
  'república pendente nunca aparece na busca'
);

select is(
  (select array_agg(slug) from public.search_republics('bbbbbbbb-0000-4000-8000-000000000101', 5000, 'female')),
  array['t-perto'],
  'filtro por tipo'
);

select is(
  (select array_agg(slug) from public.search_republics('bbbbbbbb-0000-4000-8000-000000000101', 5000, null, 600)),
  array['t-perto'],
  'filtro por preço máximo'
);

select is(
  (select array_agg(slug) from public.search_republics('bbbbbbbb-0000-4000-8000-000000000101', 5000, null, null, true)),
  array['t-perto'],
  'filtro só com vaga'
);

select is(
  (select count(*)::int from public.search_republics('bbbbbbbb-0000-4000-8000-000000000101', 50000)
   where slug = 't-muito-longe'),
  1,
  'raio maior inclui a república a ~20 km'
);

select lives_ok(
  $$ insert into public.reports (republic_id, reason, message)
     values ('cccccccc-0000-4000-8000-000000000001', 'wrong_info', 'Preço desatualizado') $$,
  'anon denuncia república aprovada'
);

select throws_ok(
  $$ insert into public.reports (republic_id, reason)
     values ('cccccccc-0000-4000-8000-000000000003', 'other') $$,
  '42501', null,
  'anon não denuncia república pendente (nem descobre que ela existe)'
);

select throws_ok(
  $$ select id from public.reports $$,
  '42501', null,
  'anon não lê denúncias'
);

select ok(
  (select count(*) > 0 from public.institutions),
  'anon lê instituições'
);

reset role;

-- ---------------------------------------------------------------------------
-- Dono da república
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}';

select is(
  (select array_agg(slug) from public.republics),
  array['t-pendente'],
  'dono vê só a própria república (mesmo pendente)'
);

select lives_ok(
  $$ update public.republics set description = 'Casa nova' where slug = 't-pendente' $$,
  'dono edita a descrição'
);

select throws_ok(
  $$ update public.republics set status = 'approved' where slug = 't-pendente' $$,
  '42501', null,
  'dono não se aprova sozinho'
);

select throws_ok(
  $$ update public.republics set verified = true where slug = 't-pendente' $$,
  '42501', null,
  'dono não se dá o selo de verificada'
);

select throws_ok(
  $$ insert into public.republics (slug, name, kind, city_id, approx_location, consent_at,
                                   owner_user_id, status)
     values ('t-furando', 'Furando fila', 'mixed', 'bbbbbbbb-0000-4000-8000-000000000001',
             st_setsrid(st_makepoint(-50.0, -21.0), 4326)::geography, now(),
             'aaaaaaaa-0000-4000-8000-000000000001', 'approved') $$,
  '42501', null,
  'dono não cria república já aprovada'
);

select lives_ok(
  $$ update public.republics set status = 'archived' where slug = 't-pendente' $$,
  'dono pode arquivar a própria república'
);

reset role;

-- ---------------------------------------------------------------------------
-- Outra pessoa logada
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub":"aaaaaaaa-0000-4000-8000-000000000002","role":"authenticated"}';

select is(
  (with u as (
     update public.republics set description = 'invadido' where slug = 't-pendente' returning 1
   ) select count(*)::int from u),
  0,
  'ninguém edita república de outra pessoa'
);

reset role;

-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub":"aaaaaaaa-0000-4000-8000-000000000003","role":"authenticated"}';

select lives_ok(
  $$ update public.republics set status = 'approved', verified = true where slug = 't-pendente' $$,
  'admin aprova e verifica'
);

select ok(
  (select count(*) > 0 from public.reports),
  'admin lê denúncias'
);

reset role;

select * from finish();
rollback;
