"use client";

import { Check, ChevronsUpDown, GraduationCap, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { matchesInstitution } from "@/lib/search/text";
import { cn } from "@/lib/utils";

export type PickerCity = { slug: string; name: string; state: string };
export type PickerInstitution = {
  slug: string;
  citySlug: string;
  name: string;
  acronym: string | null;
  campusName: string | null;
};

type Props = {
  cities: PickerCity[];
  institutions: PickerInstitution[];
};

export function InstitutionPicker({ cities, institutions }: Props) {
  const router = useRouter();
  const cityLabelId = useId();
  const institutionLabelId = useId();

  const [citySlug, setCitySlug] = useState(cities.length === 1 ? cities[0].slug : "");
  const [institutionSlug, setInstitutionSlug] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const cityInstitutions = useMemo(
    () => institutions.filter((i) => i.citySlug === citySlug),
    [institutions, citySlug],
  );
  const filtered = cityInstitutions.filter((i) => matchesInstitution(query, i));
  const selected = cityInstitutions.find((i) => i.slug === institutionSlug);

  function go(slug = institutionSlug) {
    if (!citySlug || !slug) return;
    router.push(`/${citySlug}/${slug}`);
  }

  return (
    <form
      className="grid gap-4 rounded-3xl border border-border/70 bg-card p-4 shadow-[0_8px_30px_-12px_oklch(0.4_0.08_45/0.25)] sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
    >
      <div className="grid gap-2">
        <Label id={cityLabelId} className="text-sm font-semibold">
          Cidade
        </Label>
        <Select
          value={citySlug}
          onValueChange={(v) => {
            setCitySlug(v);
            setInstitutionSlug("");
          }}
        >
          <SelectTrigger
            aria-labelledby={cityLabelId}
            className="h-12 w-full rounded-xl text-base data-[size=default]:h-12"
          >
            <MapPin aria-hidden className="text-muted-foreground" />
            <span className="flex-1 text-left">
              <SelectValue placeholder="Escolha a cidade" />
            </span>
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name} ({c.state})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label id={institutionLabelId} className="text-sm font-semibold">
          Faculdade
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-labelledby={institutionLabelId}
              disabled={!citySlug}
              className="h-12 w-full justify-start gap-2 rounded-xl px-3 text-base font-normal"
            >
              <GraduationCap aria-hidden className="text-muted-foreground" />
              <span className={cn("truncate", !selected && "text-muted-foreground")}>
                {selected
                  ? `${selected.acronym ?? selected.name}${selected.campusName ? ` — ${selected.campusName}` : ""}`
                  : "Digite a sigla ou o nome"}
              </span>
              <ChevronsUpDown aria-hidden className="ml-auto opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-(--radix-popover-trigger-width) min-w-72 p-0"
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Ex.: unesp, federal, puc"
                value={query}
                onValueChange={setQuery}
              />
              <CommandList>
                <CommandEmpty>Nenhuma faculdade encontrada.</CommandEmpty>
                <CommandGroup>
                  {filtered.map((i) => (
                    <CommandItem
                      key={i.slug}
                      value={i.slug}
                      onSelect={(slug) => {
                        setInstitutionSlug(slug);
                        setOpen(false);
                        setQuery("");
                        go(slug);
                      }}
                      className="items-start gap-2 py-2"
                    >
                      <Check
                        aria-hidden
                        className={cn(
                          "mt-0.5",
                          i.slug === institutionSlug ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="grid">
                        <span className="font-medium">{i.acronym ?? i.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {i.acronym ? i.name : null}
                          {i.campusName
                            ? `${i.acronym ? " · " : ""}${i.campusName}`
                            : null}
                        </span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Button
        type="submit"
        disabled={!citySlug || !institutionSlug}
        className="h-12 rounded-xl text-base font-semibold"
      >
        Achar minha república
      </Button>
    </form>
  );
}
