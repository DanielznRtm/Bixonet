import { describe, expect, it } from "vitest";
import { amenityLabel } from "./amenities";

describe("amenityLabel", () => {
  it("usa o rótulo conhecido", () => {
    expect(amenityLabel("wifi")).toBe("Wi-Fi");
    expect(amenityLabel("pet")).toBe("Aceita pet");
  });

  it("deixa chave desconhecida legível", () => {
    expect(amenityLabel("ar_condicionado")).toBe("Ar condicionado");
    expect(amenityLabel("piscina")).toBe("Piscina");
  });
});
