import { describe, expect, it } from "vitest";
import { matchesInstitution, normalizeText } from "./text";

const ufscar = {
  name: "Universidade Federal de São Carlos",
  acronym: "UFSCar",
  campusName: "Campus Sorocaba",
};

describe("normalizeText", () => {
  it("remove acentos e maiúsculas", () => {
    expect(normalizeText("  São Paulo ")).toBe("sao paulo");
  });
});

describe("matchesInstitution", () => {
  it("encontra pela sigla, pelo nome ou sem acento", () => {
    expect(matchesInstitution("ufscar", ufscar)).toBe(true);
    expect(matchesInstitution("federal", ufscar)).toBe(true);
    expect(matchesInstitution("sao carlos", ufscar)).toBe(true);
    expect(matchesInstitution("federal sorocaba", ufscar)).toBe(true);
  });

  it("não encontra o que não bate", () => {
    expect(matchesInstitution("unesp", ufscar)).toBe(false);
    expect(matchesInstitution("federal paulista", ufscar)).toBe(false);
  });

  it("consulta vazia mostra tudo", () => {
    expect(matchesInstitution("   ", ufscar)).toBe(true);
  });
});
