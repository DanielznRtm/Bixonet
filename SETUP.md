# Setup do ambiente — bixo.net

## 1. Contas (todas têm plano gratuito para começar)

- GitHub — repositório `bixo.net`
- Supabase — banco Postgres + PostGIS, Auth, Storage
- Vercel — deploy, conectado ao GitHub
- Domínio `bixo.net` — verifique se está livre e o preço num registrador (ex.: Registro.br não vende `.net`; use Cloudflare, Namecheap etc.). Alternativa barata: `bixo.net.br` no Registro.br.
- Anthropic Console — só na fase de IA (`ANTHROPIC_API_KEY`)

## 2. Ferramentas locais

- Node.js LTS + npm
- Docker Desktop (o Supabase local roda em containers)
- Supabase CLI (`npm i -D supabase` no projeto já resolve)
- Git

## 3. Copie o kit para a pasta do projeto

```
bixo.net/
├── CLAUDE.md
├── .mcp.json
└── .claude/skills/
    ├── bixo-design/SKILL.md
    ├── bixo-dados/SKILL.md
    └── bixo-geo-busca/SKILL.md
```

## 4. MCPs (já declarados no `.mcp.json`)

Ao abrir o Claude Code na pasta, ele pergunta se você aprova os servidores do projeto. Aprove.

| MCP        | Para quê                                                                               |
| ---------- | -------------------------------------------------------------------------------------- |
| context7   | Documentação atualizada de Next.js, Supabase, MapLibre, shadcn                         |
| playwright | O Claude abre o site, tira screenshot e testa o fluxo sozinho                          |
| supabase   | Criar tabelas, rodar SQL, ver logs no projeto cloud (pede login OAuth na primeira vez) |
| vercel     | Ver deploys e logs de build                                                            |

Para conferir: dentro do Claude Code, rode `/mcp`.

## 5. Plugin de design (opcional, recomendado)

No Claude Code:

```
/plugin marketplace add anthropics/claude-code
/plugin install frontend-design@claude-code-plugins
```

Ele complementa a skill `bixo-design` para o site não sair com cara de template.

## 6. Rode

```
cd bixo.net
claude
```

Cole o conteúdo de `PROMPT_CLAUDE_CODE.md`.

## 7. O que NÃO é código mas decide o projeto

- **Dados de república:** não existe API. Monte uma planilha com as reps que você conhece em Sorocaba e peça para elas se cadastrarem (ou cadastre com autorização). Sem dados reais, o site bonito fica vazio.
- **Distribuição:** grupos de WhatsApp/Facebook de aprovados de cada faculdade e os perfis das próprias repúblicas no Instagram. Período crítico: listas de aprovados (dez–fev) e semana de matrícula.
- **LGPD:** página de privacidade, consentimento no cadastro, botão para a república pedir remoção.
