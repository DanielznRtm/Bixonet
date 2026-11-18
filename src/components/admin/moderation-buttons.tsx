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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type AdminResult,
  approveRepublic,
  archiveRepublic,
  markReviewed,
  rejectRepublic,
  resolveReport,
  setVerified,
} from "@/lib/admin/actions";

function useAdminAction() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const run = (action: () => Promise<AdminResult>, onOk?: () => void) => {
    setError(null);
    start(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onOk?.();
      router.refresh();
    });
  };
  return { error, pending, run };
}

type Props = {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected" | "archived";
  verified: boolean;
  edited?: boolean;
};

export function ModerationButtons({ id, name, status, verified, edited }: Props) {
  const { error, pending, run } = useAdminAction();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {status !== "approved" ? (
          <Button
            disabled={pending}
            onClick={() => run(() => approveRepublic(id))}
            className="rounded-full"
          >
            Aprovar
          </Button>
        ) : null}
        {status === "pending" ? (
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => setRejectOpen(true)}
            className="rounded-full"
          >
            Recusar
          </Button>
        ) : null}
        {edited ? (
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => run(() => markReviewed(id))}
            className="rounded-full"
          >
            Marcar como revisada
          </Button>
        ) : null}
        {status === "approved" ? (
          <>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => run(() => setVerified(id, !verified))}
              className="rounded-full"
            >
              {verified ? "Tirar selo de verificada" : "Marcar como verificada"}
            </Button>
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => run(() => archiveRepublic(id))}
              className="rounded-full text-destructive hover:text-destructive"
            >
              Tirar do ar
            </Button>
          </>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar {name}</DialogTitle>
            <DialogDescription>
              O dono vê este motivo em &ldquo;Minhas reps&rdquo; e pode corrigir e
              reenviar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor={`motivo-${id}`}>Motivo</Label>
            <Textarea
              id={`motivo-${id}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Ex.: as fotos mostram o número da casa; envie outras."
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                run(
                  () => rejectRepublic(id, note),
                  () => setRejectOpen(false),
                )
              }
            >
              Recusar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ResolveReportButton({ id }: { id: string }) {
  const { error, pending, run } = useAdminAction();
  return (
    <div className="grid gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run(() => resolveReport(id))}
        className="rounded-full"
      >
        Marcar como resolvida
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
