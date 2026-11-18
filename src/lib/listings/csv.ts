// Leitura e validação da planilha de imóveis (CSV) usada por scripts/import-listings.ts.
// Arquivo autossuficiente (sem aliases "@/"), porque o script roda direto no Node.
import { z } from "zod";

/** Colunas esperadas, na ordem do modelo em docs/imoveis-modelo.csv. */
export const CSV_COLUMNS = [
  "titulo",
  "preco",
  "quartos",
  "mobiliado",
  "link",
  "latitude",
  "longitude",
  "fonte",
  "cidade",
  "ativo",
  "exemplo",
] as const;

/** As outras colunas podem faltar ou ficar vazias. */
const REQUIRED_COLUMNS = ["titulo", "link", "latitude", "longitude"] as const;

/** Lê CSV com vírgula ou ponto e vírgula, aspas e quebras de linha dentro de aspas. */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, ""); // BOM do Excel
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (inQuotes) {
      if (c === '"' && clean[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && clean[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

const yesNo = (fallback: boolean | null) =>
  z
    .string()
    .trim()
    .toLowerCase()
    .transform((v, ctx) => {
      if (v === "") return fallback;
      if (["sim", "s", "1", "true"].includes(v)) return true;
      if (["não", "nao", "n", "0", "false"].includes(v)) return false;
      ctx.addIssue({ code: "custom", message: `use "sim" ou "não" (veio "${v}")` });
      return z.NEVER;
    });

const optionalInt = (label: string, max: number) =>
  z
    .string()
    .trim()
    .transform((v, ctx) => {
      if (v === "") return null;
      const n = Number(v.replace(/[R$\s.]/g, "").replace(",", "."));
      if (!Number.isInteger(n) || n < 0 || n > max) {
        ctx.addIssue({ code: "custom", message: `${label} inválido ("${v}")` });
        return z.NEVER;
      }
      return n;
    });

// Caixa que envolve o estado de SP: pega latitude/longitude trocadas ou digitadas errado.
const latitude = z.coerce.number().min(-25.4, "fora de SP").max(-19.7, "fora de SP");
const longitude = z.coerce.number().min(-53.2, "fora de SP").max(-44.1, "fora de SP");

export const listingRowSchema = z.object({
  titulo: z.string().trim().min(2, "título obrigatório").max(120, "título muito longo"),
  preco: optionalInt("preço", 50_000),
  quartos: optionalInt("quartos", 20),
  mobiliado: yesNo(null),
  link: z
    .string()
    .trim()
    .url("link inválido")
    .refine((u) => u.startsWith("https://"), "o link precisa começar com https://"),
  latitude,
  longitude,
  fonte: z
    .string()
    .trim()
    .max(60)
    .transform((v) => (v === "" ? null : v)),
  cidade: z
    .string()
    .trim()
    .toLowerCase()
    .transform((v) => (v === "" ? "sorocaba" : v)),
  ativo: yesNo(true),
  exemplo: yesNo(false),
});

export type ListingRow = z.output<typeof listingRowSchema>;

export type ParseResult = {
  rows: { line: number; data: ListingRow }[];
  errors: { line: number; message: string }[];
};

/** Valida a planilha inteira. `line` é a linha do arquivo (o cabeçalho é a linha 1). */
export function parseListingsCsv(text: string): ParseResult {
  const [header, ...body] = parseCsv(text);
  if (!header) return { rows: [], errors: [{ line: 1, message: "arquivo vazio" }] };

  const names = header.map((h) => h.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter((c) => !names.includes(c));
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [
        { line: 1, message: `faltam colunas obrigatórias: ${missing.join(", ")}` },
      ],
    };
  }

  const rows: ParseResult["rows"] = [];
  const errors: ParseResult["errors"] = [];
  const seenLinks = new Map<string, number>();

  body.forEach((cells, index) => {
    const line = index + 2;
    const record = Object.fromEntries(
      CSV_COLUMNS.map((c) => [c, cells[names.indexOf(c)] ?? ""]),
    );
    const parsed = listingRowSchema.safeParse(record);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push({ line, message: `${String(issue.path[0])}: ${issue.message}` });
      }
      return;
    }
    const previous = seenLinks.get(parsed.data.link);
    if (previous) {
      errors.push({ line, message: `link repetido (já aparece na linha ${previous})` });
      return;
    }
    seenLinks.set(parsed.data.link, line);
    rows.push({ line, data: parsed.data });
  });

  return { rows, errors };
}
