import type { RepublicKind } from "./filters";

export const KIND_LABEL: Record<RepublicKind, string> = {
  male: "Masculina",
  female: "Feminina",
  mixed: "Mista",
};

const brl = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/** "R$ 650–800/mês", "a partir de R$ 650/mês", "até R$ 800/mês" ou "Preço a combinar". */
export function formatPriceRange(min: number | null, max: number | null): string {
  if (min !== null && max !== null) {
    return min === max
      ? `R$ ${brl.format(min)}/mês`
      : `R$ ${brl.format(min)}–${brl.format(max)}/mês`;
  }
  if (min !== null) return `a partir de R$ ${brl.format(min)}/mês`;
  if (max !== null) return `até R$ ${brl.format(max)}/mês`;
  return "Preço a combinar";
}

export function formatOpenSpots(n: number): string {
  if (n === 0) return "Sem vagas agora";
  return n === 1 ? "1 vaga" : `${n} vagas`;
}

export function formatResultCount(n: number): string {
  if (n === 0) return "Nenhuma república";
  return n === 1 ? "1 república" : `${n} repúblicas`;
}
