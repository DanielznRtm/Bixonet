-- Testes do catálogo, do sitemap e do limite de denúncias (pgTAP).
begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(6);

-- Prazo de guarda da política de privacidade: limpeza diária agendada.
select is(
  (select command from cron.job where jobname = 'apagar-denuncias-resolvidas'),
  $$ delete from public.reports where resolved_at < now() - interval '12 months' $$,
  'denúncias resolvidas são apagadas depois de 12 meses (pg_cron)'
);

-- O catálogo real vem da migration (não do seed): existe em qualquer banco.
select is(
  (select count(*)::int from public.institutions i
   join public.cities c on c.id = i.city_id where c.slug = 'sorocaba'),
  6,
  'catálogo de Sorocaba com 6 faculdades (migration)'
);

insert into public.cities (id, name, slug)
values ('33333333-0000-4000-8000-000000000001', 'Sitemápolis', 'sitemapolis');
insert into public.republics (id, slug, name, kind, city_id, approx_location, consent_at, status, is_sample)
values
  ('33333333-0000-4000-8000-000000000101', 's-real', 'Real', 'mixed',
   '33333333-0000-4000-8000-000000000001',
   st_setsrid(st_makepoint(-50, -22), 4326)::geography, now(), 'approved', false),
  ('33333333-0000-4000-8000-000000000102', 's-exemplo', 'Exemplo', 'mixed',
   '33333333-0000-4000-8000-000000000001',
   st_setsrid(st_makepoint(-50, -22), 4326)::geography, now(), 'approved', true),
  ('33333333-0000-4000-8000-000000000103', 's-pendente', 'Pendente', 'mixed',
   '33333333-0000-4000-8000-000000000001',
   st_setsrid(st_makepoint(-50, -22), 4326)::geography, now(), 'pending', false);

set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

select ok(
  exists (select 1 from public.list_public_republics() where slug = 's-real'),
  'sitemap inclui república publicada'
);
select ok(
  not exists (select 1 from public.list_public_republics() where slug in ('s-exemplo', 's-pendente')),
  'sitemap deixa de fora exemplos e pendentes'
);

-- 10 denúncias passam; a 11ª na mesma hora é recusada.
select lives_ok(
  $$ insert into public.reports (republic_id, reason)
     select '33333333-0000-4000-8000-000000000101', 'other' from generate_series(1, 10) $$,
  '10 denúncias na mesma hora passam'
);
select throws_ok(
  $$ insert into public.reports (republic_id, reason)
     values ('33333333-0000-4000-8000-000000000101', 'other') $$,
  '23514', null,
  'a 11ª denúncia na mesma hora é recusada'
);

reset role;
select * from finish();
rollback;
