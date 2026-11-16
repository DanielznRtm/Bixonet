import { ArrowRight, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCities, getCity, getInstitutionsByCity } from "@/lib/data/catalog";

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((c) => ({ cidade: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[cidade]">): Promise<Metadata> {
  const city = await getCity((await params).cidade);
  if (!city) return {};
  return {
    title: `Repúblicas em ${city.name} por faculdade`,
    description: `Escolha sua faculdade em ${city.name} (${city.state}) e veja repúblicas, kitnets e contatos de moradia perto do campus.`,
    alternates: { canonical: `/${city.slug}` },
  };
}

export default function CityPage({ params }: PageProps<"/[cidade]">) {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6">
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-2xl" />}>
        <CityContent params={params} />
      </Suspense>
    </main>
  );
}

async function CityContent({ params }: { params: PageProps<"/[cidade]">["params"] }) {
  const { cidade } = await params;
  const city = await getCity(cidade);
  if (!city) notFound();
  const institutions = await getInstitutionsByCity(city.slug);

  return (
    <>
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Repúblicas em {city.name}
        </h1>
        <p className="text-lg text-muted-foreground">Qual é a sua faculdade?</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {institutions.map((i) => (
          <li key={i.id}>
            <Link
              href={`/${city.slug}/${i.slug}`}
              className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <GraduationCap aria-hidden className="size-5" />
              </span>
              <span className="grid flex-1 gap-0.5">
                <span className="font-heading text-lg font-semibold">
                  {i.acronym ?? i.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {i.acronym ? i.name : null}
                  {i.campusName ? ` · ${i.campusName}` : null}
                </span>
              </span>
              <ArrowRight
                aria-hidden
                className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
