import { describe, expect, it } from "vitest";
import { formatOpenSpots, formatPriceRange, formatResultCount } from "./format";

describe("formatPriceRange", () => {
  it("mostra a faixa de preço", () => {
    expect(formatPriceRange(650, 800)).toBe("R$ 650–800/mês");
    expect(formatPriceRange(1200, 1500)).toBe("R$ 1.200–1.500/mês");
    expect(formatPriceRange(700, 700)).toBe("R$ 700/mês");
  });

  it("lida com preço incompleto ou vazio", () => {
    expect(formatPriceRange(650, null)).toBe("a partir de R$ 650/mês");
    expect(formatPriceRange(null, 800)).toBe("até R$ 800/mês");
    expect(formatPriceRange(null, null)).toBe("Preço a combinar");
  });
});

describe("contagens", () => {
  it("usa singular e plural", () => {
    expect(formatOpenSpots(0)).toBe("Sem vagas agora");
    expect(formatOpenSpots(1)).toBe("1 vaga");
    expect(formatOpenSpots(3)).toBe("3 vagas");
    expect(formatResultCount(0)).toBe("Nenhuma república");
    expect(formatResultCount(1)).toBe("1 república");
    expect(formatResultCount(6)).toBe("6 repúblicas");
  });
});
