---
name: bixo-dados
description: Modelo de dados, migrations, seed, cadastro/moderação de repúblicas e regras de LGPD do bixo.net. Use ao mexer no schema do Supabase, em RLS, em formulários de cadastro, no painel admin ou ao importar dados.
---

# Dados do bixo.net

## Tabelas (Postgres + PostGIS)

- `cities` — id, name, state (UF), slug
- `institutions` — id, name, acronym, campus_name, city_id, location (geography Point), website,
  housing_contact_url, housing_contact_email, housing_contact_phone, has_own_housing (bool), housing_notes, slug
- `republics` — id, slug, name, kind (`male` | `female` | `mixed`), city_id, neighborhood,
  approx_location (geography Point, **arredondado**), description, price_min, price_max,
  open_spots, total_residents, amenities (text[]), house_rules (text), photos (text[] do Storage),
  instagram, whatsapp, contact_name, owner_user_id,
  status (`pending` | `approved` | `rejected` | `archived`), verified (bool),
  consent_at (timestamptz, obrigatório), is_sample (bool), created_at, updated_at
- `republic_institutions` — republic_id, institution_id (faculdades que a rep declara atender; a distância NÃO é guardada, é calculada na busca)
- `listings` (apartamentos/kitnets) — id, title, city_id, approx_location, price, bedrooms, furnished,
  external_url, source, is_sample, status, created_at
- `reports` — id, republic_id, reason (`wrong_info` | `closed` | `no_consent` | `removal_request` | `other`), message, resolved_at, created_at
- `admins` — user_id (quem modera; inclusão só por SQL com a chave secreta)

## Regras

- RLS ligado em todas as tabelas. Leitura pública só de `status = 'approved'`. Escrita: o dono (`owner_user_id`) edita a própria república; admin modera tudo.
- O público (anon) NÃO lê a tabela `republics`: só pelas funções `security definer` (ex.: `search_republics`), que devolvem apenas repúblicas aprovadas e colunas públicas. RLS filtra linhas, não colunas.
- A trigger `protect_moderation_fields` impede o dono de mudar `status` (exceto para `archived`), `verified`, `is_sample` e `owner_user_id`.
- `approx_location`: ao salvar, arredonde a coordenada (por exemplo, 3 casas decimais, ~100 m) ou aplique um deslocamento aleatório fixo. O endereço exato **não é armazenado** na versão inicial.
- Cadastro de república exige checkbox de consentimento ("Autorizo exibir estas informações publicamente"), que grava `consent_at`.
- Nova república entra como `pending` e só aparece depois de aprovada no `/admin`.
- Seed: Sorocaba + instituições reais da cidade (nome, campus, coordenada do campus, site oficial). Repúblicas e imóveis do seed são **fictícios**, com `is_sample = true` e um selo "exemplo" na UI. Contatos de moradia das faculdades: só o que estiver no site oficial; se não encontrar, deixe nulo e marque um TODO.
- Toda mudança de schema = nova migration em `supabase/migrations/`, depois `npx supabase gen types typescript` para atualizar `src/types/database.ts`.
- Teste RLS e funções com pgTAP em `supabase/tests/database/` (`npm run test:db`). Fixtures de teste ficam longe de Sorocaba (ex.: -21, -50) para o seed não interferir.

## Fontes de dados (ordem de prioridade)

1. Autocadastro das repúblicas (formulário + moderação).
2. Curadoria manual do time (planilha → script de importação idempotente em `scripts/import-*.ts`).
3. Imóveis: links externos ou parcerias. **Sem scraping** de portais ou redes sociais.
