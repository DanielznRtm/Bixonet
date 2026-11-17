import { cacheLife, cacheTag } from "next/cache";
import {
  filtersToRpcArgs,
  type RepublicKind,
  type SearchFilters,
} from "@/lib/search/filters";
import { createPublicClient } from "@/lib/supabase/public";
import { retryOnTimeout } from "@/lib/supabase/retry";

/**
 * Resultado da busca. Os tipos gerados dizem que tudo vem preenchido, mas bairro,
 * preços e foto podem ser null no banco; aqui isso fica explícito.
 */
export type RepublicResult = {
  id: string;
  slug: string;
  name: string;
  kind: RepublicKind;
  neighborhood: string | null;
  lat: number;
  lng: number;
  priceMin: number | null;
  priceMax: number | null;
  openSpots: number;
  verified: boolean;
  isSample: boolean;
  coverPhoto: string | null;
  distanceM: number;
};

/**
 * Busca repúblicas aprovadas perto de uma instituição.
 * Cache curto por combinação de filtros; aprovar uma república chama
 * revalidateTag("republics") (Fase 5) e a lista atualiza na hora.
 */
export async function searchRepublics(
  institutionId: string,
  filters: SearchFilters,
): Promise<RepublicResult[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("republics");

  const supabase = createPublicClient();
  const args = filtersToRpcArgs(institutionId, filters);

  const { data, error } = await retryOnTimeout(() =>
    supabase.rpc("search_republics", args),
  );
  if (error || !data) throw new Error(`Erro na busca de repúblicas: ${error?.message}`);

  return data.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    kind: r.kind,
    neighborhood: r.neighborhood ?? null,
    lat: r.lat,
    lng: r.lng,
    priceMin: r.price_min ?? null,
    priceMax: r.price_max ?? null,
    openSpots: r.open_spots,
    verified: r.verified,
    isSample: r.is_sample,
    coverPhoto: r.cover_photo ?? null,
    distanceM: r.distance_m,
  }));
}
