"use client";

import { List, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useOptimistic, useState, useSyncExternalStore, useTransition } from "react";
import { RepublicCard } from "@/components/republic/republic-card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RepublicResult } from "@/lib/data/republics";
import {
  DEFAULT_FILTERS,
  filtersToSearchParams,
  hasActiveFilters,
  RADIUS_OPTIONS_KM,
  type SearchFilters,
} from "@/lib/search/filters";
import { formatResultCount } from "@/lib/search/format";
import { cn } from "@/lib/utils";
import { ActiveFilterChips } from "./active-filter-chips";
import { EmptyState } from "./empty-state";
import { FilterControls } from "./filter-controls";

// O mapa é a parte mais pesada da página: só baixa no navegador, e só quando aparece.
const RepublicMap = dynamic(() => import("@/components/map/republic-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-2xl" />,
});

const DESKTOP_QUERY = "(min-width: 1024px)";

function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(DESKTOP_QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

type MobileTab = "lista" | "mapa";

type Props = {
  campus: { lat: number; lng: number; name: string; slug: string };
  filters: SearchFilters;
  republics: RepublicResult[];
};

export function SearchView({ campus, filters, republics }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const [isPending, startTransition] = useTransition();
  const [optimisticFilters, setOptimisticFilters] = useOptimistic(filters);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("lista");

  function applyFilters(next: SearchFilters) {
    const qs = filtersToSearchParams(next).toString();
    startTransition(() => {
      setOptimisticFilters(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  const nextRadius = RADIUS_OPTIONS_KM.find((km) => km > optimisticFilters.radiusKm);
  const activeCount = filtersToSearchParams(optimisticFilters).size;

  const summary = (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      <span className="font-semibold text-foreground">
        {formatResultCount(republics.length)}
      </span>{" "}
      até {filters.radiusKm} km da {campus.name}
    </p>
  );

  const list =
    republics.length === 0 ? (
      <EmptyState
        campusName={campus.name}
        canWiden={nextRadius !== undefined}
        hasFilters={hasActiveFilters(optimisticFilters)}
        onWiden={() =>
          nextRadius && applyFilters({ ...optimisticFilters, radiusKm: nextRadius })
        }
        onClear={() => applyFilters(DEFAULT_FILTERS)}
      />
    ) : (
      <ul
        className="grid grid-cols-[minmax(0,1fr)] gap-3"
        aria-label="Repúblicas encontradas"
      >
        {republics.map((r) => (
          <li key={r.id}>
            <RepublicCard
              republic={r}
              campusName={campus.name}
              campusSlug={campus.slug}
              highlighted={r.id === highlightedId}
              onHover={setHighlightedId}
            />
          </li>
        ))}
      </ul>
    );

  // Mapa só é montado quando aparece: sempre no desktop; no celular, só na aba "Mapa".
  const showMap = isDesktop || mobileTab === "mapa";

  // Os dois layouts (celular e desktop) são decididos por CSS, não por JavaScript:
  // assim o HTML do servidor já sai certo e nada "pula" depois que a página carrega.
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)] gap-4 transition-opacity",
        isPending && "opacity-60",
      )}
      aria-busy={isPending}
    >
      {/* Celular: abas Lista | Mapa + botão de filtros */}
      <div className="flex items-center gap-2 lg:hidden">
        <Tabs
          value={mobileTab}
          onValueChange={(v) => setMobileTab(v as MobileTab)}
          className="flex-1"
        >
          <TabsList className="h-10 w-full">
            <TabsTrigger value="lista" className="gap-1.5">
              <List aria-hidden />
              Lista
            </TabsTrigger>
            <TabsTrigger value="mapa" className="gap-1.5">
              <MapIcon aria-hidden />
              Mapa
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 gap-1.5 rounded-lg">
              <SlidersHorizontal aria-hidden />
              Filtros
              {activeCount > 0 ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeCount}
                </span>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>A lista atualiza na hora.</SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto px-4 pb-6">
              <FilterControls
                filters={optimisticFilters}
                onChange={applyFilters}
                layout="stack"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: barra de filtros */}
      <div className="hidden rounded-2xl border border-border bg-card p-4 lg:block">
        <FilterControls
          filters={optimisticFilters}
          onChange={applyFilters}
          layout="bar"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {summary}
        <ActiveFilterChips filters={optimisticFilters} onChange={applyFilters} />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className={cn("min-w-0", mobileTab === "mapa" && "hidden lg:block")}>
          {list}
        </div>
        <div
          className={cn(
            "h-[70dvh] min-h-80 rounded-2xl bg-muted/50 lg:sticky lg:top-4 lg:block lg:h-[calc(100dvh-2rem)] lg:max-h-[720px]",
            mobileTab === "lista" && "hidden",
          )}
        >
          {showMap ? (
            <RepublicMap
              campus={campus}
              republics={republics}
              highlightedId={highlightedId}
              onHighlight={setHighlightedId}
              cooperative={isDesktop}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
