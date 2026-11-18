-- Testes do cadastro pelo dono e da moderação (pgTAP). Rodar com: npx supabase test db
begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(13);

insert into auth.users (id, email) values
  ('11111111-0000-4000-8000-000000000001', 'dono5@example.com'),
  ('11111111-0000-4000-8000-000000000002', 'outro5@example.com'),
  ('11111111-0000-4000-8000-000000000003', 'admin5@example.com');
insert into public.admins (user_id) values ('11111111-0000-4000-8000-000000000003');

insert into public.cities (id, name, slug)
values ('22222222-0000-4000-8000-000000000001', 'Cadastrópolis', 'cadastropolis');

-- Atalho para criar uma república do dono 1 com um status.
create function pg_temp.rep(p_slug text, p_status public.republic_status)
returns void language sql as $$
  insert into public.republics (slug, name, kind, city_id, approx_location, consent_at,
                                owner_user_id, status)
  values (p_slug, p_slug, 'mixed', '22222222-0000-4000-8000-000000000001',
          st_setsrid(st_makepoint(-53.0, -24.0), 4326)::geography, now(),
          '11111111-0000-4000-8000-000000000001', p_status);
$$;

select pg_temp.rep('c-aprovada', 'approved');
select pg_temp.rep('c-recusada', 'rejected');

-- ---------------------------------------------------------------------------
-- Como o dono
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-0000-4000-8000-000000000001","role":"authenticated"}';

select lives_ok($$ select pg_temp.rep('c-p1', 'pending') $$, 'dono cadastra a 1ª em análise');
select lives_ok($$ select pg_temp.rep('c-p2', 'pending') $$, 'dono cadastra a 2ª em análise');
select lives_ok($$ select pg_temp.rep('c-p3', 'pending') $$, 'dono cadastra a 3ª em análise');
select throws_ok(
  $$ select pg_temp.rep('c-p4', 'pending') $$,
  '23514', null,
  'a 4ª em análise é recusada (limite de 3)'
);

select throws_ok(
  $$ update public.republics set moderation_note = 'eu mesmo' where slug = 'c-recusada' $$,
  '42501', null,
  'dono não mexe no motivo da recusa'
);

select throws_ok(
  $$ update public.republics set reviewed_at = now() where slug = 'c-aprovada' $$,
  '42501', null,
  'dono não marca a própria república como revisada'
);

select lives_ok(
  $$ update public.republics set description = 'Atualizei as vagas' where slug = 'c-aprovada' $$,
  'dono edita a república publicada (a mudança vale na hora)'
);

select is(
  (select status::text from public.republics where slug = 'c-aprovada'),
  'approved',
  'editar não tira a república do ar'
);

select throws_ok(
  $$ update public.republics
     set photos = array['https://evil.example.com/foto.jpg']
     where slug = 'c-aprovada' $$,
  '23514', null,
  'foto de fora do Storage é recusada'
);

select lives_ok(
  $$ update public.republics
     set photos = array['http://127.0.0.1:54321/storage/v1/object/public/republic-photos/11111111-0000-4000-8000-000000000001/a.webp']
     where slug = 'c-aprovada' $$,
  'foto da própria pasta é aceita'
);

-- Reenviar a recusada esbarra no limite (já há 3 em análise).
select throws_ok(
  $$ update public.republics set status = 'pending' where slug = 'c-recusada' $$,
  '23514', null,
  'reenviar para análise também respeita o limite de 3'
);

-- Storage: só na própria pasta.
select throws_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('republic-photos', '11111111-0000-4000-8000-000000000002/x.webp') $$,
  '42501', null,
  'dono não envia foto para a pasta de outra pessoa'
);

reset role;

-- ---------------------------------------------------------------------------
-- Como admin
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-0000-4000-8000-000000000003","role":"authenticated"}';

select lives_ok(
  $$ update public.republics
     set status = 'rejected', moderation_note = 'Faltaram fotos', reviewed_at = now()
     where slug = 'c-p1' $$,
  'admin recusa com motivo e marca a revisão'
);

reset role;

select * from finish();
rollback;
