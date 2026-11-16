---
name: bixo-geo-busca
description: Busca por cidade e faculdade, cálculo de distância, mapa, rotas de SEO e busca em linguagem natural com IA no bixo.net. Use ao implementar a busca, os filtros, o mapa, as URLs por cidade/faculdade ou a integração com a Claude API.
---

# Busca, mapa e IA

## Fluxo da busca

1. O usuário escolhe a cidade → autocomplete das instituições daquela cidade.
2. Redireciona para `/[cidade-slug]/[instituicao-slug]` (ex.: `/sorocaba/unesp`). Essa URL é a página de resultados, boa para SEO e para compartilhar no WhatsApp.
3. A página busca repúblicas aprovadas da cidade, ordenadas por distância até o campus.

## Distância

- Função SQL (RPC no Supabase) `search_republics(institution_id, max_distance_m, kind, max_price, only_open)` usando `ST_Distance` e `ST_DWithin` com `geography`.
- Mostre a distância arredondada ("~800 m", "~2,3 km"). É distância em linha reta; deixe isso claro num tooltip.

## Mapa

- MapLibre GL ou react-leaflet + tiles OSM, carregado só no cliente (`dynamic(..., { ssr: false })`).
- Pino do campus em destaque; repúblicas como **círculos de ~150 m** (área aproximada), nunca pino exato.
- Atribuição do OpenStreetMap visível.

## Geocodificação

- Coordenadas dos campi entram no seed manualmente.
- No cadastro de república, o dono marca o ponto num mapa (pino arrastável) em vez de digitar endereço. Se precisar geocodificar bairro, use Nominatim respeitando o limite de 1 req/s e com User-Agent identificado, ou um provedor pago com chave em variável de ambiente.

## SEO

- `generateMetadata` por página: "Repúblicas perto da UNESP Sorocaba | bixo.net".
- Imagem Open Graph dinâmica para o link ficar bonito no WhatsApp.
- `sitemap.ts` gerado a partir de cidades e instituições.

## IA (Fase 7, depois do MVP)

- Campo "Descreva o que você procura" → rota `POST /api/ai-search` → Claude API (modelo `claude-haiku-5-5`, barato e rápido) com **tool use** retornando JSON validado por Zod:
  `{ kind?, max_price?, max_distance_m?, only_open?, amenities?[] }`.
- Os filtros extraídos vão para a mesma RPC de busca. A IA **não inventa repúblicas**: ela só traduz texto em filtros.
- `ANTHROPIC_API_KEY` só no servidor. Rate limit por IP. Se a API falhar, caia para a busca normal.
