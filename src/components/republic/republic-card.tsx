import { BadgeCheck, BedDouble, House, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { RepublicResult } from "@/lib/data/republics";
import { formatDistance } from "@/lib/geo";
import { formatOpenSpots, formatPriceRange, KIND_LABEL } from "@/lib/search/format";
import { KIND_STYLE } from "@/lib/search/kind-style";
import { cn } from "@/lib/utils";

type Props = {
  republic: RepublicResult;
  campusName: string;
  /** Slug da faculdade da busca, para a página da república saber de onde o bixo veio. */
  campusSlug: string;
  highlighted?: boolean;
  onHover?: (id: string | null) => void;
};

export function RepublicCard({
  republic: r,
  campusName,
  campusSlug,
  highlighted,
  onHover,
}: Props) {
  const style = KIND_STYLE[r.kind];

  return (
    <article
      data-testid="republic-card"
      onMouseEnter={() => onHover?.(r.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "group relative flex gap-4 rounded-2xl border bg-card p-3 transition-shadow sm:p-4",
        highlighted ? "border-primary shadow-md" : "border-border hover:shadow-md",
      )}
    >
      {r.coverPhoto ? (
        <Image
          src={r.coverPhoto}
          alt=""
          width={224}
          height={224}
          sizes="(min-width: 640px) 112px, 80px"
          className="size-20 shrink-0 rounded-xl object-cover sm:size-28"
        />
      ) : (
        <div
          aria-hidden
          className={cn(
            "flex size-20 shrink-0 items-center justify-center rounded-xl bg-linear-to-br sm:size-28",
            style.tile,
          )}
        >
          <House className="size-9" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={cn("rounded-full border-0", style.badge)}>
            {KIND_LABEL[r.kind]}
          </Badge>
          {r.verified ? (
            <Badge variant="secondary" className="gap-1 rounded-full">
              <BadgeCheck aria-hidden className="size-3.5" />
              Verificada
            </Badge>
          ) : null}
          {r.isSample ? (
            <Badge variant="outline" className="rounded-full border-dashed">
              Exemplo
            </Badge>
          ) : null}
        </div>

        <h2 className="line-clamp-2 font-heading text-lg leading-tight font-semibold">
          {/* O link cobre o card inteiro (after:absolute) */}
          <Link
            href={`/republica/${r.slug}?de=${campusSlug}`}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {r.name}
          </Link>
        </h2>

        {r.neighborhood ? (
          <p className="truncate text-sm text-muted-foreground">{r.neighborhood}</p>
        ) : null}

        <p className="font-semibold">{formatPriceRange(r.priceMin, r.priceMax)}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BedDouble aria-hidden className="size-4" />
            <span className={cn(r.openSpots > 0 && "font-medium text-foreground")}>
              {formatOpenSpots(r.openSpots)}
            </span>
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="relative z-10 inline-flex items-center gap-1 rounded underline decoration-dotted underline-offset-4"
              >
                {formatDistance(r.distanceM)} da {campusName}
                <Info aria-hidden className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Distância em linha reta até o campus. O caminho a pé pode ser maior.
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </article>
  );
}
