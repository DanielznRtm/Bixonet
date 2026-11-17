import { z } from "zod";
import type { Database } from "@/types/database";

export type ReportReason = Database["public"]["Enums"]["report_reason"];

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "wrong_info", label: "Informação errada (preço, vagas, tipo…)" },
  { value: "closed", label: "A república não existe mais" },
  { value: "no_consent", label: "Foi cadastrada sem autorização dos moradores" },
  { value: "removal_request", label: "Moro lá e quero tirar a república do site" },
  { value: "other", label: "Outro motivo" },
];

export const reportSchema = z.object({
  republicId: z.uuid(),
  reason: z.enum(
    REPORT_REASONS.map((r) => r.value) as [ReportReason, ...ReportReason[]],
    {
      error: "Escolha um motivo.",
    },
  ),
  message: z
    .string()
    .trim()
    .max(1000, "A mensagem pode ter até 1000 caracteres.")
    .optional()
    .transform((m) => (m ? m : undefined)),
  // Campo-isca: invisível para pessoas; robôs costumam preencher.
  website: z.string().max(0).optional(),
});

export type ReportState =
  { status: "idle" } | { status: "ok" } | { status: "error"; message: string };
