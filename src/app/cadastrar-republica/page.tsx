import { BadgeCheck, Camera, ClipboardList, MapPinned } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RegistrationWizard } from "@/components/registration/registration-wizard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth/session";
import { getWizardOptions } from "@/lib/data/owner";

export const metadata: Metadata = {
  title: "Cadastrar minha república",
  description:
    "Cadastre sua república no bixo.net de graça e apareça para os bixos que estão procurando moradia perto da faculdade.",
};

const STEPS = [
  { icon: ClipboardList, text: "Tipo, vagas e preço" },
  { icon: MapPinned, text: "Marque a região no mapa (o endereço não aparece)" },
  { icon: Camera, text: "Fotos e regras da casa" },
  { icon: BadgeCheck, text: "A gente revisa e publica" },
];

export default function RegisterPage() {
  return (
    <main className="mx-auto grid w-full max-w-3xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-8 sm:px-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Cadastrar minha rep
        </h1>
        <p className="text-muted-foreground">
          É grátis. Leva uns 5 minutos, e a gente revisa antes de publicar.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
        <RegisterContent />
      </Suspense>
    </main>
  );
}

async function RegisterContent() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="grid gap-6 rounded-3xl border border-border bg-card p-6">
        <ol className="grid gap-4 sm:grid-cols-2">
          {STEPS.map(({ icon: Icon, text }, i) => (
            <li key={text} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon aria-hidden className="size-5" />
              </span>
              <span>
                <span className="sr-only">Passo {i + 1}: </span>
                {text}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">
          Para cadastrar, entre com seu e-mail. Não tem senha: você recebe um link de
          acesso.
        </p>
        <Button
          asChild
          className="h-12 justify-self-start rounded-full px-6 font-semibold"
        >
          <Link href="/entrar?next=/cadastrar-republica">Entrar para cadastrar</Link>
        </Button>
      </div>
    );
  }

  const { cities, institutions } = await getWizardOptions();
  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <RegistrationWizard
        mode="create"
        userId={user.id}
        cities={cities}
        institutions={institutions}
      />
    </div>
  );
}
