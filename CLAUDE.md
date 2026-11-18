# bixo.net — contexto do projeto

## O que é

Site onde o **bixo** (calouro recém-aprovado) informa **cidade + faculdade** e recebe:

1. Uma lista de **repúblicas** perto do campus (descrição, tipo, preço, vagas, região no mapa, contato).
2. Se não quiser república: **apartamentos/kitnets** próximos + **contatos da faculdade** para moradia
   (e a moradia estudantil da própria instituição, quando existir).

Começa por **Sorocaba (SP)** e depois expande para o **estado de São Paulo**.

## Stack (não trocar sem perguntar)

- Next.js (App Router) + TypeScript estrito
- Tailwind CSS + shadcn/ui; ícones lucide-react
- Supabase: Postgres + PostGIS, Auth (só admin e donos de república), Storage (fotos)
- Mapa: MapLibre GL ou Leaflet com tiles OpenStreetMap (sem custo de API)
- Validação: Zod; formulários: react-hook-form
- Testes: Vitest (unidade) + Playwright (e2e)
- Deploy: Vercel
- IA (Fase 7, depois do MVP): Claude API para busca em linguagem natural → filtros estruturados

## Regras do projeto

- Código e nomes de tabelas/colunas em **inglês**; textos da interface em **português do Brasil**.
- Use as skills em `.claude/skills/` (`bixo-design`, `bixo-dados`, `bixo-geo-busca`) quando a tarefa tocar esses temas.
- Antes de usar uma API de biblioteca que você não tem certeza, consulte a documentação atual pelo MCP **context7**.
- Mudanças no banco só via **migrations** versionadas em `supabase/migrations/`. Nunca altere o schema direto no painel.
- Segredos só em `.env.local` (nunca commitar). Mantenha `.env.example` atualizado.
- **Privacidade (LGPD):** república é a casa de alguém. Nunca exiba endereço exato publicamente — só bairro e um ponto aproximado. Telefone/WhatsApp só de quem cadastrou e deu consentimento.
- **Não faça scraping** de Facebook, Instagram, OLX, QuintoAndar, ZAP etc. Dados de república entram por cadastro próprio (com moderação) ou curadoria manual. Imóveis: links externos ou parcerias.
- Dados de exemplo (seed) devem ser claramente fictícios e marcados `is_sample = true`.
- Trabalhe em fases pequenas. Ao fim de cada fase: rode lint, typecheck e testes, e faça um commit descritivo.

## Next.js 16

@AGENTS.md
A versão instalada é mais nova que o que você conhece: antes de usar uma API do Next, leia o guia em `node_modules/next/dist/docs/` (ou consulte o context7).

## Comandos

- `npm run dev` — servidor local (http://localhost:3000)
- `npm run lint` / `npm run typecheck` / `npm test` / `npm run test:e2e` (o e2e faz build de produção e usa a porta 3100; precisa do Supabase local)
- `npm run check` — lint + typecheck + testes de unidade (rode antes de cada commit)
- `npm run format` — Prettier
- `npm run db:start` / `npm run db:stop` — Supabase local (precisa do Docker Desktop aberto)
- `npm run db:reset` — recria o banco local com migrations + seed
- `npm run db:types` — regenera `src/types/database.ts`
- `npm run test:db` — testes pgTAP do banco (RLS, triggers, busca)
- `npm run test:integration` — testa a busca chamada do Next contra o banco local
- `npm run import:listings -- arquivo.csv [--dry-run]` — importa imóveis de uma planilha (modelo: `docs/imoveis-modelo.csv`)
- `npm run admin:add -- email` — torna um usuário admin (ele precisa ter entrado no site uma vez)
- Supabase local enxuto: Studio, analytics, realtime e edge runtime desligados no `supabase/config.toml` (troque `enabled` para religar). E-mails de login vão para a caixa de teste em http://127.0.0.1:54324
