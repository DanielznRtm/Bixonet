"use client";

import { MailCheck } from "lucide-react";
import { useActionState } from "react";
import { type MagicLinkState, sendMagicLink } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL: MagicLinkState = { status: "idle" };

export function MagicLinkForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(sendMagicLink, INITIAL);

  if (state.status === "sent") {
    return (
      <div role="status" className="grid gap-3 rounded-2xl bg-secondary p-5">
        <MailCheck aria-hidden className="size-8 text-primary" />
        <p className="text-lg font-semibold">Confira seu e-mail</p>
        <p>
          Mandamos um link de acesso para <strong>{state.email}</strong>. Abra no mesmo
          aparelho e você entra direto, sem senha.
        </p>
        <p className="text-sm text-muted-foreground">
          Não chegou? Olhe a caixa de spam ou espere um minuto e peça de novo.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-sm font-semibold">
          Seu e-mail
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="voce@exemplo.com"
          className="h-12 rounded-xl text-base"
        />
      </div>
      {state.status === "error" ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.message}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="h-12 rounded-xl text-base font-semibold"
      >
        {pending ? "Enviando…" : "Receber link de acesso"}
      </Button>
    </form>
  );
}
