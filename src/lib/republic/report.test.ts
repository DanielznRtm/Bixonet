import { describe, expect, it } from "vitest";
import { reportSchema } from "./report";

const id = "00000000-0000-4000-8000-000000000201";

describe("reportSchema", () => {
  it("aceita motivo válido e limpa a mensagem", () => {
    const r = reportSchema.safeParse({
      republicId: id,
      reason: "closed",
      message: "  fechou  ",
    });
    expect(r.success && r.data).toEqual({
      republicId: id,
      reason: "closed",
      message: "fechou",
    });
  });

  it("mensagem vazia vira undefined", () => {
    const r = reportSchema.safeParse({ republicId: id, reason: "other", message: "   " });
    expect(r.success && r.data.message).toBeUndefined();
  });

  it("recusa motivo desconhecido, mensagem longa e campo-isca preenchido", () => {
    expect(reportSchema.safeParse({ republicId: id, reason: "spam" }).success).toBe(
      false,
    );
    expect(
      reportSchema.safeParse({
        republicId: id,
        reason: "other",
        message: "a".repeat(1001),
      }).success,
    ).toBe(false);
    expect(
      reportSchema.safeParse({ republicId: id, reason: "other", website: "http://spam" })
        .success,
    ).toBe(false);
  });

  it("recusa id inválido", () => {
    expect(reportSchema.safeParse({ republicId: "abc", reason: "other" }).success).toBe(
      false,
    );
  });
});
