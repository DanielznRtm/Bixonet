import { Home as HomeIcon, MapPinned, MessageCircle } from "lucide-react";
import Link from "next/link";
import { InstitutionPicker } from "@/components/search/institution-picker";
import { getAllInstitutions, getCities } from "@/lib/data/catalog";

const STEPS = [
  {
    icon: MapPinned,
    title: "Escolha sua faculdade",
    text: "A gente mostra as repúblicas mais perto do seu campus.",
  },
  {
    icon: HomeIcon,
    title: "Compare as reps",
    text: "Tipo, preço, vagas e a região aproximada no mapa.",
  },
  {
    icon: MessageCircle,
    title: "Chame no WhatsApp",
    text: "Fale direto com quem mora lá e marque uma visita.",
  },
];

export default async function Home() {
  const [cities, institutions] = await Promise.all([getCities(), getAllInstitutions()]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        {/* Manchas de cor no fundo, só decoração */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-accent/70 blur-3xl sm:size-96"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 -left-32 size-64 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 pt-10 pb-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-12 md:pt-16 md:pb-20">
          <div className="grid gap-4">
            <p className="w-fit rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              Passou no vestibular? 🎉
            </p>
            <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
              Ache sua <span className="text-primary">rep</span> perto da faculdade.
            </h1>
            <p className="max-w-prose text-lg text-muted-foreground">
              Escolha a cidade e a faculdade e veja repúblicas perto do campus. Não curte
              república? Também tem kitnets e os contatos de moradia da própria faculdade.
            </p>
          </div>

          <InstitutionPicker
            cities={cities}
            institutions={institutions.map((i) => ({
              slug: i.slug,
              citySlug: i.city.slug,
              name: i.name,
              acronym: i.acronym,
              campusName: i.campusName,
            }))}
          />
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3 md:py-14">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <div key={title} className="flex gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card text-primary shadow-sm">
                <Icon aria-hidden className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  <span className="sr-only">Passo {index + 1}: </span>
                  {title}
                </h2>
                <p className="text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {cities.map((city) => (
        <section
          key={city.slug}
          className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10 sm:px-6"
        >
          <h2 className="text-2xl font-bold tracking-tight">
            Faculdades em{" "}
            <Link
              href={`/${city.slug}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {city.name}
            </Link>
          </h2>
          <ul className="flex flex-wrap gap-2">
            {institutions
              .filter((i) => i.city.slug === city.slug)
              .map((i) => (
                <li key={i.id}>
                  <Link
                    href={`/${city.slug}/${i.slug}`}
                    className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 font-medium transition-colors hover:border-primary hover:text-primary"
                  >
                    {i.acronym ?? i.name}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
