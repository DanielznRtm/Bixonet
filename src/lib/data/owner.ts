import "server-only";
import type { WizardInstitution } from "@/components/registration/registration-wizard";
import { getAllInstitutions, institutionShortName } from "@/lib/data/catalog";
import { parsePointEwkb } from "@/lib/geo";
import type { RegistrationInput } from "@/lib/registration/schema";
import type { RepublicKind } from "@/lib/search/filters";
import { createSessionClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type RepublicStatus = Database["public"]["Enums"]["republic_status"];

export type MyRepublic = {
  id: string;
  slug: string;
  name: string;
  kind: RepublicKind;
  status: RepublicStatus;
  moderationNote: string | null;
  neighborhood: string | null;
  coverPhoto: string | null;
  updatedAt: string;
};

/** Repúblicas do usuário logado (o RLS já filtra pelo dono). Lê cookies: use em <Suspense>. */
export async function listMyRepublics(): Promise<MyRepublic[]> {
  const supabase = await createSessionClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return [];

  const { data, error } = await supabase
    .from("republics")
    .select(
      "id, slug, name, kind, status, moderation_note, neighborhood, photos, updated_at",
    )
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Erro ao carregar suas repúblicas: ${error.message}`);

  return data.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    kind: r.kind,
    status: r.status,
    moderationNote: r.moderation_note,
    neighborhood: r.neighborhood,
    coverPhoto: r.photos[0] ?? null,
    updatedAt: r.updated_at,
  }));
}

/** Dados de uma república do dono, no formato do formulário (null se não for dele). */
export async function getMyRepublicForEdit(
  id: string,
): Promise<{ values: RegistrationInput; status: RepublicStatus; slug: string } | null> {
  const supabase = await createSessionClient();
  const { data: r } = await supabase
    .from("republics")
    .select("*, cities(slug), republic_institutions(institution_id)")
    .eq("id", id)
    .maybeSingle();
  if (!r) return null;

  const point = parsePointEwkb(String(r.approx_location));
  const phone = r.whatsapp ? `(${r.whatsapp.slice(2, 4)}) ${r.whatsapp.slice(4)}` : "";

  return {
    status: r.status,
    slug: r.slug,
    values: {
      name: r.name,
      kind: r.kind,
      totalResidents: r.total_residents,
      openSpots: r.open_spots,
      priceMin: r.price_min,
      priceMax: r.price_max,
      citySlug: r.cities?.slug ?? "sorocaba",
      neighborhood: r.neighborhood ?? "",
      lat: point?.lat as number,
      lng: point?.lng as number,
      institutionIds: r.republic_institutions.map((ri) => ri.institution_id),
      description: r.description ?? "",
      houseRules: r.house_rules ?? "",
      amenities: r.amenities,
      photos: r.photos,
      contactName: r.contact_name ?? "",
      whatsapp: phone,
      instagram: r.instagram ? `@${r.instagram}` : "",
      // O dono reconfirma o consentimento a cada edição.
      consentResident: false as unknown as true,
      consentPublic: false as unknown as true,
    },
  };
}

/** Cidades (com um centro aproximado) e faculdades para o formulário. */
export async function getWizardOptions(): Promise<{
  cities: { slug: string; name: string; lat: number; lng: number }[];
  institutions: WizardInstitution[];
}> {
  const all = await getAllInstitutions();
  const byCity = new Map<string, { name: string; lats: number[]; lngs: number[] }>();
  for (const i of all) {
    const c = byCity.get(i.city.slug) ?? { name: i.city.name, lats: [], lngs: [] };
    c.lats.push(i.lat);
    c.lngs.push(i.lng);
    byCity.set(i.city.slug, c);
  }
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

  return {
    cities: [...byCity.entries()].map(([slug, c]) => ({
      slug,
      name: c.name,
      lat: avg(c.lats),
      lng: avg(c.lngs),
    })),
    institutions: all.map((i) => ({
      id: i.id,
      citySlug: i.city.slug,
      name: institutionShortName(i),
      lat: i.lat,
      lng: i.lng,
    })),
  };
}
