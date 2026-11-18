import { z } from "zod";
import { DEFAULT_RADIUS_KM, RADIUS_OPTIONS_KM } from "@/lib/search/filters";

export const LISTING_PRICE_OPTIONS = [800, 1000, 1500, 2000] as const;

export type ListingFilters = {
  maxPrice: number | null;
  onlyFurnished: boolean;
  radiusKm: (typeof RADIUS_OPTIONS_KM)[number];
};

export const DEFAULT_LISTING_FILTERS: ListingFilters = {
  maxPrice: null,
  onlyFurnished: false,
  radiusKm: DEFAULT_RADIUS_KM,
};

const priceSchema = z.coerce.number().int().min(100).max(20_000);
const radiusSchema = z.coerce
  .number()
  .refine((n) => (RADIUS_OPTIONS_KM as readonly number[]).includes(n));

type RawParams = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Lê os filtros da URL (`?ate=1000&mobiliado=1&raio=2`); valor inválido vira o padrão. */
export function parseListingFilters(params: RawParams): ListingFilters {
  const price = priceSchema.safeParse(first(params.ate));
  const radius = radiusSchema.safeParse(first(params.raio));
  return {
    maxPrice: price.success ? price.data : null,
    onlyFurnished: first(params.mobiliado) === "1",
    radiusKm: radius.success
      ? (radius.data as ListingFilters["radiusKm"])
      : DEFAULT_RADIUS_KM,
  };
}

export function listingFiltersToSearchParams(f: ListingFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.maxPrice !== null) params.set("ate", String(f.maxPrice));
  if (f.onlyFurnished) params.set("mobiliado", "1");
  if (f.radiusKm !== DEFAULT_RADIUS_KM) params.set("raio", String(f.radiusKm));
  return params;
}

export function listingFiltersToRpcArgs(institutionId: string, f: ListingFilters) {
  return {
    p_institution_id: institutionId,
    p_max_distance_m: f.radiusKm * 1000,
    p_max_price: f.maxPrice ?? undefined,
    p_only_furnished: f.onlyFurnished,
  };
}
