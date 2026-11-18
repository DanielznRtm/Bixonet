"use server";

import { updateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { createSessionClient } from "@/lib/supabase/server";
import { normalizeInstagram, normalizeWhatsapp } from "./phone";
import {
  type RegistrationData,
  type RegistrationInput,
  registrationSchema,
} from "./schema";
import { republicSlug } from "./slug";

export type SaveResult =
  { ok: true; id: string; slug: string } | { ok: false; message: string };

const GENERIC_ERROR = "Não deu para salvar agora. Tente de novo em instantes.";

/** Erros que o próprio banco explica em português (limite de 3, foto fora da pasta…). */
function friendlyDbError(error: { code?: string; message: string }): string {
  if (error.code === "23514" || error.code === "42501") return error.message;
  console.error("Erro ao salvar república:", error.code, error.message);
  return GENERIC_ERROR;
}

function toRow(d: RegistrationData) {
  return {
    name: d.name,
    kind: d.kind,
    total_residents: d.totalResidents,
    open_spots: d.openSpots,
    price_min: d.priceMin,
    price_max: d.priceMax,
    neighborhood: d.neighborhood,
    // EWKT: o Postgres converte para geography e a trigger arredonda para ~100 m.
    approx_location: `SRID=4326;POINT(${d.lng} ${d.lat})`,
    description: d.description,
    house_rules: d.houseRules || null,
    amenities: d.amenities,
    photos: d.photos,
    contact_name: d.contactName,
    whatsapp: normalizeWhatsapp(d.whatsapp),
    instagram: d.instagram.trim() ? normalizeInstagram(d.instagram) : null,
  };
}

async function resolveCityId(
  supabase: Awaited<ReturnType<typeof createSessionClient>>,
  slug: string,
) {
  const { data } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return data?.id ?? null;
}

async function replaceInstitutions(
  supabase: Awaited<ReturnType<typeof createSessionClient>>,
  republicId: string,
  institutionIds: string[],
) {
  await supabase.from("republic_institutions").delete().eq("republic_id", republicId);
  if (institutionIds.length === 0) return null;
  const { error } = await supabase
    .from("republic_institutions")
    .insert(
      institutionIds.map((id) => ({ republic_id: republicId, institution_id: id })),
    );
  return error;
}

/** Cadastro novo: entra como "Em análise" e só aparece no site depois de aprovado. */
export async function createRepublic(input: RegistrationInput): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user)
    return { ok: false, message: "Sua sessão expirou. Entre de novo para enviar." };

  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const data = parsed.data;

  const supabase = await createSessionClient();
  const cityId = await resolveCityId(supabase, data.citySlug);
  if (!cityId) return { ok: false, message: "Cidade não encontrada." };

  // O slug tem um sufixo aleatório; em caso (raro) de repetição, tenta de novo.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: row, error } = await supabase
      .from("republics")
      .insert({
        ...toRow(data),
        slug: republicSlug(data.name),
        city_id: cityId,
        owner_user_id: user.id,
        status: "pending",
        consent_at: new Date().toISOString(),
      })
      .select("id, slug")
      .single();

    if (error?.code === "23505") continue;
    if (error || !row)
      return { ok: false, message: friendlyDbError(error ?? { message: "" }) };

    const instError = await replaceInstitutions(supabase, row.id, data.institutionIds);
    if (instError)
      console.error("Erro ao salvar faculdades da república:", instError.message);
    return { ok: true, id: row.id, slug: row.slug };
  }
  return { ok: false, message: GENERIC_ERROR };
}

/**
 * Edição pelo dono. Publicada: a mudança vale na hora (e aparece em "Alterações recentes" no
 * admin). Recusada: volta para análise.
 */
export async function updateRepublic(
  id: string,
  input: RegistrationInput,
): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user)
    return { ok: false, message: "Sua sessão expirou. Entre de novo para salvar." };

  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const data = parsed.data;

  const supabase = await createSessionClient();
  const { data: current } = await supabase
    .from("republics")
    .select("id, slug, status")
    .eq("id", id)
    .maybeSingle();
  if (!current) return { ok: false, message: "República não encontrada." };

  const cityId = await resolveCityId(supabase, data.citySlug);
  if (!cityId) return { ok: false, message: "Cidade não encontrada." };

  const { error } = await supabase
    .from("republics")
    .update({
      ...toRow(data),
      city_id: cityId,
      consent_at: new Date().toISOString(),
      ...(current.status === "rejected" ? { status: "pending" as const } : {}),
    })
    .eq("id", id);
  if (error) return { ok: false, message: friendlyDbError(error) };

  const instError = await replaceInstitutions(supabase, id, data.institutionIds);
  if (instError)
    console.error("Erro ao salvar faculdades da república:", instError.message);

  updateTag("republics");
  updateTag(`republic:${current.slug}`);
  return { ok: true, id, slug: current.slug };
}

/** "Tirar do ar" (pedido de remoção da LGPD) ou "Reenviar para análise". */
export async function setOwnRepublicStatus(
  id: string,
  status: "archived" | "pending",
): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sua sessão expirou. Entre de novo." };

  const supabase = await createSessionClient();
  const { data: row, error } = await supabase
    .from("republics")
    .update({ status })
    .eq("id", id)
    .select("id, slug")
    .maybeSingle();
  if (error) return { ok: false, message: friendlyDbError(error) };
  if (!row) return { ok: false, message: "República não encontrada." };

  updateTag("republics");
  updateTag(`republic:${row.slug}`);
  return { ok: true, id: row.id, slug: row.slug };
}
