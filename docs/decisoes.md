# Decisões de arquitetura

Registro curto das decisões que moldaram o bixo.net: o problema, a escolha e o custo dela.
Ordem cronológica. Cada item cita onde a decisão vive no código.

---

## 1. PostGIS e distância calculada na hora da busca

**Contexto.** A pergunta central do site é "o que fica perto do meu campus?".

**Decisão.** Postgres + PostGIS com colunas `geography`. A função `search_republics` calcula a distância com `ST_Distance` a cada busca, filtrada por `ST_DWithin` com índice GiST. A distância **não** fica guardada em tabela.

**Por quê.** Um valor guardado fica errado se a coordenada de um campus for corrigida. Com centenas de repúblicas, calcular na hora custa milissegundos. Como bônus, a busca ignora limites de cidade: uma república em Votorantim a 2 km do campus aparece.

**Onde.** `supabase/migrations/*_search.sql`

## 2. O público lê repúblicas só por funções, nunca pela tabela

**Contexto.** RLS (Row Level Security) decide quais **linhas** cada papel vê, mas não quais **colunas**.

**Decisão.** O papel `anon` não tem permissão na tabela `republics`. A leitura pública passa por funções `security definer` que devolvem só repúblicas aprovadas e só colunas públicas. Dono e admin leem a tabela normalmente, com RLS.

**Por quê.** Com leitura direta, `owner_user_id` e `consent_at` vazariam para qualquer visitante.

**Onde.** `supabase/migrations/*_access_control.sql`, testado em `supabase/tests/database/`

## 3. Localização aproximada imposta pelo banco (LGPD)

**Contexto.** República é a casa de alguém.

**Decisão.** Uma trigger arredonda `approx_location` para uma grade de ~100 m em todo insert/update. O mapa mostra um círculo de ~150 m, nunca um pino. O endereço exato não é armazenado.

**Por quê.** Se a regra ficasse só no front-end, um formulário adulterado gravaria o ponto exato.

**Onde.** trigger `snap_approx_location`; `src/components/map/republic-map.tsx`

## 4. O dono não consegue se aprovar sozinho

**Contexto.** O dono edita a própria república, mas RLS não protege colunas específicas.

**Decisão.** A trigger `protect_moderation_fields` recusa mudanças em `status` (exceto arquivar), `verified`, `is_sample` e `owner_user_id` por quem não é admin.

**Onde.** `supabase/migrations/*_access_control.sql`

## 5. Testes do banco com pgTAP

**Decisão.** 22 testes rodam dentro de uma transação desfeita no fim: o público não vê pendentes, o dono não se aprova, a coordenada sai arredondada, a busca ordena e filtra.

**Por quê.** Erro de RLS não aparece em teste de tela. É o tipo de bug que vaza dados em silêncio.

**Onde.** `supabase/tests/database/access_and_search.test.sql`

## 6. Filtros na URL

**Decisão.** `?tipo=feminina&ate=700&vaga=1&raio=2`, validados com Zod campo a campo (valor inválido vira o padrão, sem quebrar os outros).

**Por quê.** O público chega por links nos grupos de WhatsApp dos aprovados: o link precisa abrir já filtrado, e o "voltar" do celular precisa funcionar.

**Onde.** `src/lib/search/filters.ts`

## 7. Cache por camada (Next.js 16, Cache Components)

**Decisão.** Cidades e faculdades ficam em cache por horas e as páginas são pré-renderizadas. A busca, que depende da URL, roda dentro de `<Suspense>` e fica em cache por minutos para cada combinação de filtros, com a tag `republics` para invalidação quando uma república for aprovada.

**Por quê.** A página aparece na hora; só a lista espera o banco.

**Onde.** `src/lib/data/`, `src/app/[cidade]/[instituicao]/page.tsx`

## 8. Mapa leve e sem custo de API

**Decisão.** MapLibre GL com tiles vetoriais do OpenFreeMap (OpenStreetMap, sem chave). O componente só é baixado no navegador, e no celular só quando a aba "Mapa" é aberta.

**Por quê.** É a parte mais pesada da página, e boa parte de quem chega pelo celular nem abre o mapa.

