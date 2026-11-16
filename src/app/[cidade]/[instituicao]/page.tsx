import { ArrowRight, Building2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ResultsSkeleton } from "@/components/search/results-skeleton";
import { SearchView } from "@/components/search/search-view";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAllInstitutions,
  getInstitution,
  type Institution,
  institutionShortName,
} from "@/lib/data/catalog";
import { searchRepublics } from "@/lib/data/republics";
import { parseFilters } from "@/lib/search/filters";

type Props = PageProps<"/[cidade]/[instituicao]">;

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
    title: `Repúblicas perto da ${short} ${institution.city.name}`,
    description: `Repúblicas perto da ${short} em ${institution.city.name}: tipo, preço, vagas e região no mapa. Veja também kitnets e os contatos de moradia da faculdade.`,
    // Filtros não geram páginas novas para o Google.
    alternates: { canonical: `/${cidade}/${instituicao}` },
  };
}

export default function InstitutionPage({ params, searchParams }: Props) {
  // params e searchParams são "dados da URL": ficam dentro de <Suspense> para a
  // navegação ser instantânea (a casca da página aparece antes, o conteúdo chega em seguida).
  return (
    <main className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 sm:px-6 md:py-8">
      <Suspense fallback={<PageSkeleton />}>
        <InstitutionContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function InstitutionContent({ params, searchParams }: Props) {
  const { cidade, instituicao } = await params;
  const institution = await getInstitution(cidade, instituicao);
  if (!institution) notFound();
  const short = institutionShortName(institution);

  return (
    <>
      <header className="grid gap-1">
        <nav aria-label="Você está em" className="text-sm text-muted-foreground">
          <Link
            href={`/${institution.city.slug}`}
            className="hover:text-foreground hover:underline"
          >
            {institution.city.name}
          </Link>{" "}
          / {short}
        </nav>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Repúblicas perto da <span className="text-primary">{short}</span>
        </h1>
        <p className="text-muted-foreground">
          {institution.acronym ? institution.name : null}
          {institution.campusName ? ` · ${institution.campusName}` : null}
        </p>
      </header>

      {/* Os filtros vêm da URL: só a lista espera, o cabeçalho já aparece. */}
      <Suspense fallback={<ResultsSkeleton />}>
        <Results institution={institution} searchParams={searchParams} />
      </Suspense>

      <NoRepublicBlock institution={institution} />
    </>
  );
}

function PageSkeleton() {
  return (
    <>
      <div className="grid gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full max-w-lg" />
        <Skeleton className="h-4 w-64" />
      </div>
      <ResultsSkeleton />
    </>
  );
}

async function Results({
  institution,
  searchParams,
}: {
  institution: Institution;
  searchParams: Props["searchParams"];
}) {
  const filters = parseFilters(await searchParams);
  const republics = await searchRepublics(institution.id, filters);

  return (
    <SearchView
      campus={{
        lat: institution.lat,
        lng: institution.lng,
        name: institutionShortName(institution),
      }}
      filters={filters}
      republics={republics}
    />
  );
}

function NoRepublicBlock({ institution }: { institution: Institution }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-surface p-5 sm:flex-row sm:items-center sm:p-6">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card text-primary">
        <Building2 aria-hidden className="size-6" />
      </span>
      <div className="grid flex-1 gap-1">
        <h2 className="text-xl font-semibold">Não quer república?</h2>
        <p className="text-muted-foreground">
          Veja kitnets e apartamentos perto do campus e os contatos de moradia da{" "}
          {institutionShortName(institution)}
          {institution.hasOwnHousing ? ", que tem moradia estudantil própria" : ""}.
        </p>
      </div>
      <Link
        href={`/${institution.city.slug}/${institution.slug}/moradia`}
        className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-card px-5 font-semibold shadow-sm transition-colors hover:text-primary sm:self-center"
      >
        Ver outras opções
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </section>
  );
}
