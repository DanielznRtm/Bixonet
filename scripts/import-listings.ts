// Importa imóveis (kitnets/apartamentos) de uma planilha CSV para o banco.
//
//   npm run import:listings -- caminho/para/imoveis.csv            (grava)
//   npm run import:listings -- caminho/para/imoveis.csv --dry-run  (só valida)
//
// Modelo de planilha: docs/imoveis-modelo.csv. Idempotente: o link do anúncio identifica o
// imóvel, então rodar de novo atualiza em vez de duplicar. Usa a chave SECRETA do Supabase
// (SUPABASE_SECRET_KEY no .env.local), que só deve existir na sua máquina.
//
// Sem scraping: a planilha é preenchida à mão ou com dados de parceiros.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.ts";
import { parseListingsCsv } from "../src/lib/listings/csv.ts";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");

if (!file) {
  console.error("Uso: npm run import:listings -- <arquivo.csv> [--dry-run]");
  process.exit(1);
}

const { rows, errors } = parseListingsCsv(readFileSync(file, "utf8"));

if (errors.length > 0) {
  console.error(`\n${errors.length} problema(s) na planilha. Nada foi gravado.\n`);
  for (const e of errors) console.error(`  linha ${e.line}: ${e.message}`);
  process.exit(1);
}

console.log(`${rows.length} imóvel(is) válido(s).`);
if (dryRun) {
  console.log("--dry-run: nada foi gravado.");
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SECRET_KEY no .env.local.",
  );
  process.exit(1);
}

const supabase = createClient<Database>(url, secret, { auth: { persistSession: false } });

// Resolve o slug da cidade para o id.
const citySlugs = [...new Set(rows.map((r) => r.data.cidade))];
const { data: cities, error: cityError } = await supabase
  .from("cities")
  .select("id, slug")
  .in("slug", citySlugs);
if (cityError) {
  console.error("Erro ao ler cidades:", cityError.message);
  process.exit(1);
}
const cityId = new Map((cities ?? []).map((c) => [c.slug, c.id]));
const unknown = citySlugs.filter((s) => !cityId.has(s));
if (unknown.length > 0) {
  console.error(`Cidade(s) não cadastrada(s): ${unknown.join(", ")}. Nada foi gravado.`);
  process.exit(1);
}

const payload = rows.map(({ data: r }) => ({
  title: r.titulo,
  price: r.preco,
  bedrooms: r.quartos,
  furnished: r.mobiliado,
  external_url: r.link,
  // EWKT: o Postgres converte o texto para geography (e a trigger arredonda para ~100 m).
  approx_location: `SRID=4326;POINT(${r.longitude} ${r.latitude})`,
  source: r.fonte,
  city_id: cityId.get(r.cidade)!,
  status: r.ativo === false ? ("inactive" as const) : ("active" as const),
  is_sample: r.exemplo ?? false,
}));

const { error } = await supabase
  .from("listings")
  .upsert(payload, { onConflict: "external_url" });
if (error) {
  console.error("Erro ao gravar:", error.message);
  process.exit(1);
}

console.log(`Pronto: ${payload.length} imóvel(is) gravado(s) ou atualizado(s).`);
console.log("O site mostra as mudanças em alguns minutos (cache da busca).");
