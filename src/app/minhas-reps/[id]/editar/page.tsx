import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RegistrationWizard } from "@/components/registration/registration-wizard";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth/session";
import { getMyRepublicForEdit, getWizardOptions } from "@/lib/data/owner";

export const metadata: Metadata = { title: "Editar república", robots: { index: false } };

export default function EditPage({ params }: PageProps<"/minhas-reps/[id]/editar">) {
  return (
    <main className="mx-auto grid w-full max-w-3xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-8 sm:px-6">
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
        <EditContent params={params} />
      </Suspense>
    </main>
  );
}

async function EditContent({
  params,
}: Pick<PageProps<"/minhas-reps/[id]/editar">, "params">) {
  const { id } = await params;
  const user = await requireUser(`/minhas-reps/${id}/editar`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [republic, options] = await Promise.all([
    getMyRepublicForEdit(id),
    getWizardOptions(),
  ]);
  if (!republic) notFound();

  return (
    <>
      <div className="grid gap-2">
        <Link
          href="/minhas-reps"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Minhas reps
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          Editar {republic.values.name}
        </h1>
        <p className="text-muted-foreground">
          {republic.status === "approved"
            ? "As mudanças aparecem no site assim que você salvar."
            : republic.status === "rejected"
              ? "Ao salvar, a república volta para análise."
              : "Você pode ajustar enquanto ela está em análise."}
        </p>
      </div>
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <RegistrationWizard
          mode="edit"
          republicId={id}
          userId={user.id}
          cities={options.cities}
          institutions={options.institutions}
          initialValues={republic.values}
        />
      </div>
    </>
  );
}
