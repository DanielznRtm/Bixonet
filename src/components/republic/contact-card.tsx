import { AtSign, MessageCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/republic/whatsapp";
import { cn } from "@/lib/utils";

type Props = {
  whatsapp: string | null;
  instagram: string | null;
  contactName: string | null;
  isSample: boolean;
  /** Nome curto da faculdade de onde o bixo veio, para a mensagem pronta. */
  institutionName: string | null;
  variant: "card" | "bar";
};

function contactState({ whatsapp, isSample }: Pick<Props, "whatsapp" | "isSample">) {
  if (isSample) return "sample" as const;
  return whatsapp ? ("ok" as const) : ("missing" as const);
}

export function ContactCard(props: Props) {
  const { instagram, contactName, institutionName, variant } = props;
  const state = contactState(props);
  const href = state === "ok" ? whatsappLink(props.whatsapp, institutionName) : null;

  const whatsappButton = href ? (
    <Button asChild className="h-12 w-full gap-2 rounded-full text-base font-semibold">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="whatsapp-button"
      >
        <MessageCircle aria-hidden className="size-5" />
        Falar no WhatsApp
      </a>
    </Button>
  ) : (
    <Button
      disabled
      aria-describedby="contato-indisponivel"
      className="h-12 w-full gap-2 rounded-full text-base font-semibold"
      data-testid="whatsapp-button"
    >
      <MessageCircle aria-hidden className="size-5" />
      Falar no WhatsApp
    </Button>
  );

  const unavailable =
    state === "sample"
      ? "República de exemplo: sem contato."
      : state === "missing" || !href
        ? "Esta república ainda não informou um contato."
        : null;

  if (variant === "bar") {
    return (
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        {whatsappButton}
        {unavailable ? (
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            {unavailable}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Fale com a rep</h2>
        {contactName && state === "ok" ? (
          <p className="text-sm text-muted-foreground">Contato: {contactName}</p>
        ) : null}
      </div>
      {whatsappButton}
      {unavailable ? (
        <p id="contato-indisponivel" className="-mt-2 text-sm text-muted-foreground">
          {unavailable}
        </p>
      ) : null}
      {instagram && state !== "sample" ? (
        <a
          href={`https://instagram.com/${instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <AtSign aria-hidden className="size-4" />
          {instagram} no Instagram
        </a>
      ) : null}
      <p
        className={cn(
          "flex gap-2 rounded-2xl bg-secondary p-3 text-sm text-secondary-foreground",
        )}
      >
        <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
        Visite antes de pagar qualquer valor e desconfie de pedidos de depósito
        antecipado.
      </p>
    </div>
  );
}
