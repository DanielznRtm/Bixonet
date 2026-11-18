"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { isAdmin } from "@/lib/auth/session";
import { createSessionClient } from "@/lib/supabase/server";

export type AdminResult = { ok: true } | { ok: false; message: string };

const idSchema = z.uuid();
const NOT_ALLOWED: AdminResult = { ok: false, message: "Ação permitida só para admins." };

/**
 * Atualiza uma república como admin. O RLS e a trigger já impedem quem não é admin;
 * a checagem aqui é uma segunda camada e dá uma mensagem clara.
 */
async function updateAsAdmin(
  id: string,
  patch: Record<string, unknown>,
  markReviewed = true,
): Promise<AdminResult> {
  if (!idSchema.safeParse(id).success) return { ok: false, message: "Id inválido." };
  if (!(await isAdmin())) return NOT_ALLOWED;

  const supabase = await createSessionClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("republics")
    // reviewed_at marca a revisão; a lista "Alterações recentes" compara com updated_at.
    .update({ ...patch, ...(markReviewed ? { reviewed_at: now } : {}) })
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  if (error || !data) {
    console.error("Erro na moderação:", error?.message);
    return { ok: false, message: "Não deu para salvar. Tente de novo." };
  }

  // A busca, a página da república e o sitemap atualizam na hora.
  updateTag("republics");
  updateTag(`republic:${data.slug}`);
  return { ok: true };
}

export async function approveRepublic(id: string) {
  return updateAsAdmin(id, { status: "approved", moderation_note: null });
}

export async function rejectRepublic(id: string, note: string) {
  const parsed = z
    .string()
    .trim()
    .min(5, "Explique o motivo para o dono (pelo menos 5 caracteres).")
    .max(500, "Motivo muito longo (até 500 caracteres).")
    .safeParse(note);
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0].message } as const;
  return updateAsAdmin(id, { status: "rejected", moderation_note: parsed.data });
}

export async function markReviewed(id: string) {
  return updateAsAdmin(id, {});
}

export async function setVerified(id: string, verified: boolean) {
  return updateAsAdmin(id, { verified });
}

export async function archiveRepublic(id: string) {
  return updateAsAdmin(id, { status: "archived" });
}

export async function resolveReport(reportId: string): Promise<AdminResult> {
  if (!idSchema.safeParse(reportId).success)
    return { ok: false, message: "Id inválido." };
  if (!(await isAdmin())) return NOT_ALLOWED;
  const supabase = await createSessionClient();
  const { error } = await supabase
    .from("reports")
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", reportId);
  if (error) return { ok: false, message: "Não deu para resolver. Tente de novo." };
  return { ok: true };
}
