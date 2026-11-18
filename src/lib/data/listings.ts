import { cacheLife, cacheTag } from "next/cache";
import { type ListingFilters, listingFiltersToRpcArgs } from "@/lib/listings/filters";
import { createPublicClient } from "@/lib/supabase/public";
import { retryOnTimeout } from "@/lib/supabase/retry";

export type ListingResult = {
  id: string;
  title: string;
  price: number | null;
  bedrooms: number | null;
  furnished: boolean | null;
  externalUrl: string;
  source: string | null;
  isSample: boolean;
  distanceM: number;
};

/** Imóveis ativos perto de uma instituição. Tag "listings" para invalidar ao importar/editar. */
export async function searchListings(
  institutionId: string,
  filters: ListingFilters,
): Promise<ListingResult[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings");

  const args = listingFiltersToRpcArgs(institutionId, filters);
  const { data, error } = await retryOnTimeout(() =>
    createPublicClient().rpc("search_listings", args),
  );
  if (error || !data) throw new Error(`Erro na busca de imóveis: ${error?.message}`);

  return data.map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price ?? null,
    bedrooms: l.bedrooms ?? null,
    furnished: l.furnished ?? null,
    externalUrl: l.external_url,
    source: l.source ?? null,
    isSample: l.is_sample,
    distanceM: l.distance_m,
  }));
}
