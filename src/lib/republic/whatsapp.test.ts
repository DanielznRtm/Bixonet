import { describe, expect, it } from "vitest";
import { formatPhone, whatsappLink, whatsappMessage } from "./whatsapp";

describe("whatsappMessage", () => {
  it("cita a faculdade quando sabe de onde o bixo veio", () => {
    expect(whatsappMessage("Unesp")).toBe(
      "Oi! Vi a rep de vocês no bixo.net e passei na Unesp. Ainda tem vaga?",
    );
  });

  it("funciona sem a faculdade", () => {
    expect(whatsappMessage(null)).toBe(
      "Oi! Vi a rep de vocês no bixo.net. Ainda tem vaga?",
    );
  });
});

describe("whatsappLink", () => {
  it("monta o link wa.me com o texto codificado", () => {
    const link = whatsappLink("5515912345678", "Unesp");
    expect(link).toMatch(/^https:\/\/wa\.me\/5515912345678\?text=/);
    const text = new URL(link!).searchParams.get("text");
    expect(text).toBe(
      "Oi! Vi a rep de vocês no bixo.net e passei na Unesp. Ainda tem vaga?",
    );
  });

  it("aceita fixo (8 dígitos) e celular (9 dígitos)", () => {
    expect(whatsappLink("551532123456")).not.toBeNull();
    expect(whatsappLink("5515912345678")).not.toBeNull();
  });

  it("devolve null sem número ou com formato inválido", () => {
    expect(whatsappLink(null)).toBeNull();
    expect(whatsappLink("")).toBeNull();
    expect(whatsappLink("15912345678")).toBeNull(); // sem DDI
    expect(whatsappLink("55 15 91234-5678")).toBeNull(); // com espaços
  });
});

describe("formatPhone", () => {
  it("formata celular e fixo", () => {
    expect(formatPhone("5515912345678")).toBe("(15) 91234-5678");
    expect(formatPhone("551532123456")).toBe("(15) 3212-3456");
  });
});