**Onde.** `src/components/search/search-view.tsx`, `src/components/map/`

## 9. Layout celular/desktop decidido por CSS

**Contexto.** A primeira versão escolhia o layout com JavaScript (`matchMedia`). O servidor desenhava o layout de celular e o navegador trocava para o de desktop depois de carregar: um "pulo" visual e cliques perdidos nesse instante.

**Decisão.** Os dois layouts saem do mesmo HTML e o CSS escolhe qual mostrar. O JavaScript só decide **quando montar o mapa**.

**Onde.** `src/components/search/search-view.tsx`

## 10. E2E contra o build de produção

**Contexto.** Contra o servidor de desenvolvimento, que compila cada página na primeira visita, os testes ficavam instáveis.

**Decisão.** O Playwright faz o build e testa o `next start`, em 375 px e 1280 px.

**Onde.** `playwright.config.ts`, `e2e/`

## 11. Sem scraping

**Decisão.** Repúblicas entram por autocadastro com moderação ou curadoria manual. Imóveis entram como links externos ou parcerias. Nada de raspar redes sociais ou portais.

**Por quê.** Termos de uso, LGPD e qualidade: dado raspado envelhece rápido e não tem consentimento de quem mora lá.

## 12. Página da república sem pré-geração no build

**Contexto.** Com Cache Components, `generateStaticParams` precisa devolver pelo menos um item. O banco de produção começa sem repúblicas, então o build quebraria.

**Decisão.** A página `/republica/[slug]` não é pré-gerada: carrega dentro de `<Suspense>` e os dados ficam em cache com as tags `republics` e `republic:<slug>`, para a moderação (Fase 5) invalidar só o que mudou.

**Onde.** `src/app/republica/[slug]/page.tsx`, `src/lib/data/republic-detail.ts`

## 13. Contato sem inventar dados

**Decisão.** O botão "Falar no WhatsApp" monta um link `wa.me` com mensagem pronta citando a faculdade de onde o bixo veio (`?de=unesp`). Repúblicas de exemplo não têm número: o botão aparece desativado. Número fora do formato esperado também não vira link.

**Por quê.** Um número inventado no seed poderia ser de uma pessoa real, que passaria a receber mensagens de calouros.

**Onde.** `src/lib/republic/whatsapp.ts`, `src/components/republic/contact-card.tsx`

## 14. Repetir uma vez em timeout de conexão fria

**Contexto.** Numa conexão nova, a primeira chamada ao PostGIS carrega a biblioteca e pode passar do limite de 3 s do papel público. No Supabase local do Docker no Windows isso acontecia sob carga.

**Decisão.** As consultas públicas repetem uma vez quando o banco cancela por tempo (código 57014). Outros erros não são repetidos.

**Onde.** `src/lib/supabase/retry.ts`

## 15. Busca de imóveis com as permissões de quem pergunta

**Contexto.** A busca de repúblicas usa `security definer` para esconder colunas privadas. Imóveis não têm coluna privada, e o RLS já deixa o público ler só os ativos.

**Decisão.** `search_listings` roda como `security invoker` (o padrão): o próprio RLS garante "só ativos". Menos código privilegiado no banco.

**Onde.** `supabase/migrations/*_listing_search.sql`

## 16. Imóveis por planilha, com validação antes de gravar

**Contexto.** Até existir uma tela de cadastro (Fase 5), a única forma de colocar imóveis reais seria escrever SQL. E imóveis entram por curadoria ou parceria, nunca por scraping.

**Decisão.** `npm run import:listings -- arquivo.csv` lê uma planilha (vírgula ou ponto e vírgula, como o Excel exporta), valida tudo antes (link `https://`, latitude/longitude dentro de SP, sim/não) e só grava se não houver erro, apontando a linha de cada problema. O link do anúncio é único no banco, então rodar de novo atualiza em vez de duplicar. A lógica fica em `src/lib/listings/csv.ts`, com testes; o script só lê o arquivo e grava.

**Onde.** `scripts/import-listings.ts`, `src/lib/listings/csv.ts`, `docs/imoveis-modelo.csv`
