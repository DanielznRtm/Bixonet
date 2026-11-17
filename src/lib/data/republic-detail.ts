import { cacheLife, cacheTag } from "next/cache";
import type { RepublicKind } from "@/lib/search/filters";
import { createPublicClient } from "@/lib/supabase/public";
import { retryOnTimeout } from "@/lib/supabase/retry";

export type RepublicDetail = {
  id: string;
  slug: string;
  name: string;
  kind: RepublicKind;
  neighborhood: string | null;
  lat: number;
  lng: number;
  description: string | null;
  priceMin: number | null;
  priceMax: number | null;
  openSpots: number;
  totalResidents: number | null;
  amenities: string[];
  houseRules: string | null;
  photos: string[];
  instagram: string | null;
  whatsapp: string | null;
  contactName: string | null;
  verified: boolean;
  isSample: boolean;
  city: { slug: string; name: string; state: string };
  updatedAt: string;
};

export type NearbyInstitution = {
  id: string;
  slug: string;
  name: string;
  acronym: string | null;
  citySlug: string;
  distanceM: number;
  declared: boolean;
};

/**
 * Página de uma república aprovada (null se não existir ou não estiver aprovada).
 * Tags: "republics" (qualquer moderação) e "republic:<slug>" (edição desta república).
 */
export async function getRepublic(slug: string): Promise<RepublicDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("republics", `republic:${slug}`);

  const supabase = createPublicClient();
  const { data, error } = await retryOnTimeout(() =>
    supabase.rpc("get_republic", { p_slug: slug }),
  );
  if (error) throw new Error(`Erro ao carregar a república: ${error.message}`);

  const r = data?.[0];
  if (!r) return null;

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    kind: r.kind,
    neighborhood: r.neighborhood ?? null,
    lat: r.lat,
    lng: r.lng,
    description: r.description ?? null,
    priceMin: r.price_min ?? null,
    priceMax: r.price_max ?? null,
    openSpots: r.open_spots,
    totalResidents: r.total_residents ?? null,
    amenities: r.amenities ?? [],
    houseRules: r.house_rules ?? null,
    photos: r.photos ?? [],
    instagram: r.instagram ?? null,
    whatsapp: r.whatsapp ?? null,
    contactName: r.contact_name ?? null,
    verified: r.verified,
    isSample: r.is_sample,
    city: { slug: r.city_slug, name: r.city_name, state: r.city_state },
    updatedAt: r.updated_at,
  };
}

/** Faculdades até 10 km da república, da mais perto para a mais longe. */
export async function getNearbyInstitutions(
  republicId: string,
  slug: string,
): Promise<NearbyInstitution[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("republics", `republic:${slug}`, "catalog");

  const { data, error } = await retryOnTimeout(() =>
    createPublicClient().rpc("republic_nearby_institutions", {
      p_republic_id: republicId,
    }),
  );
  if (error) throw new Error(`Erro ao carregar faculdades próximas: ${error.message}`);

  return (data ?? []).map((i) => ({
    id: i.institution_id,
    slug: i.slug,
    name: i.name,
    acronym: i.acronym ?? null,
    citySlug: i.city_slug,
    distanceM: i.distance_m,
    declared: i.declared,
  }));
}
