import { describe, expect, it } from "vitest";
import { safeNext } from "./next-path";

describe("safeNext", () => {
  it("aceita caminhos internos", () => {
    expect(safeNext("/cadastrar-republica")).toBe("/cadastrar-republica");
    expect(safeNext("/admin?aba=denuncias")).toBe("/admin?aba=denuncias");
  });

  it("recusa redirecionamento para outro site", () => {
    expect(safeNext("https://golpe.com")).toBe("/minhas-reps");
    expect(safeNext("//golpe.com")).toBe("/minhas-reps");
    expect(safeNext(String.raw`/\golpe.com`)).toBe("/minhas-reps");
    expect(safeNext(null)).toBe("/minhas-reps");
  });
});
