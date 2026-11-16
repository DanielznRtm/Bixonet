"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  KIND_PARAM,
  type KindParam,
  PRICE_OPTIONS,
  RADIUS_OPTIONS_KM,
  type SearchFilters,
} from "@/lib/search/filters";
import { KIND_LABEL } from "@/lib/search/format";
import { cn } from "@/lib/utils";

type Props = {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
  layout: "bar" | "stack";
};

const NO_LIMIT = "sem-limite";

export function FilterControls({ filters, onChange, layout }: Props) {
  const set = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch });
  const customPrice =
    filters.maxPrice !== null &&
    !(PRICE_OPTIONS as readonly number[]).includes(filters.maxPrice);

  return (
    <div
      className={cn(
        "grid gap-5",
        layout === "bar" && "grid-cols-[auto_auto_auto_1fr] items-end gap-4",
      )}
    >
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-semibold">Tipo</legend>
        <ToggleGroup
          type="single"
          variant="outline"
          value={filters.kind ?? "todas"}
          onValueChange={(v) => {
            if (!v) return;
            set({ kind: v === "todas" ? null : (v as KindParam) });
          }}
          className="flex-wrap"
        >
          <ToggleGroupItem value="todas" className="px-3">
            Todas
          </ToggleGroupItem>
          {(Object.keys(KIND_PARAM) as KindParam[]).map((k) => (
            <ToggleGroupItem key={k} value={k} className="px-3">
              {KIND_LABEL[KIND_PARAM[k]]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor={`preco-${layout}`} className="text-sm font-semibold">
          Preço até
        </Label>
        <Select
          value={filters.maxPrice === null ? NO_LIMIT : String(filters.maxPrice)}
          onValueChange={(v) => set({ maxPrice: v === NO_LIMIT ? null : Number(v) })}
        >
          <SelectTrigger id={`preco-${layout}`} className="h-9 w-full min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_LIMIT}>Sem limite</SelectItem>
            {PRICE_OPTIONS.map((p) => (
              <SelectItem key={p} value={String(p)}>
                R$ {p.toLocaleString("pt-BR")}
              </SelectItem>
            ))}
            {customPrice ? (
              <SelectItem value={String(filters.maxPrice)}>
                R$ {filters.maxPrice!.toLocaleString("pt-BR")}
              </SelectItem>
            ) : null}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`raio-${layout}`} className="text-sm font-semibold">
          Distância do campus
        </Label>
        <Select
          value={String(filters.radiusKm)}
          onValueChange={(v) => set({ radiusKm: Number(v) as SearchFilters["radiusKm"] })}
        >
          <SelectTrigger id={`raio-${layout}`} className="h-9 w-full min-w-32">
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
          id={`vaga-${layout}`}
          checked={filters.onlyOpen}
          onCheckedChange={(checked) => set({ onlyOpen: checked })}
        />
        <Label htmlFor={`vaga-${layout}`} className="text-sm font-semibold">
          Só com vaga
        </Label>
      </div>
    </div>
  );
}
