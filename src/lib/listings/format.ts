const brl = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/** "R$ 950/mês" ou "Preço a consultar". */
export function formatMonthlyPrice(price: number | null): string {
  return price === null ? "Preço a consultar" : `R$ ${brl.format(price)}/mês`;
}

/** "1 quarto · mobiliado", "2 quartos · sem mobília", "mobiliado"… */
export function formatListingFacts(
  bedrooms: number | null,
  furnished: boolean | null,
): string {
  const parts: string[] = [];
  if (bedrooms !== null) {
    parts.push(
      bedrooms === 0 ? "Studio" : bedrooms === 1 ? "1 quarto" : `${bedrooms} quartos`,
    );
  }
  if (furnished !== null) parts.push(furnished ? "mobiliado" : "sem mobília");
  const text = parts.join(" · ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatListingCount(n: number): string {
  if (n === 0) return "Nenhum imóvel";
  return n === 1 ? "1 imóvel" : `${n} imóveis`;
}
