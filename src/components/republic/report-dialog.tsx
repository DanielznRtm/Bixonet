"use client";

import { CheckCircle2, Flag } from "lucide-react";
import { useActionState, useState } from "react";
import { reportRepublic } from "@/app/republica/[slug]/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_REASONS, type ReportState } from "@/lib/republic/report";

const INITIAL: ReportState = { status: "idle" };

export function ReportDialog({ republicId, name }: { republicId: string; name: string }) {
  const [open, setOpen] = useState(false);
  // A key remonta o formulário a cada abertura (estado limpo depois de enviar).
  const [formKey, setFormKey] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setFormKey((k) => k + 1);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 justify-self-start text-muted-foreground"
        >
          <Flag aria-hidden className="size-4" />
          Reportar informação errada
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <ReportForm key={formKey} republicId={republicId} name={name} />
      </DialogContent>
    </Dialog>
  );
}

function ReportForm({ republicId, name }: { republicId: string; name: string }) {
  const [state, action, pending] = useActionState(reportRepublic, INITIAL);

  if (state.status === "ok") {
    return (
      <div className="flex flex-col items-start gap-3 py-2" role="status">
        <CheckCircle2 aria-hidden className="size-8 text-primary" />
        <DialogTitle>Obrigado por avisar!</DialogTitle>
        <DialogDescription>
          A gente vai conferir as informações de {name}. Pedidos de remoção são tratados
          primeiro.
        </DialogDescription>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-5">
      <DialogHeader>
        <DialogTitle>Reportar informação errada</DialogTitle>
        <DialogDescription>Sobre {name}. Não precisa se identificar.</DialogDescription>
      </DialogHeader>

      <input type="hidden" name="republicId" value={republicId} />
      {/* Campo-isca para robôs: escondido de pessoas e de leitores de tela. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Site
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-semibold">Qual é o problema?</legend>
        {REPORT_REASONS.map((r) => (
          <label
            key={r.value}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 text-sm has-checked:border-primary has-checked:bg-secondary"
          >
            <input
              type="radio"
              name="reason"
              value={r.value}
              required
              className="mt-0.5 accent-primary"
            />
            {r.label}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="report-message" className="text-sm font-semibold">
          Detalhes (opcional)
        </Label>
        <Textarea
          id="report-message"
          name="message"
          maxLength={1000}
          rows={3}
          placeholder="Ex.: o preço mudou para R$ 800."
        />
      </div>

      {state.status === "error" ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="h-11 rounded-full">
        {pending ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}
