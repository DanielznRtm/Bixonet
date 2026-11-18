"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setOwnRepublicStatus } from "@/lib/registration/actions";

type Props = { id: string; name: string; canArchive: boolean; canResubmit: boolean };

/** "Tirar do ar" (com confirmação) e "Reenviar para análise". */
export function OwnerActions({ id, name, canArchive, canResubmit }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(status: "archived" | "pending") {
    setError(null);
    startTransition(async () => {
      const result = await setOwnRepublicStatus(id, status);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      {canResubmit ? (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => run("pending")}
          className="rounded-full"
        >
          Reenviar para análise
        </Button>
      ) : null}
      {canArchive ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => setConfirmOpen(true)}
          className="rounded-full text-destructive hover:text-destructive"
        >
          Tirar do ar
        </Button>
      ) : null}
      {error ? (
        <p role="alert" className="w-full text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tirar {name} do ar?</DialogTitle>
            <DialogDescription>
              A república some do bixo.net na hora. Os dados ficam guardados e você pode
              reenviar para análise quando quiser.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => run("archived")}
            >
              {pending ? "Tirando…" : "Tirar do ar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
