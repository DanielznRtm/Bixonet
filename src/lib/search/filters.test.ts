import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  filtersToRpcArgs,
  filtersToSearchParams,
  hasActiveFilters,
  parseFilters,
} from "./filters";

describe("parseFilters", () => {
  it("usa o padrão quando a URL não tem filtros", () => {
    expect(parseFilters({})).toEqual(DEFAULT_FILTERS);
  });

  it("lê todos os filtros válidos", () => {
    expect(parseFilters({ tipo: "feminina", ate: "700", vaga: "1", raio: "2" })).toEqual({
      kind: "feminina",
      maxPrice: 700,
      onlyOpen: true,
      radiusKm: 2,
    });
  });

  it("ignora valores inválidos sem quebrar os outros", () => {
    expect(
      parseFilters({ tipo: "alien", ate: "abc", vaga: "sim", raio: "3", x: "1" }),
    ).toEqual(DEFAULT_FILTERS);
    expect(parseFilters({ tipo: "mista", raio: "999" })).toEqual({
      ...DEFAULT_FILTERS,
      kind: "mista",
    });
  });

  it("pega o primeiro valor quando o parâmetro vem repetido", () => {
    expect(parseFilters({ tipo: ["masculina", "feminina"] }).kind).toBe("masculina");
  });
});

describe("filtersToSearchParams", () => {
  it("omite os valores padrão", () => {
    expect(filtersToSearchParams(DEFAULT_FILTERS).toString()).toBe("");
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
  });

  it("faz o caminho de volta da URL", () => {
    const params = "tipo=feminina&ate=700&vaga=1&raio=2";
    const parsed = parseFilters(Object.fromEntries(new URLSearchParams(params)));
    expect(filtersToSearchParams(parsed).toString()).toBe(params);
  });
});

describe("filtersToRpcArgs", () => {
  it("converte para os argumentos da função do banco", () => {
    expect(
      filtersToRpcArgs("abc", {
        kind: "mista",
        maxPrice: 900,
        onlyOpen: true,
        radiusKm: 10,
      }),
    ).toEqual({
      p_institution_id: "abc",
      p_max_distance_m: 10_000,
      p_kind: "mixed",
      p_max_price: 900,
      p_only_open: true,
    });
  });
});
