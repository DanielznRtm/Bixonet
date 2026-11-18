import { SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  campusName: string;
  canWiden: boolean;
  hasFilters: boolean;
  onWiden: () => void;
  onClear: () => void;
};

export function EmptyState({
  campusName,
  canWiden,
  hasFilters,
  onWiden,
  onClear,
}: Props) {
  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border bg-card p-6"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
        <SearchX aria-hidden className="size-6" />
      </span>
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold">
          {hasFilters
            ? "Nenhuma república com esses filtros"
            : `Ainda não temos repúblicas perto da ${campusName}`}
        </h2>
        <p className="text-muted-foreground">
          {hasFilters
            ? "Tente aumentar a distância ou tirar algum filtro."
            : "Mora numa rep daqui? Cadastre de graça. Conhece uma? Mande o link desta página para ela."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {canWiden ? (
          <Button type="button" onClick={onWiden} className="rounded-full">
            Aumentar a distância
          </Button>
        ) : null}
        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            className="rounded-full"
          >
            Limpar filtros
          </Button>
        ) : null}
        <Button
          asChild
          variant={hasFilters ? "ghost" : "default"}
          className="rounded-full"
        >
          <Link href="/cadastrar-republica">Mora numa rep? Cadastre</Link>
        </Button>
      </div>
    </div>
  );
}
