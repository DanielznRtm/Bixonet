# Publicação (deploy)

Checklist para colocar o bixo.net no ar: **Vercel** (site) + **Supabase** (banco, login, fotos)

- **Resend** (e-mail do link de login) + um **domínio próprio**.

> Regra de ouro: mudança no banco de produção só por migration (`supabase db push`), nunca
> pelo painel. O `seed.sql` (dados de exemplo) **nunca** vai para produção.

## 1. Domínio

1. Registre o domínio (ex.: `bixo.net.br` no Registro.br ou `bixo.net` na Cloudflare).
2. Crie um e-mail de contato (ex.: `contato@seu-dominio`). Ele aparece na política de
   privacidade.

## 2. Supabase (produção)

1. Crie um projeto em <https://supabase.com/dashboard>, **região South America (São Paulo)**.
   Guarde a senha do banco num gerenciador de senhas.
2. Na sua máquina:
   ```bash
   npx supabase login
   npx supabase link --project-ref <ref-do-projeto>
   npx supabase db push        # aplica TODAS as migrations (inclui o catálogo de Sorocaba)
   ```
   O `db push` mostra a lista de migrations antes de aplicar. Confira antes de confirmar.
3. **Authentication → URL Configuration**
   - Site URL: `https://seu-dominio`
   - Redirect URLs: `https://seu-dominio/**` e `https://*-seu-time.vercel.app/**` (previews)
4. **Authentication → Emails → SMTP Settings**: ative o SMTP próprio com os dados do Resend
   (passo 3). Sem isso, o Supabase só envia o link de login para os membros da sua equipe.
5. **Authentication → Emails → Templates → Magic Link**: troque o texto para português, por
   exemplo:
   - Assunto: `Seu link de acesso ao bixo.net`
   - Corpo: `<p>Oi! Clique para entrar no bixo.net:</p><p><a href="{{ .ConfirmationURL }}">Entrar</a></p><p>Se não foi você, ignore este e-mail.</p>`
6. **Authentication → Rate Limits**: e-mails por hora de acordo com o plano do Resend
   (ex.: 30/h no começo).
7. **Project Settings → API**: copie a URL do projeto e a **publishable key** (para a Vercel)
   e a **secret key** (só para o seu `.env.local` de produção, usada pelos scripts).

## 3. Resend (e-mail)

1. Crie a conta em <https://resend.com> e adicione o domínio.
2. Cadastre no DNS os registros que o Resend pedir (SPF, DKIM) e espere a verificação.
3. Crie uma API key e use em **Supabase → SMTP**:
   host `smtp.resend.com`, porta `465`, usuário `resend`, senha = API key,
   remetente `nao-responda@seu-dominio`, nome `bixo.net`.

## 4. Vercel

1. Em <https://vercel.com/new>, importe o repositório do GitHub.
2. **Settings → Functions → Region**: `gru1` (São Paulo), perto do Supabase.
3. **Settings → Environment Variables** (Production e Preview):

   | Variável                               | Valor                                  |
   | -------------------------------------- | -------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`             | URL do projeto Supabase                |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable key                        |
   | `NEXT_PUBLIC_SITE_URL`                 | `https://seu-dominio`                  |
   | `NEXT_PUBLIC_CONTROLLER_NAME`          | nome do responsável pelos dados (LGPD) |
   | `NEXT_PUBLIC_CONTACT_EMAIL`            | e-mail de contato                      |

   **Não** cadastre a `SUPABASE_SECRET_KEY` na Vercel: o site só usa a chave pública com RLS.
   Sem `NEXT_PUBLIC_CONTROLLER_NAME` e `NEXT_PUBLIC_CONTACT_EMAIL`, o build de produção falha
   de propósito.

4. **Settings → Domains**: adicione o domínio e configure o DNS como a Vercel indicar.
5. Faça o deploy e abra o site.

## 5. Depois do primeiro deploy

1. Entre em `https://seu-dominio/entrar` com o seu e-mail (testa o SMTP).
2. Na sua máquina, com o `.env.local` apontando para a produção:
   ```bash
   npm run admin:add -- seu-email@exemplo.com
   ```
3. Cadastre uma república de teste, aprove em `/admin`, confira na busca e depois tire do ar.
4. Cole um link de faculdade no WhatsApp e confira a prévia (imagem e título).
5. Envie o sitemap no [Google Search Console](https://search.google.com/search-console):
   `https://seu-dominio/sitemap.xml`.

## Atualizações

- **Código:** cada push na `main` gera um deploy na Vercel; pull requests ganham um preview.
- **Banco:** crie a migration, teste localmente (`npm run db:reset` + `npm run test:db`) e só
  então `npx supabase db push`.

## Se algo der errado

- **Site:** na Vercel, **Deployments → (deploy anterior) → Promote to Production** volta para a
  versão anterior na hora.
- **Banco:** migrations não se desfazem sozinhas. Escreva uma migration nova que corrija o
  problema. O plano gratuito do Supabase faz backup diário (Database → Backups).

## Pedidos de exclusão de dados (LGPD)

A política de privacidade promete apagar os dados em até 15 dias quando pedido por e-mail.
Para apagar uma república de vez (o "tirar do ar" só esconde), use o SQL Editor do Supabase:

```sql
delete from public.republics where slug = 'slug-da-republica';
```

As fotos ficam em **Storage → republic-photos → <id do dono>**: apague a pasta também.
Para apagar a conta do dono: **Authentication → Users → (usuário) → Delete user**.
