import { describe, expect, it } from "vitest";
import { normalizeInstagram, normalizeWhatsapp } from "./phone";
import {
  basicsSchema,
  contactSchema,
  locationSchema,
  registrationSchema,
} from "./schema";
import { republicSlug, slugify } from "./slug";

describe("slug", () => {
  it("tira acentos e símbolos", () => {
    expect(slugify("Rep Ninho do Bixo!")).toBe("rep-ninho-do-bixo");
    expect(slugify("  República São João  ")).toBe("republica-sao-joao");
  });

  it("acrescenta 4 caracteres para ser único", () => {
    expect(republicSlug("Rep Jabuticaba", () => 0)).toBe("rep-jabuticaba-aaaa");
    expect(republicSlug("!!!", () => 0)).toBe("republica-aaaa");
  });
});

describe("normalizeWhatsapp", () => {
  it("aceita os jeitos comuns de digitar", () => {
    expect(normalizeWhatsapp("(15) 99123-4567")).toBe("5515991234567");
    expect(normalizeWhatsapp("+55 15 99123-4567")).toBe("5515991234567");
    expect(normalizeWhatsapp("015 99123 4567")).toBe("5515991234567");
    expect(normalizeWhatsapp("(15) 3212-3456")).toBe("551532123456");
  });

  it("recusa números inválidos", () => {
    expect(normalizeWhatsapp("99123-4567")).toBeNull(); // sem DDD
    expect(normalizeWhatsapp("(15) 89123-4567")).toBeNull(); // celular sem 9
    expect(normalizeWhatsapp("(10) 99123-4567")).toBeNull(); // DDD inexistente
    expect(normalizeWhatsapp("abc")).toBeNull();
  });
});

describe("normalizeInstagram", () => {
  it("extrai o @ de várias formas", () => {
    expect(normalizeInstagram("@rep.jabuticaba")).toBe("rep.jabuticaba");
    expect(normalizeInstagram("https://www.instagram.com/rep_jabuticaba/?hl=pt")).toBe(
      "rep_jabuticaba",
    );
    expect(normalizeInstagram("nome com espaço")).toBeNull();
  });
});

describe("etapas do cadastro", () => {
  it("básico: preço máximo não pode ser menor que o mínimo", () => {
    const r = basicsSchema.safeParse({
      name: "Rep X",
      kind: "mixed",
      totalResidents: "",
      openSpots: "2",
      priceMin: "800",
      priceMax: "600",
    });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["priceMax"]);
  });

  it("básico: converte números do formulário", () => {
    const r = basicsSchema.parse({
      name: " Rep X ",
      kind: "female",
      totalResidents: "6",
      openSpots: "",
      priceMin: "",
      priceMax: "900",
    });
    expect(r).toEqual({
      name: "Rep X",
      kind: "female",
      totalResidents: 6,
      openSpots: 0,
      priceMin: null,
      priceMax: 900,
    });
  });

  it("local: exige o ponto no mapa dentro de SP", () => {
    expect(
      locationSchema.safeParse({
        citySlug: "sorocaba",
        neighborhood: "Centro",
        institutionIds: [],
      }).success,
    ).toBe(false);
    expect(
      locationSchema.safeParse({
        citySlug: "sorocaba",
        neighborhood: "Centro",
        lat: 40,
        lng: -74,
        institutionIds: [],
      }).success,
    ).toBe(false);
    expect(
      locationSchema.safeParse({
        citySlug: "sorocaba",
        neighborhood: "Centro",
        lat: -23.5,
        lng: -47.45,
        institutionIds: [],
      }).success,
    ).toBe(true);
  });

  it("contato: exige os dois consentimentos", () => {
    const base = { contactName: "Ana", whatsapp: "(15) 99123-4567", instagram: "" };
    expect(
      contactSchema.safeParse({ ...base, consentResident: true, consentPublic: false })
        .success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({ ...base, consentResident: true, consentPublic: true })
        .success,
    ).toBe(true);
  });

  it("o formulário completo passa", () => {
    const r = registrationSchema.safeParse({
      name: "Rep Teste",
      kind: "mixed",
      totalResidents: 5,
      openSpots: 1,
      priceMin: 600,
      priceMax: 700,
      citySlug: "sorocaba",
      neighborhood: "Centro",
      lat: -23.5,
      lng: -47.45,
      institutionIds: [],
      description: "Casa grande com quintal, perto do ponto de ônibus.",
      houseRules: "",
      amenities: ["wifi"],
      photos: [],
      contactName: "Ana",
      whatsapp: "15991234567",
      instagram: "@rep.teste",
      consentResident: true,
      consentPublic: true,
    });
    expect(r.success).toBe(true);
  });
});

describe("fitWithin", () => {
  it("reduz mantendo a proporção e nunca aumenta", async () => {
    const { fitWithin } = await import("./image");
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});
