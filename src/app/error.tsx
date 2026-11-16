"use client"; // Error boundaries precisam ser Client Components

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Fase 6: mandar para um serviço de monitoramento.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-primary">Ops</p>
      <h1 className="text-3xl font-bold tracking-tight">Não deu para carregar agora</h1>
      <p className="text-muted-foreground">
        Pode ser uma instabilidade rápida. Tente de novo em alguns segundos.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => retry()} className="h-11 gap-2 rounded-full px-6">
          <RefreshCw aria-hidden className="size-4" />
          Tentar de novo
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-full px-6">
          <Link href="/">Voltar para o início</Link>
        </Button>
      </div>
    </main>
  );
}
