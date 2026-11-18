import { describe, expect, it } from "vitest";
import {
  DEFAULT_LISTING_FILTERS,
  listingFiltersToRpcArgs,
  listingFiltersToSearchParams,
  parseListingFilters,
} from "./filters";
import { formatListingCount, formatListingFacts, formatMonthlyPrice } from "./format";

describe("parseListingFilters", () => {
  it("usa o padrão sem filtros e ignora valores inválidos", () => {
    expect(parseListingFilters({})).toEqual(DEFAULT_LISTING_FILTERS);
    expect(parseListingFilters({ ate: "abc", mobiliado: "sim", raio: "7" })).toEqual(
      DEFAULT_LISTING_FILTERS,
    );
  });

  it("faz o caminho de ida e volta da URL", () => {
    const qs = "ate=1000&mobiliado=1&raio=2";
    const parsed = parseListingFilters(Object.fromEntries(new URLSearchParams(qs)));
    expect(parsed).toEqual({ maxPrice: 1000, onlyFurnished: true, radiusKm: 2 });
    expect(listingFiltersToSearchParams(parsed).toString()).toBe(qs);
  });

  it("converte para os argumentos da função do banco", () => {
    expect(
      listingFiltersToRpcArgs("abc", {
        maxPrice: null,
        onlyFurnished: false,
        radiusKm: 5,
      }),
    ).toEqual({
      p_institution_id: "abc",
      p_max_distance_m: 5000,
      p_max_price: undefined,
      p_only_furnished: false,
    });
  });
});

describe("formatação de imóveis", () => {
  it("preço mensal", () => {
    expect(formatMonthlyPrice(950)).toBe("R$ 950/mês");
    expect(formatMonthlyPrice(1600)).toBe("R$ 1.600/mês");
    expect(formatMonthlyPrice(null)).toBe("Preço a consultar");
  });

  it("quartos e mobília", () => {
    expect(formatListingFacts(1, true)).toBe("1 quarto · mobiliado");
    expect(formatListingFacts(2, false)).toBe("2 quartos · sem mobília");
    expect(formatListingFacts(0, null)).toBe("Studio");
    expect(formatListingFacts(null, true)).toBe("Mobiliado");
    expect(formatListingFacts(null, null)).toBe("");
  });

  it("contagem", () => {
    expect(formatListingCount(0)).toBe("Nenhum imóvel");
    expect(formatListingCount(1)).toBe("1 imóvel");
    expect(formatListingCount(5)).toBe("5 imóveis");
  });
});
