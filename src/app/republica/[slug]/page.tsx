import { BadgeCheck, BedDouble, ChevronLeft, MapPin, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { LazyAreaMap } from "@/components/map/lazy-area-map";
import { AmenityList } from "@/components/republic/amenity-list";
import { ContactCard } from "@/components/republic/contact-card";
import { RepublicGallery } from "@/components/republic/republic-gallery";
import { ReportDialog } from "@/components/republic/report-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getInstitution, institutionShortName } from "@/lib/data/catalog";
import { getNearbyInstitutions, getRepublic } from "@/lib/data/republic-detail";
import { formatDistance } from "@/lib/geo";
import { formatOpenSpots, formatPriceRange, KIND_LABEL } from "@/lib/search/format";
import { KIND_STYLE } from "@/lib/search/kind-style";
import { cn } from "@/lib/utils";

type Props = PageProps<"/republica/[slug]">;

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Sem generateStaticParams de propósito: com Cache Components ele precisa devolver pelo menos
// uma república, e o banco de produção começa vazio (o build quebraria). A página carrega
// dentro de <Suspense> e os dados ficam em cache com as tags "republics" e "republic:<slug>".

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = SLUG_RE.test(slug) ? await getRepublic(slug) : null;
  if (!r) return { title: "República não encontrada", robots: { index: false } };

  const kind = KIND_LABEL[r.kind].toLowerCase();
  const where = [r.neighborhood, r.city.name].filter(Boolean).join(", ");
  return {
    title: `${r.name}: república ${kind} em ${where}`,
    description: `${r.name}, república ${kind} em ${where}. ${formatPriceRange(r.priceMin, r.priceMax)}, ${formatOpenSpots(r.openSpots).toLowerCase()}. Veja fotos, regras da casa e fale com os moradores.`,
    alternates: { canonical: `/republica/${r.slug}` },
    // Repúblicas fictícias não devem ir para o Google.
    robots: r.isSample ? { index: false, follow: true } : undefined,
  };
}

export default function RepublicPage({ params, searchParams }: Props) {
  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-[minmax(0,1fr)] content-start gap-6 px-4 pt-6 sm:px-6 md:pt-8">
      <Suspense fallback={<DetailSkeleton />}>
        <RepublicContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function RepublicContent({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!SLUG_RE.test(slug)) notFound();
  const r = await getRepublic(slug);
  if (!r) notFound();

  // ?de=unesp: de qual busca o bixo veio (para a mensagem do WhatsApp e o "voltar").
  const de = (await searchParams).de;
  const fromSlug = typeof de === "string" && SLUG_RE.test(de) ? de : null;
  const [origin, nearby] = await Promise.all([
    fromSlug ? getInstitution(r.city.slug, fromSlug) : null,
    getNearbyInstitutions(r.id, r.slug),
  ]);
  const originName = origin ? institutionShortName(origin) : null;
  const style = KIND_STYLE[r.kind];

  const contact = {
    whatsapp: r.whatsapp,
    instagram: r.instagram,
    contactName: r.contactName,
    isSample: r.isSample,
    institutionName: originName,
  };

  return (
    <>
      <Link
        href={origin ? `/${r.city.slug}/${origin.slug}` : `/${r.city.slug}`}
        className="inline-flex items-center gap-1 justify-self-start text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft aria-hidden className="size-4" />
        {origin ? `Repúblicas perto da ${originName}` : `Faculdades em ${r.city.name}`}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <article className="grid min-w-0 gap-8">
          <header className="grid gap-3">
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
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {r.name}
            </h1>
            <p className="inline-flex items-center gap-1.5 text-muted-foreground">
              <MapPin aria-hidden className="size-4" />
              {[r.neighborhood, `${r.city.name} (${r.city.state})`]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <dl className="flex flex-wrap gap-x-6 gap-y-2">
              <Fact label="Preço">
                <span className="text-xl font-bold">
                  {formatPriceRange(r.priceMin, r.priceMax)}
                </span>
              </Fact>
              <Fact label="Vagas">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <BedDouble aria-hidden className="size-4 text-muted-foreground" />
                  {formatOpenSpots(r.openSpots)}
                </span>
              </Fact>
              {r.totalResidents ? (
                <Fact label="Moradores">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Users aria-hidden className="size-4 text-muted-foreground" />
                    {r.totalResidents === 1
                      ? "1 morador"
                      : `${r.totalResidents} moradores`}
                  </span>
                </Fact>
              ) : null}
            </dl>
          </header>

          <RepublicGallery photos={r.photos} name={r.name} kind={r.kind} />

          {r.description ? (
            <Section title="Sobre a casa">
              <p className="leading-relaxed whitespace-pre-line">{r.description}</p>
            </Section>
          ) : null}

          {r.amenities.length > 0 ? (
            <Section title="O que tem">
              <AmenityList amenities={r.amenities} />
            </Section>
          ) : null}

          {r.houseRules ? (
            <Section title="Regras da casa">
              <p className="leading-relaxed whitespace-pre-line">{r.houseRules}</p>
            </Section>
          ) : null}

          {nearby.length > 0 ? (
            <Section title="Perto de">
              <ul className="grid gap-2 sm:grid-cols-2" aria-label="Faculdades próximas">
                {nearby.map((i) => (
                  <li key={i.id}>
                    <Link
                      href={`/${i.citySlug}/${i.slug}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary"
                    >
                      <span className="grid">
                        <span className="font-semibold">{i.acronym ?? i.name}</span>
                        {i.declared ? (
                          <span className="text-xs text-primary">
                            A rep recebe alunos daqui
                          </span>
                        ) : null}
                      </span>
                      <span className="text-sm whitespace-nowrap text-muted-foreground">
                        {formatDistance(i.distanceM)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Distâncias em linha reta até cada campus.
              </p>
            </Section>
          ) : null}

          <Section title="Onde fica">
            <LazyAreaMap lat={r.lat} lng={r.lng} color={style.hex} />
            <p className="text-sm text-muted-foreground">
              O círculo mostra a região aproximada (cerca de 150 m). O endereço exato é
              combinado direto com os moradores.
            </p>
          </Section>

          <div className="grid gap-1 border-t border-border pt-6">
            <ReportDialog republicId={r.id} name={r.name} />
            <p className="text-xs text-muted-foreground">
              Atualizado em{" "}
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
                new Date(r.updatedAt),
              )}
              .
            </p>
          </div>
        </article>

        <aside className="hidden lg:sticky lg:top-6 lg:block">
          <ContactCard {...contact} variant="card" />
        </aside>
      </div>

      <ContactCard {...contact} variant="bar" />
    </>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-4 w-40" />
      <div className="grid gap-3">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-5 w-56" />
      </div>
      <Skeleton className="h-56 w-full rounded-3xl" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
