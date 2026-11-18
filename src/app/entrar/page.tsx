import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "@/lib/auth/actions";
import { safeNext } from "@/lib/auth/next-path";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Entrar",
  description:
    "Entre com seu e-mail para cadastrar e gerenciar sua república no bixo.net.",
  robots: { index: false },
};

export default function SignInPage({ searchParams }: PageProps<"/entrar">) {
  return (
    <main className="mx-auto grid w-full max-w-md flex-1 content-center gap-6 px-4 py-12 sm:px-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Entrar</h1>
        <p className="text-muted-foreground">
          Para cadastrar ou editar a sua república. Quem está procurando moradia não
          precisa de conta.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-2xl" />}>
        <SignInContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function SignInContent({
  searchParams,
}: Pick<PageProps<"/entrar">, "searchParams">) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : null);
  const user = await getCurrentUser();

  if (user) {
    return (
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-5">
        <p>
          Você já entrou como <strong>{user.email}</strong>.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full">
            <Link href={next}>Continuar</Link>
          </Button>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="rounded-full">
              Sair
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      {params.erro === "link" ? (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          O link expirou ou já foi usado. Peça um novo abaixo.
        </p>
      ) : null}
      <MagicLinkForm next={next} />
    </>
  );
}
