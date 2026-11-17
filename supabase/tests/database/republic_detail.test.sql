-- Testes da página de detalhe (pgTAP). Rodar com: npx supabase test db
begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(9);

-- Fixtures longe de Sorocaba, para o seed não interferir.
insert into public.cities (id, name, slug)
values ('dddddddd-0000-4000-8000-000000000001', 'Detalhópolis', 'detalhopolis');

insert into public.institutions (id, city_id, name, acronym, slug, location) values
  ('dddddddd-0000-4000-8000-000000000101', 'dddddddd-0000-4000-8000-000000000001',
   'Universidade Perto', 'UP', 'up', st_setsrid(st_makepoint(-51.0, -22.0), 4326)::geography),
  ('dddddddd-0000-4000-8000-000000000102', 'dddddddd-0000-4000-8000-000000000001',
   'Universidade Longe', 'UL', 'ul', st_setsrid(st_makepoint(-51.0, -22.2), 4326)::geography);

insert into public.republics (
  id, slug, name, kind, city_id, approx_location, consent_at, status, whatsapp
) values
  ('eeeeeeee-0000-4000-8000-000000000001', 'd-aprovada', 'Aprovada', 'mixed',
   'dddddddd-0000-4000-8000-000000000001',
   st_setsrid(st_makepoint(-51.0, -22.005), 4326)::geography, now(), 'approved', '5515912345678'),
  ('eeeeeeee-0000-4000-8000-000000000002', 'd-pendente', 'Pendente', 'mixed',
   'dddddddd-0000-4000-8000-000000000001',
   st_setsrid(st_makepoint(-51.0, -22.005), 4326)::geography, now(), 'pending', null);

insert into public.republic_institutions (republic_id, institution_id)
values ('eeeeeeee-0000-4000-8000-000000000001', 'dddddddd-0000-4000-8000-000000000101');

set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

select is(
  (select name from public.get_republic('d-aprovada')),
  'Aprovada',
  'anon lê a república aprovada pela função'
);

select is(
  (select count(*)::int from public.get_republic('d-pendente')),
  0,
  'república pendente não aparece na página de detalhe'
);

select is(
  (select count(*)::int from public.get_republic('nao-existe')),
  0,
  'slug inexistente não devolve nada'
);

select is(
  (select city_slug from public.get_republic('d-aprovada')),
  'detalhopolis',
  'devolve a cidade junto'
);

-- Nenhuma coluna privada no retorno da função.
select ok(
  not exists (
    select 1
    from information_schema.routines r
    join information_schema.parameters p on p.specific_name = r.specific_name
    where r.routine_schema = 'public'
      and r.routine_name = 'get_republic'
      and p.parameter_mode = 'OUT'
      and p.parameter_name in ('owner_user_id', 'consent_at', 'status')
  ),
  'get_republic não expõe owner_user_id, consent_at nem status'
);

select is(
  (select array_agg(slug order by distance_m)
   from public.republic_nearby_institutions('eeeeeeee-0000-4000-8000-000000000001', 5000)),
  array['up'],
  'faculdades perto: só as dentro do raio'
);

select ok(
  (select distance_m between 500 and 600 and declared
   from public.republic_nearby_institutions('eeeeeeee-0000-4000-8000-000000000001')
   where slug = 'up'),
  'distância em metros (~550 m) e faculdade declarada pela república'
);

select is(
  (select array_agg(slug order by distance_m)
   from public.republic_nearby_institutions('eeeeeeee-0000-4000-8000-000000000001', 30000)),
  array['up', 'ul'],
  'raio maior inclui a faculdade longe, em ordem de distância'
);

select is(
  (select count(*)::int
   from public.republic_nearby_institutions('eeeeeeee-0000-4000-8000-000000000002')),
  0,
  'república pendente não revela faculdades próximas'
);

reset role;

select * from finish();
rollback;
