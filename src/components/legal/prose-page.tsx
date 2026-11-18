import type { ReactNode } from "react";

/** Moldura das páginas de texto (sobre, termos, privacidade). */
export function ProsePage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: ReactNode;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto grid w-full max-w-2xl gap-6 px-4 py-10 sm:px-6">
      <header className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {intro ? <p className="text-lg text-muted-foreground">{intro}</p> : null}
        {updated ? (
          <p className="text-sm text-muted-foreground">Atualizada em {updated}.</p>
        ) : null}
      </header>
      {children}
    </main>
  );
}

export function ProseSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid gap-3 leading-relaxed [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_li]:ml-5 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1.5">
        {children}
      </div>
    </section>
  );
}
