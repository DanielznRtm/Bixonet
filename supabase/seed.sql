-- Seed LOCAL do bixo.net. Roda só em `npm run db:reset`; não vai para o banco de produção.
--
-- O catálogo real (cidades e faculdades) NÃO fica aqui: está na migration *_catalog_sorocaba.sql,
-- para ir também para produção. Este arquivo só tem dados de EXEMPLO:
-- repúblicas e imóveis FICTÍCIOS, com is_sample = true, sem WhatsApp/Instagram
-- (um número inventado poderia ser de alguém de verdade) e com links para example.com.
-- ---------------------------------------------------------------------------
-- Repúblicas FICTÍCIAS (is_sample = true)
-- ---------------------------------------------------------------------------
insert into public.republics (
  id, slug, name, kind, city_id, neighborhood, approx_location, description,
  price_min, price_max, open_spots, total_residents, amenities, house_rules,
  status, verified, consent_at, is_sample
) values
  (
    '00000000-0000-4000-8000-000000000201', 'rep-jabuticaba-exemplo', 'Rep Jabuticaba (exemplo)',
    'mixed', '00000000-0000-4000-8000-000000000001', 'Alto da Boa Vista',
    extensions.st_setsrid(extensions.st_makepoint(-47.4205, -23.4762), 4326)::extensions.geography,
    'República de exemplo para testar o site. Casa com quintal, perto da Unesp, da Fatec e da Facens.',
    650, 800, 2, 6, array['wifi', 'faxina', 'lavanderia', 'churrasqueira'],
    'Divisão de tarefas semanal. Visitas avisadas no grupo.',
    'approved', true, now(), true
  ),
  (
    '00000000-0000-4000-8000-000000000202', 'rep-ninho-do-bixo-exemplo', 'Rep Ninho do Bixo (exemplo)',
    'male', '00000000-0000-4000-8000-000000000001', 'Jardim Bela Vista',
    extensions.st_setsrid(extensions.st_makepoint(-47.4290, -23.4835), 4326)::extensions.geography,
    'República de exemplo para testar o site. Quartos duplos, clima tranquilo em semana de prova.',
    550, 650, 1, 5, array['wifi', 'garagem'],
    'Silêncio depois das 23h em dia de semana.',
    'approved', false, now(), true
  ),
  (
    '00000000-0000-4000-8000-000000000203', 'rep-girassol-exemplo', 'Rep Girassol (exemplo)',
    'female', '00000000-0000-4000-8000-000000000001', 'Jardim Morumbi',
    extensions.st_setsrid(extensions.st_makepoint(-47.4330, -23.4735), 4326)::extensions.geography,
    'República de exemplo para testar o site. Casa feminina com suítes e área de estudos.',
    700, 900, 3, 7, array['wifi', 'faxina', 'mobiliado', 'suite'],
    'Sem festas na casa. Cozinha limpa depois de usar.',
    'approved', true, now(), true
  ),
  (
    '00000000-0000-4000-8000-000000000204', 'rep-casa-amarela-exemplo', 'Rep Casa Amarela (exemplo)',
    'mixed', '00000000-0000-4000-8000-000000000001', 'Villa Amarone',
    extensions.st_setsrid(extensions.st_makepoint(-47.4130, -23.4810), 4326)::extensions.geography,
    'República de exemplo para testar o site. Está lotada no momento (sem vagas).',
    600, 750, 0, 8, array['wifi', 'lavanderia', 'pet'],
    null,
    'approved', false, now(), true
  ),
  (
    '00000000-0000-4000-8000-000000000205', 'rep-sabia-exemplo', 'Rep Sabiá (exemplo)',
    'female', '00000000-0000-4000-8000-000000000001', 'Itinga',
    extensions.st_setsrid(extensions.st_makepoint(-47.5150, -23.5790), 4326)::extensions.geography,
    'República de exemplo para testar o site. Perto da UFSCar, com carona combinada para o campus.',
    450, 550, 2, 5, array['wifi', 'garagem', 'churrasqueira'],
    'Contas divididas igualmente.',
    'approved', false, now(), true
  ),
  (
    '00000000-0000-4000-8000-000000000206', 'rep-toca-da-coruja-exemplo', 'Rep Toca da Coruja (exemplo)',
    'male', '00000000-0000-4000-8000-000000000001', 'Itinga',
    extensions.st_setsrid(extensions.st_makepoint(-47.5300, -23.5875), 4326)::extensions.geography,
    'República de exemplo para testar o site. Casa grande, quartos individuais.',
    400, 500, 4, 6, array['wifi', 'mobiliado'],
    null,
    'approved', false, now(), true
  ),
  (
    '00000000-0000-4000-8000-000000000207', 'rep-maracuja-exemplo', 'Rep Maracujá (exemplo)',
    'mixed', '00000000-0000-4000-8000-000000000001', 'Jardim Novo Eldorado',
    extensions.st_setsrid(extensions.st_makepoint(-47.4020, -23.4960), 4326)::extensions.geography,
    'República de exemplo para testar o site. Dá para ir a pé até a Uniso.',
    500, 650, 2, 6, array['wifi', 'faxina'],
    'Cada um lava a própria louça.',
    'approved', false, now(), true
  ),
  (
    '00000000-0000-4000-8000-000000000208', 'rep-alecrim-exemplo', 'Rep Alecrim (exemplo)',
    'female', '00000000-0000-4000-8000-000000000001', 'Vila Boa Vista',
    extensions.st_setsrid(extensions.st_makepoint(-47.4540, -23.5060), 4326)::extensions.geography,
    'República de exemplo para testar o site. Perto da PUC-SP, com muita gente da saúde.',
    900, 1200, 1, 4, array['wifi', 'faxina', 'mobiliado', 'suite', 'lavanderia'],
    'Ambiente de estudo: silêncio à noite.',
    'approved', true, now(), true
  ),
  (
    '00000000-0000-4000-8000-000000000209', 'rep-ipe-roxo-exemplo', 'Rep Ipê Roxo (exemplo)',
    'mixed', '00000000-0000-4000-8000-000000000001', 'Jardim Vergueiro',
    extensions.st_setsrid(extensions.st_makepoint(-47.4620, -23.5050), 4326)::extensions.geography,
    'República de exemplo para testar o site. Sobrado com varanda, perto do centro.',
    800, 1000, 2, 6, array['wifi', 'churrasqueira', 'pet'],
    null,
    'approved', false, now(), true
  ),
  (
    -- Pendente de propósito: NÃO pode aparecer na busca (os testes conferem isso).
    '00000000-0000-4000-8000-000000000210', 'rep-quintal-exemplo', 'Rep Quintal (exemplo)',
    'male', '00000000-0000-4000-8000-000000000001', 'Centro',
    extensions.st_setsrid(extensions.st_makepoint(-47.4560, -23.5010), 4326)::extensions.geography,
    'República de exemplo aguardando moderação.',
    650, 800, 1, 5, array['wifi'],
    null,
    'pending', false, now(), true
  );

