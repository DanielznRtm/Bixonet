"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { ListingResult } from "@/lib/data/listings";
import {
  DEFAULT_LISTING_FILTERS,
  LISTING_PRICE_OPTIONS,
  type ListingFilters,
  listingFiltersToSearchParams,
} from "@/lib/listings/filters";
import { formatListingCount } from "@/lib/listings/format";
import { RADIUS_OPTIONS_KM } from "@/lib/search/filters";
import { cn } from "@/lib/utils";
import { ListingCard } from "./listing-card";

const NO_LIMIT = "sem-limite";

type Props = {
  campus: { name: string; republicsHref: string };
  filters: ListingFilters;
  listings: ListingResult[];
};

export function ListingsView({ campus, filters, listings }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(filters);

  function apply(next: ListingFilters) {
    const qs = listingFiltersToSearchParams(next).toString();
    startTransition(() => {
      setOptimistic(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }
  const set = (patch: Partial<ListingFilters>) => apply({ ...optimistic, ...patch });
  const hasFilters = listingFiltersToSearchParams(optimistic).size > 0;

  return (
    <div
      className={cn("grid gap-4 transition-opacity", isPending && "opacity-60")}
      aria-busy={isPending}
    >
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[auto_auto_1fr] sm:items-end">
        <div className="grid gap-2">
          <Label htmlFor="imovel-preco" className="text-sm font-semibold">
            Aluguel até
          </Label>
          <Select
            value={optimistic.maxPrice === null ? NO_LIMIT : String(optimistic.maxPrice)}
            onValueChange={(v) => set({ maxPrice: v === NO_LIMIT ? null : Number(v) })}
          >
            <SelectTrigger id="imovel-preco" className="h-9 w-full min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_LIMIT}>Sem limite</SelectItem>
              {LISTING_PRICE_OPTIONS.map((p) => (
                <SelectItem key={p} value={String(p)}>
                  R$ {p.toLocaleString("pt-BR")}
                </SelectItem>
              ))}
              {optimistic.maxPrice !== null &&
              !(LISTING_PRICE_OPTIONS as readonly number[]).includes(
                optimistic.maxPrice,
              ) ? (
                <SelectItem value={String(optimistic.maxPrice)}>
                  R$ {optimistic.maxPrice.toLocaleString("pt-BR")}
                </SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="imovel-raio" className="text-sm font-semibold">
            Distância do campus
          </Label>
          <Select
            value={String(optimistic.radiusKm)}
            onValueChange={(v) =>
              set({ radiusKm: Number(v) as ListingFilters["radiusKm"] })
            }
          >
            <SelectTrigger id="imovel-raio" className="h-9 w-full min-w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RADIUS_OPTIONS_KM.map((km) => (
                <SelectItem key={km} value={String(km)}>
                  Até {km} km
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex h-9 items-center gap-2">
          <Switch
            id="imovel-mobiliado"
            checked={optimistic.onlyFurnished}
            onCheckedChange={(checked) => set({ onlyFurnished: checked })}
          />
          <Label htmlFor="imovel-mobiliado" className="text-sm font-semibold">
            Só mobiliados
          </Label>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        <span className="font-semibold text-foreground">
          {formatListingCount(listings.length)}
        </span>{" "}
        até {filters.radiusKm} km da {campus.name}
      </p>

      {listings.length === 0 ? (
        <div
          data-testid="listings-empty"
          className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border bg-card p-6"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <SearchX aria-hidden className="size-6" />
          </span>
          <div className="grid gap-1">
            <h3 className="text-lg font-semibold">
              {hasFilters
                ? "Nenhum imóvel com esses filtros"
                : `Ainda não temos imóveis perto da ${campus.name}`}
            </h3>
            <p className="text-muted-foreground">
              {hasFilters
                ? "Tente aumentar a distância ou tirar algum filtro."
                : "Enquanto isso, vale olhar as repúblicas da região."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {hasFilters ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => apply(DEFAULT_LISTING_FILTERS)}
              >
                Limpar filtros
              </Button>
            ) : null}
            <Button asChild className="rounded-full">
              <Link href={campus.republicsHref}>Ver repúblicas</Link>
            </Button>
          </div>
        </div>
      ) : (
        <ul
          className="grid grid-cols-[minmax(0,1fr)] gap-3"
          aria-label="Imóveis encontrados"
        >
          {listings.map((l) => (
            <li key={l.id}>
              <ListingCard listing={l} campusName={campus.name} />
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Os anúncios abrem em outros sites. O bixo.net não intermedia aluguel nem recebe
        pagamentos.
      </p>
    </div>
  );
}
