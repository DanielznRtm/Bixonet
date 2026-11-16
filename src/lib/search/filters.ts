import { z } from "zod";
import type { Database } from "@/types/database";

export type RepublicKind = Database["public"]["Enums"]["republic_kind"];

/** Valores do parâmetro `tipo` na URL (em português) → enum do banco. */
export const KIND_PARAM = {
  masculina: "male",
  feminina: "female",
  mista: "mixed",
} as const satisfies Record<string, RepublicKind>;

export type KindParam = keyof typeof KIND_PARAM;

export const RADIUS_OPTIONS_KM = [1, 2, 5, 10] as const;
export const PRICE_OPTIONS = [500, 700, 900, 1200] as const;
export const DEFAULT_RADIUS_KM = 5;

export type SearchFilters = {
  kind: KindParam | null;
  maxPrice: number | null;
  onlyOpen: boolean;
  radiusKm: (typeof RADIUS_OPTIONS_KM)[number];
};

export const DEFAULT_FILTERS: SearchFilters = {
  kind: null,
  maxPrice: null,
  onlyOpen: false,
  radiusKm: DEFAULT_RADIUS_KM,
};

// Cada campo é validado sozinho: um valor inválido vira o padrão, sem quebrar os outros.
const kindSchema = z.enum(Object.keys(KIND_PARAM) as [KindParam, ...KindParam[]]);
const priceSchema = z.coerce.number().int().min(100).max(10_000);
const radiusSchema = z.coerce
  .number()
  .refine((n): n is SearchFilters["radiusKm"] =>
    (RADIUS_OPTIONS_KM as readonly number[]).includes(n),
  );

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Lê os filtros da URL (`?tipo=feminina&ate=700&vaga=1&raio=2`). */
export function parseFilters(params: RawParams): SearchFilters {
  const kind = kindSchema.safeParse(first(params.tipo));
  const price = priceSchema.safeParse(first(params.ate));
  const radius = radiusSchema.safeParse(first(params.raio));

  return {
    kind: kind.success ? kind.data : null,
    maxPrice: price.success ? price.data : null,
    onlyOpen: first(params.vaga) === "1",
    radiusKm: radius.success
      ? (radius.data as SearchFilters["radiusKm"])
      : DEFAULT_RADIUS_KM,
  };
}

/** Escreve os filtros na URL, omitindo o que está no padrão (links curtos). */
export function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.kind) params.set("tipo", filters.kind);
  if (filters.maxPrice !== null) params.set("ate", String(filters.maxPrice));
  if (filters.onlyOpen) params.set("vaga", "1");
  if (filters.radiusKm !== DEFAULT_RADIUS_KM)
    params.set("raio", String(filters.radiusKm));
  return params;
}

/** Converte para os argumentos da RPC `search_republics`. */
export function filtersToRpcArgs(institutionId: string, filters: SearchFilters) {
  return {
    p_institution_id: institutionId,
    p_max_distance_m: filters.radiusKm * 1000,
    p_kind: filters.kind ? KIND_PARAM[filters.kind] : undefined,
    p_max_price: filters.maxPrice ?? undefined,
    p_only_open: filters.onlyOpen,
  };
}

export function hasActiveFilters(filters: SearchFilters) {
  return filtersToSearchParams(filters).size > 0;
}
