import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-primary">Erro 404</p>
      <h1 className="text-3xl font-bold tracking-tight">Não achamos essa página</h1>
      <p className="text-muted-foreground">
        O link pode estar errado, ou essa parte do bixo.net ainda está sendo construída.
      </p>
      <Button asChild className="h-11 rounded-full px-6">
        <Link href="/">Voltar para a busca</Link>
      </Button>
    </main>
  );
}