insert into public.republic_institutions (republic_id, institution_id) values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000105'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000103'),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000105'),
  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000104'),
  ('00000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-000000000106'),
  ('00000000-0000-4000-8000-000000000209', '00000000-0000-4000-8000-000000000106');

-- ---------------------------------------------------------------------------
-- Imóveis FICTÍCIOS (is_sample = true, links para example.com)
-- ---------------------------------------------------------------------------
insert into public.listings (
  title, city_id, approx_location, price, bedrooms, furnished, external_url, source, is_sample
) values
  (
    'Kitnet mobiliada perto da Unesp (exemplo)', '00000000-0000-4000-8000-000000000001',
    extensions.st_setsrid(extensions.st_makepoint(-47.4185, -23.4775), 4326)::extensions.geography,
    950, 1, true, 'https://example.com/imovel-exemplo-1', 'exemplo', true
  ),
  (
    'Apartamento 2 quartos no Alto da Boa Vista (exemplo)', '00000000-0000-4000-8000-000000000001',
    extensions.st_setsrid(extensions.st_makepoint(-47.4270, -23.4740), 4326)::extensions.geography,
    1600, 2, false, 'https://example.com/imovel-exemplo-2', 'exemplo', true
  ),
  (
    'Kitnet perto da UFSCar (exemplo)', '00000000-0000-4000-8000-000000000001',
    extensions.st_setsrid(extensions.st_makepoint(-47.5200, -23.5810), 4326)::extensions.geography,
    800, 1, true, 'https://example.com/imovel-exemplo-3', 'exemplo', true
  ),
  (
    'Studio perto da Uniso (exemplo)', '00000000-0000-4000-8000-000000000001',
    extensions.st_setsrid(extensions.st_makepoint(-47.4005, -23.4985), 4326)::extensions.geography,
    1100, 1, true, 'https://example.com/imovel-exemplo-4', 'exemplo', true
  ),
  (
    'Apartamento perto da PUC-SP (exemplo)', '00000000-0000-4000-8000-000000000001',
    extensions.st_setsrid(extensions.st_makepoint(-47.4555, -23.5080), 4326)::extensions.geography,
    1800, 2, false, 'https://example.com/imovel-exemplo-5', 'exemplo', true
  );
