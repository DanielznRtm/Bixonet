-- Fase 6 — catálogo REAL de Sorocaba (cidade e faculdades), para ir também para produção.
--
-- Dados conferidos em 16 e 17/11/2026:
--   - Coordenadas: OpenStreetMap (Nominatim), ponto do campus.
--   - Sites e contatos de moradia: só o que está no site/edital oficial. O resto fica null.
-- Idempotente (upsert pelo id): pode ser reaplicada sem duplicar. Para corrigir um contato
-- ou adicionar uma cidade, crie uma migration nova no mesmo formato.

-- ---------------------------------------------------------------------------
-- Cidade
-- ---------------------------------------------------------------------------
insert into public.cities (id, name, state, slug) values
  ('00000000-0000-4000-8000-000000000001', 'Sorocaba', 'SP', 'sorocaba')
on conflict (id) do update set name = excluded.name, state = excluded.state, slug = excluded.slug;

-- ---------------------------------------------------------------------------
-- Instituições
-- ---------------------------------------------------------------------------
insert into public.institutions (
  id, city_id, name, acronym, campus_name, slug, location, website,
  housing_contact_url, housing_contact_email, housing_contact_phone,
  has_own_housing, housing_notes
) values
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000001',
    'Universidade Estadual Paulista', 'Unesp',
    'Instituto de Ciência e Tecnologia (ICT) — Câmpus de Sorocaba', 'unesp',
    extensions.st_setsrid(extensions.st_makepoint(-47.41722, -23.47907), 4326)::extensions.geography,
    'https://www.sorocaba.unesp.br',
    -- TODO: o site do câmpus não traz informação de moradia/assistência estudantil.
    -- Confirmar com a Seção de Assistência Estudantil antes de preencher.
    null, null, null,
    false, null
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000001',
    'Universidade Federal de São Carlos', 'UFSCar',
    'Campus Sorocaba', 'ufscar',
    extensions.st_setsrid(extensions.st_makepoint(-47.52319, -23.58394), 4326)::extensions.geography,
    'https://www.sorocaba.ufscar.br',
    -- Fonte: Edital ProACE/UFSCar nº 01/2026 (proace.ufscar.br).
    'https://www.proace.ufscar.br',
    'deace.sor@ufscar.br',
    null, -- TODO: telefone específico do DeACE-So não confirmado.
    true,
    'A UFSCar oferece Auxílio Moradia Vaga (vagas em apartamentos da universidade, existentes no campus Sorocaba) e Auxílio Moradia em Espécie, pelo Programa de Assistência Estudantil. A seleção é por edital da ProACE; dúvidas com o DeACE-So.'
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000001',
    'Faculdade de Tecnologia de Sorocaba José Crespo Gonzales', 'Fatec Sorocaba',
    null, 'fatec',
    extensions.st_setsrid(extensions.st_makepoint(-47.42594, -23.48013), 4326)::extensions.geography,
    'https://fatecsorocaba.cps.sp.gov.br',
    -- TODO: o site oficial não traz informação de moradia.
    null, null, null,
    false, null
  ),
  (
    '00000000-0000-4000-8000-000000000104',
    '00000000-0000-4000-8000-000000000001',
    'Universidade de Sorocaba', 'Uniso',
    'Cidade Universitária Prof. Aldo Vannucchi', 'uniso',
    extensions.st_setsrid(extensions.st_makepoint(-47.39791, -23.50044), 4326)::extensions.geography,
    'https://uniso.br',
    -- TODO: o site oficial não traz informação de moradia (só a central de atendimento geral).
    null, null, null,
    false, null
  ),
  (
    '00000000-0000-4000-8000-000000000105',
    '00000000-0000-4000-8000-000000000001',
    'Centro Universitário Facens', 'Facens',
    null, 'facens',
    extensions.st_setsrid(extensions.st_makepoint(-47.42950, -23.47056), 4326)::extensions.geography,
    'https://facens.br',
    -- TODO: o site oficial não traz informação de moradia.
    null, null, null,
    false, null
  ),
  (
    '00000000-0000-4000-8000-000000000106',
    '00000000-0000-4000-8000-000000000001',
    'Pontifícia Universidade Católica de São Paulo', 'PUC-SP',
    'Faculdade de Ciências Médicas e da Saúde — Campus Sorocaba', 'puc-sp',
    extensions.st_setsrid(extensions.st_makepoint(-47.45714, -23.50974), 4326)::extensions.geography,
    'https://www.pucsp.br/universidade/campus-sorocaba',
    -- TODO: a página do campus não traz informação de moradia.
    null, null, null,
    false, null
  )
on conflict (id) do update set
  name = excluded.name,
  acronym = excluded.acronym,
  campus_name = excluded.campus_name,
  slug = excluded.slug,
  location = excluded.location,
  website = excluded.website,
  housing_contact_url = excluded.housing_contact_url,
  housing_contact_email = excluded.housing_contact_email,
  housing_contact_phone = excluded.housing_contact_phone,
  has_own_housing = excluded.has_own_housing,
  housing_notes = excluded.housing_notes;

-- TODO: IFSP Câmpus Sorocaba — a sede própria foi inaugurada em abr/2026 e o endereço
-- novo não foi confirmado em fonte oficial. Incluir quando tivermos a coordenada.
