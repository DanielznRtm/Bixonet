"use client";

import { X } from "lucide-react";
import { DEFAULT_FILTERS, KIND_PARAM, type SearchFilters } from "@/lib/search/filters";
import { KIND_LABEL } from "@/lib/search/format";

type Props = { filters: SearchFilters; onChange: (next: SearchFilters) => void };

export function ActiveFilterChips({ filters, onChange }: Props) {
  const chips: { label: string; reset: Partial<SearchFilters> }[] = [];
  if (filters.kind) {
    chips.push({ label: KIND_LABEL[KIND_PARAM[filters.kind]], reset: { kind: null } });
  }
  if (filters.maxPrice !== null) {
    chips.push({
      label: `Até R$ ${filters.maxPrice.toLocaleString("pt-BR")}`,
      reset: { maxPrice: null },
    });
  }
  if (filters.onlyOpen) chips.push({ label: "Só com vaga", reset: { onlyOpen: false } });
  if (filters.radiusKm !== DEFAULT_FILTERS.radiusKm) {
    chips.push({
      label: `Até ${filters.radiusKm} km`,
      reset: { radiusKm: DEFAULT_FILTERS.radiusKm },
    });
  }

  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Filtros ativos">
      {chips.map((chip) => (
        <li key={chip.label}>
          <button
            type="button"
            onClick={() => onChange({ ...filters, ...chip.reset })}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-secondary pr-2 pl-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
          >
            {chip.label}
            <X aria-hidden className="size-3.5" />
            <span className="sr-only">(remover filtro)</span>
          </button>
        </li>
      ))}
      {chips.length > 1 ? (
        <li>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="inline-flex h-8 items-center px-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Limpar tudo
          </button>
        </li>
      ) : null}
    </ul>
  );
}
