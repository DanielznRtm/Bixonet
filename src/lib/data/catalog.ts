import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { retryOnTimeout } from "@/lib/supabase/retry";

// Cidades e instituições quase não mudam: cache de horas.
// Mudou algo no admin? revalidateTag("catalog") (Fase 5).

export type City = { id: string; slug: string; name: string; state: string };

export type Institution = {
  id: string;
  slug: string;
  name: string;
  acronym: string | null;
  campusName: string | null;
  website: string | null;
  housingContactUrl: string | null;
  housingContactEmail: string | null;
  housingContactPhone: string | null;
  hasOwnHousing: boolean;
  housingNotes: string | null;
  lat: number;
  lng: number;
  city: City;
};

/** Nome curto para títulos e textos: "Unesp", "UFSCar". */
export function institutionShortName(i: Pick<Institution, "acronym" | "name">) {
  return i.acronym ?? i.name;
}

type DirectoryRow = {
  id: string | null;
  slug: string | null;
  name: string | null;
  acronym: string | null;
  campus_name: string | null;
  website: string | null;
  housing_contact_url: string | null;
  housing_contact_email: string | null;
  housing_contact_phone: string | null;
  has_own_housing: boolean | null;
  housing_notes: string | null;
  lat: number | null;
  lng: number | null;
  city_id: string | null;
  city_slug: string | null;
  city_name: string | null;
  city_state: string | null;
};

function toInstitution(row: DirectoryRow): Institution {
  return {
    id: row.id!,
    slug: row.slug!,
    name: row.name!,
    acronym: row.acronym,
    campusName: row.campus_name,
    website: row.website,
    housingContactUrl: row.housing_contact_url,
    housingContactEmail: row.housing_contact_email,
    housingContactPhone: row.housing_contact_phone,
    hasOwnHousing: row.has_own_housing ?? false,
    housingNotes: row.housing_notes,
    lat: row.lat!,
    lng: row.lng!,
    city: {
      id: row.city_id!,
      slug: row.city_slug!,
      name: row.city_name!,
      state: row.city_state!,
    },
  };
}

/** Todas as instituições, ordenadas por cidade e sigla (para o autocomplete da home). */
export async function getAllInstitutions(): Promise<Institution[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data, error } = await retryOnTimeout(() =>
    createPublicClient()
      .from("institution_directory")
      .select("*")
      .order("city_name")
      .order("acronym"),
  );
  if (error || !data) throw new Error(`Erro ao carregar instituições: ${error?.message}`);
  return data.map(toInstitution);
}

export async function getCities(): Promise<City[]> {
  const institutions = await getAllInstitutions();
  const bySlug = new Map(institutions.map((i) => [i.city.slug, i.city]));
  return [...bySlug.values()];
}

export async function getCity(citySlug: string): Promise<City | null> {
  return (await getCities()).find((c) => c.slug === citySlug) ?? null;
}

export async function getInstitutionsByCity(citySlug: string): Promise<Institution[]> {
  return (await getAllInstitutions()).filter((i) => i.city.slug === citySlug);
}

export async function getInstitution(
  citySlug: string,
  institutionSlug: string,
): Promise<Institution | null> {
  return (
    (await getAllInstitutions()).find(
      (i) => i.city.slug === citySlug && i.slug === institutionSlug,
    ) ?? null
  );
}
