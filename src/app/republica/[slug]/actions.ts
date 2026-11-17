"use server";

import { type ReportState, reportSchema } from "@/lib/republic/report";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Registra uma denúncia. Roda como o papel público (anon): o RLS só aceita denúncia de
 * república aprovada e o banco limita a mensagem a 1000 caracteres.
 * TODO(Fase 6): limitar envios por IP.
 */
export async function reportRepublic(
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const parsed = reportSchema.safeParse({
    republicId: formData.get("republicId"),
    reason: formData.get("reason") ?? undefined,
    message: formData.get("message") ?? undefined,
    website: formData.get("website") ?? undefined,
  });

  if (!parsed.success) {
    // Robô (campo-isca preenchido): finge que deu certo e não grava nada.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { status: "ok" };
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { republicId, reason, message } = parsed.data;
  const { error } = await createPublicClient()
    .from("reports")
    .insert({ republic_id: republicId, reason, message });

  if (error) {
    console.error("Erro ao registrar denúncia:", error.message);
    return {
      status: "error",
      message: "Não deu para enviar agora. Tente de novo em instantes.",
    };
  }
  return { status: "ok" };
}
