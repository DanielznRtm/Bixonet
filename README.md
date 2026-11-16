# bixo.net

Site onde o bixo (calouro recém-aprovado) escolhe **cidade + faculdade** e encontra repúblicas perto do campus, ou kitnets e os contatos de moradia da faculdade. MVP: Sorocaba (SP).

Contexto completo, regras e stack: [CLAUDE.md](CLAUDE.md). Contas e ferramentas: [SETUP.md](SETUP.md).

## Pré-requisitos

- Node.js 22 ou mais novo (o projeto usa 24)
- Docker Desktop, para o Supabase local
- Git

## Rodando pela primeira vez

```bash
npm install
npx playwright install chromium
cp .env.example .env.local
npm run db:start        # sobe o Supabase local (Docker precisa estar aberto)
npx supabase status     # copie a URL e a publishable key para o .env.local
npm run dev             # http://localhost:3000
```

O Supabase Studio local fica em http://127.0.0.1:54323.

## Scripts

| Comando                                   | O que faz                                                |
| ----------------------------------------- | -------------------------------------------------------- |
| `npm run dev`                             | Servidor de desenvolvimento                              |
| `npm run build` / `npm start`             | Build de produção e servidor                             |
| `npm run lint` / `npm run lint:fix`       | ESLint                                                   |
| `npm run typecheck`                       | Gera os tipos de rota do Next e roda o `tsc`             |
| `npm run format` / `npm run format:check` | Prettier (ordena classes do Tailwind também)             |
| `npm test` / `npm run test:watch`         | Testes de unidade (Vitest)                               |
| `npm run test:e2e`                        | Testes e2e (Playwright) em 375px e 1280px                |
| `npm run check`                           | lint + typecheck + testes de unidade                     |
| `npm run db:start` / `npm run db:stop`    | Liga/desliga o Supabase local                            |
| `npm run db:reset`                        | Recria o banco local com migrations + seed               |
| `npm run db:types`                        | Regenera `src/types/database.ts` a partir do banco local |
| `npm run test:db`                         | Testes do banco (pgTAP): RLS, triggers e busca           |
| `npm run test:integration`                | Busca chamada do Next contra o banco local               |

## Estrutura

```
e2e/                  testes Playwright
scripts/              importações de curadoria (scripts/import-*.ts)
supabase/
  migrations/         única forma de mudar o schema
  seed.sql            dados locais (fictícios, is_sample = true)
src/
  app/                rotas (App Router)
  components/ui/      componentes shadcn/ui
  lib/                utilitários (geo, supabase, validação)
  types/              tipos gerados do banco
```

## Banco

Toda mudança de schema é uma migration nova:

```bash
npx supabase migration new nome_da_mudanca
npm run db:reset
npm run db:types
```

O `seed.sql` só roda no banco local. Os dados de exemplo nunca vão para produção.

### Virar admin

Depois de fazer login uma vez (Fase 5), rode no SQL Editor do Studio (local: http://127.0.0.1:54323):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'seu-email@exemplo.com';
```
