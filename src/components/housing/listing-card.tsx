import { Building, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingResult } from "@/lib/data/listings";
import { formatDistance } from "@/lib/geo";
import { formatListingFacts, formatMonthlyPrice } from "@/lib/listings/format";

export function ListingCard({
  listing: l,
  campusName,
}: {
  listing: ListingResult;
  campusName: string;
}) {
  const facts = formatListingFacts(l.bedrooms, l.furnished);

  return (
    <article
      data-testid="listing-card"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
    >
      <span
        aria-hidden
        className="hidden size-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground sm:flex"
      >
        <Building className="size-6" />
      </span>

      <div className="grid min-w-0 flex-1 gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-lg leading-tight font-semibold">{l.title}</h3>
          {l.isSample ? (
            <Badge variant="outline" className="rounded-full border-dashed">
              Exemplo
            </Badge>
          ) : null}
        </div>
        <p className="font-semibold">{formatMonthlyPrice(l.price)}</p>
        <p className="text-sm text-muted-foreground">
          {[facts, `${formatDistance(l.distanceM)} da ${campusName}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {l.source && !l.isSample ? (
          <p className="text-xs text-muted-foreground">Anúncio em {l.source}</p>
        ) : null}
      </div>

      {l.isSample ? (
        <Button disabled variant="outline" className="h-11 rounded-full sm:self-center">
          Anúncio de exemplo
        </Button>
      ) : (
        <Button
          asChild
          variant="outline"
          className="h-11 gap-2 rounded-full sm:self-center"
        >
          {/* nofollow: o bixo.net mostra o anúncio, mas não "recomenda" o site para o Google. */}
          <a href={l.externalUrl} target="_blank" rel="noopener noreferrer nofollow">
            Ver anúncio
            <ExternalLink aria-hidden className="size-4" />
            <span className="sr-only">(abre outro site)</span>
          </a>
        </Button>
      )}
    </article>
  );
}
