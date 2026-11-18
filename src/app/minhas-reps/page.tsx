import { CheckCircle2, House, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OwnerActions } from "@/components/owner/owner-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { listMyRepublics, type RepublicStatus } from "@/lib/data/owner";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Minhas reps", robots: { index: false } };

const STATUS: Record<RepublicStatus, { label: string; className: string }> = {
  pending: { label: "Em análise", className: "bg-accent text-accent-foreground" },
  approved: {
    label: "Publicada",
    className:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  },
  rejected: { label: "Recusada", className: "bg-destructive/10 text-destructive" },
  archived: { label: "Fora do ar", className: "bg-muted text-muted-foreground" },
};

export default function MyRepublicsPage({ searchParams }: PageProps<"/minhas-reps">) {
  return (
    <main className="mx-auto grid w-full max-w-3xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-8 sm:px-6">
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-3xl" />}>
        <MyRepublicsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function MyRepublicsContent({
  searchParams,
}: Pick<PageProps<"/minhas-reps">, "searchParams">) {
  const user = await requireUser("/minhas-reps");
  const [republics, params] = await Promise.all([listMyRepublics(), searchParams]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Minhas reps</h1>
          <p className="text-sm text-muted-foreground">Logado como {user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="gap-1.5 rounded-full">
            <Link href="/cadastrar-republica">
              <Plus aria-hidden className="size-4" />
              Cadastrar outra
            </Link>
          </Button>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="rounded-full">
              Sair
            </Button>
          </form>
        </div>
      </div>

      {params.enviado ? (
        <p role="status" className="flex gap-2 rounded-2xl bg-secondary p-4">
          <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
          Recebemos o cadastro! A gente revisa e, se estiver tudo certo, a república
          aparece no site. Acompanhe o status por aqui.
        </p>
      ) : null}
      {params.salvo ? (
        <p role="status" className="flex gap-2 rounded-2xl bg-secondary p-4">
          <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
          Alterações salvas.
        </p>
      ) : null}

      {republics.length === 0 ? (
        <div className="grid justify-items-start gap-3 rounded-3xl border border-dashed border-border bg-card p-6">
          <p className="text-lg font-semibold">
            Você ainda não cadastrou nenhuma república.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/cadastrar-republica">Cadastrar minha rep</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3" aria-label="Suas repúblicas">
          {republics.map((r) => {
            const status = STATUS[r.status];
            return (
              <li
                key={r.id}
                data-testid="my-republic"
                className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[auto_1fr]"
              >
                {r.coverPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element -- foto do Storage
                  <img
                    src={r.coverPhoto}
                    alt=""
                    className="hidden size-20 rounded-xl object-cover sm:block"
                  />
                ) : (
                  <span className="hidden size-20 items-center justify-center rounded-xl bg-secondary text-secondary-foreground sm:flex">
                    <House aria-hidden className="size-7" />
                  </span>
                )}
                <div className="grid min-w-0 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-lg font-semibold">{r.name}</h2>
                    <Badge className={cn("rounded-full border-0", status.className)}>
                      {status.label}
                    </Badge>
                  </div>
                  {r.neighborhood ? (
                    <p className="text-sm text-muted-foreground">{r.neighborhood}</p>
                  ) : null}
                  {r.status === "rejected" && r.moderationNote ? (
                    <p className="rounded-xl bg-destructive/10 p-3 text-sm">
                      <strong>Motivo:</strong> {r.moderationNote} Ajuste e salve para
                      reenviar.
                    </p>
                  ) : null}
                  {r.status === "pending" ? (
                    <p className="text-sm text-muted-foreground">
                      A gente revisa em até alguns dias. Enquanto isso, ela não aparece no
                      site.
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    {r.status === "approved" ? (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                      >
                        <Link href={`/republica/${r.slug}`}>Ver no site</Link>
                      </Button>
                    ) : null}
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href={`/minhas-reps/${r.id}/editar`}>Editar</Link>
                    </Button>
                    <OwnerActions
                      id={r.id}
                      name={r.name}
                      canArchive={r.status !== "archived"}
                      canResubmit={r.status === "archived"}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
