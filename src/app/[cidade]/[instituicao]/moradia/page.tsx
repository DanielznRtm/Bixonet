import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HousingContactCard } from "@/components/housing/housing-contact-card";
import { ListingsView } from "@/components/housing/listings-view";
import { RentalTips } from "@/components/housing/rental-tips";
import { InstitutionTabs } from "@/components/search/institution-tabs";
import { ResultsSkeleton } from "@/components/search/results-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAllInstitutions,
  getInstitution,
  type Institution,
  institutionShortName,
} from "@/lib/data/catalog";
import { searchListings } from "@/lib/data/listings";
import { parseListingFilters } from "@/lib/listings/filters";

type Props = PageProps<"/[cidade]/[instituicao]/moradia">;

export async function generateStaticParams() {
  const institutions = await getAllInstitutions();
  return institutions.map((i) => ({ cidade: i.city.slug, instituicao: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade, instituicao } = await params;
  const institution = await getInstitution(cidade, instituicao);
  if (!institution) return {};
  const short = institutionShortName(institution);
  return {
    title: `Kitnets e moradia perto da ${short} ${institution.city.name}`,
    description: `Não quer república? Veja kitnets e apartamentos perto da ${short} em ${institution.city.name} e os contatos de moradia da própria faculdade.`,
    alternates: { canonical: `/${cidade}/${instituicao}/moradia` },
  };
}

export default function HousingPage({ params, searchParams }: Props) {
  // Mesmo padrão da busca de repúblicas: dados da URL dentro de <Suspense>.
  return (
    <main className="mx-auto grid w-full max-w-4xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 sm:px-6 md:py-8">
      <Suspense fallback={<PageSkeleton />}>
        <HousingContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function HousingContent({ params, searchParams }: Props) {
  const { cidade, instituicao } = await params;
  const institution = await getInstitution(cidade, instituicao);
  if (!institution) notFound();
  const short = institutionShortName(institution);

  return (
    <>
      <header className="grid gap-3">
        <nav aria-label="Você está em" className="text-sm text-muted-foreground">
          <Link
            href={`/${institution.city.slug}`}
            className="hover:text-foreground hover:underline"
          >
            {institution.city.name}
          </Link>{" "}
          /{" "}
          <Link
            href={`/${institution.city.slug}/${institution.slug}`}
            className="hover:text-foreground hover:underline"
          >
            {short}
          </Link>{" "}
          / Outras opções
        </nav>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Moradia perto da <span className="text-primary">{short}</span>
        </h1>
        <p className="text-muted-foreground">
          Não quer república? Veja os contatos de moradia da faculdade e kitnets e
          apartamentos perto do campus.
        </p>
        <InstitutionTabs
          citySlug={institution.city.slug}
          institutionSlug={institution.slug}
          current="moradia"
        />
      </header>

      <HousingContactCard institution={institution} />

      <section aria-labelledby="imoveis" className="grid gap-4">
        <h2 id="imoveis" className="text-2xl font-bold tracking-tight">
          Kitnets e apartamentos
        </h2>
        <Suspense fallback={<ResultsSkeleton />}>
          <Listings institution={institution} searchParams={searchParams} />
        </Suspense>
      </section>

      <RentalTips />
    </>
  );
}

async function Listings({
  institution,
  searchParams,
}: {
  institution: Institution;
  searchParams: Props["searchParams"];
}) {
  const filters = parseListingFilters(await searchParams);
  const listings = await searchListings(institution.id, filters);
  return (
    <ListingsView
      campus={{
        name: institutionShortName(institution),
        republicsHref: `/${institution.city.slug}/${institution.slug}`,
      }}
      filters={filters}
      listings={listings}
    />
  );
}

function PageSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-full max-w-lg" />
      <Skeleton className="h-9 w-64 rounded-xl" />
      <Skeleton className="h-40 w-full rounded-3xl" />
    </div>
  );
}
