Você vai construir comigo o **bixo.net** do zero. Leia o `CLAUDE.md` e as três skills em `.claude/skills/` antes de qualquer coisa: elas definem a stack, o design, o modelo de dados e as regras de privacidade.

## Objetivo

Um site bonito, rápido e mobile-first onde o bixo (calouro recém-aprovado) escolhe **cidade + faculdade** e vê:

- uma lista de **repúblicas** perto do campus (descrição, tipo, faixa de preço, vagas, distância, área aproximada no mapa, contato);
- se não quiser república: **apartamentos/kitnets** próximos e os **contatos de moradia da faculdade** (incluindo a moradia estudantil própria, quando existir).

O MVP é só **Sorocaba (SP)**, mas o modelo de dados e as URLs já precisam suportar qualquer cidade do estado de SP.

## Como quero que você trabalhe

1. **Comece em modo de planejamento.** Me mostre: árvore de pastas, lista de páginas/rotas, schema SQL e o plano das fases abaixo. Espere eu aprovar antes de escrever código.
2. Faça **uma fase por vez**. No fim de cada uma: rode `lint`, `typecheck` e testes, abra as páginas com o MCP do Playwright (375px e 1280px), corrija o que estiver quebrado, faça commit e me mande um resumo curto com o que testar.
3. Quando não tiver certeza da API de uma biblioteca (Next.js, Supabase, MapLibre, shadcn), consulte o **context7** em vez de chutar.
4. **Pergunte antes** de: criar conta ou recurso pago, mudar a stack, ou apagar dados.
5. Estou aprendendo: quando tomar uma decisão de arquitetura importante, explique em 2–3 linhas o porquê.

## Fases

**Fase 0 — Setup**
Next.js + TS + Tailwind + shadcn/ui, ESLint/Prettier, Vitest, Playwright, Supabase local (`supabase init` + PostGIS), `.env.example`, scripts no `package.json`, README com como rodar.

**Fase 1 — Banco**
Migrations com as tabelas da skill `bixo-dados`, RLS, RPC `search_republics` (skill `bixo-geo-busca`), tipos gerados. Seed: Sorocaba + as principais instituições de ensino superior da cidade com coordenada do campus e site oficial; 8–12 repúblicas e 5 imóveis **fictícios** (`is_sample = true`). Para os contatos de moradia, use só o que conseguir confirmar no site oficial; o que não confirmar fica nulo com TODO.

**Fase 2 — Home + busca**
Hero com autocomplete de cidade → faculdade; rota `/[cidade]/[instituicao]` com lista + mapa + filtros (tipo, preço, vagas, distância). Estado vazio com CTA de indicar república.

**Fase 3 — Detalhe da república**
`/republica/[slug]`: galeria, descrição, regras da casa, comodidades, área aproximada no mapa, botão "Falar no WhatsApp" (link `wa.me` com mensagem pronta: "Oi! Vi a rep de vocês no bixo.net e passei na [faculdade]..."), botão "Reportar informação errada".

**Fase 4 — "Não quero república"**
`/[cidade]/[instituicao]/moradia`: imóveis próximos (links externos) + card com contatos de moradia da faculdade e aviso quando ela tiver moradia própria.

**Fase 5 — Cadastro e moderação**
Login com magic link (Supabase Auth). `/cadastrar-republica`: formulário em etapas, upload de fotos para o Storage, ponto marcado no mapa (arredondado ao salvar), checkbox de consentimento LGPD. Entra como `pending`. `/admin`: aprovar, rejeitar, verificar, ver denúncias.

**Fase 6 — Acabamento e deploy**
SEO (metadata, sitemap, imagem Open Graph dinâmica), páginas `/sobre` e `/privacidade`, acessibilidade (navegação por teclado, contraste), Lighthouse mobile ≥ 90, deploy na Vercel com o banco no Supabase cloud.

**Fase 7 — IA (depois do MVP no ar)**
Busca em linguagem natural ("quero rep mista até 700 reais perto da UNESP") → Claude API com tool use → filtros validados por Zod → mesma RPC de busca. Fallback para a busca normal se a API falhar.

## Critério de pronto do MVP

Um bixo no celular abre `bixo.net`, escolhe Sorocaba + faculdade, vê repúblicas no mapa e na lista, filtra, abre uma, chama no WhatsApp, e consegue cair na página de apartamentos e contatos da faculdade se não quiser república. Uma república consegue se cadastrar e eu consigo aprová-la no admin.

Comece pela Fase 0 em modo de planejamento.
