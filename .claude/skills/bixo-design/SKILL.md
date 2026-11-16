---
name: bixo-design
description: Identidade visual e regras de UI do bixo.net. Use ao criar ou alterar qualquer página, componente, layout, cor, tipografia ou microcopy do site.
---

# Design do bixo.net

## Personalidade

Acolhedor, jovem e confiável. O público tem 17–20 anos e muitas vezes os pais estão olhando junto.
O site precisa parecer animado (é a primeira casa longe da família), mas sério o bastante para passar segurança.
Evite cara de template genérico de SaaS e evite visual de classificados poluído.

## Fundamentos

- **Mobile-first.** A maioria chega pelo celular, vindo de um link no grupo de WhatsApp dos aprovados. Projete em 375px primeiro.
- Paleta: defina tokens em CSS variables (`--primary`, `--accent`, `--surface`, `--muted`). Uma cor primária forte e quente + um acento; fundo claro e quente, não branco puro. Suporte a dark mode.
- Tipografia: uma fonte display com personalidade nos títulos + uma sans legível no corpo (via `next/font`). Corpo mínimo 16px.
- Cantos arredondados generosos, sombras suaves, espaçamento amplo.
- Contraste WCAG AA no mínimo. Todo controle precisa funcionar no teclado e ter label.

## Componentes principais

- **Hero de busca** (home): duas entradas, "Cidade" e "Faculdade", com autocomplete; a faculdade é filtrada pela cidade. Um botão grande: "Achar minha república".
- **Card de república**: foto, nome, selo de tipo (masculina / feminina / mista), faixa de preço, vagas, distância até o campus ("~800 m da UNESP"), selo "Verificada" quando aplicável.
- **Lista + mapa**: no desktop, lista à esquerda e mapa à direita; no mobile, abas "Lista | Mapa". O mapa mostra uma **área aproximada** (círculo), nunca o endereço exato.
- **Filtros**: tipo, preço máximo, vagas disponíveis, distância. Filtro ativo aparece como chip removível.
- **Bloco "Não quero república"**: leva para apartamentos/kitnets e para os contatos de moradia da faculdade.
- **Estados vazios** úteis: "Ainda não temos repúblicas cadastradas aqui — conhece alguma? Indique" + CTA para cadastro.

## Microcopy

- Fale com o bixo por "você", de forma leve. Pode usar "bixo" e "rep", sem gíria forçada.
- Nunca prometa segurança ou qualidade de uma república que não foi verificada.
- Botões com verbos: "Ver república", "Falar no WhatsApp", "Cadastrar minha rep".

## Verificação

Depois de mexer em UI, abra a página com o MCP do Playwright em 375px e 1280px, tire screenshot e corrija problemas de layout antes de concluir.
