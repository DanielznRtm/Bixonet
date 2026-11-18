import { ExternalLink, GraduationCap, Info, Mail, Phone } from "lucide-react";
import { type Institution, institutionShortName } from "@/lib/data/catalog";

/**
 * Contatos de moradia da própria faculdade. Só mostra o que foi confirmado no site oficial;
 * o que não foi confirmado fica de fora, com um aviso honesto.
 */
export function HousingContactCard({ institution: i }: { institution: Institution }) {
  const short = institutionShortName(i);
  const hasContact = Boolean(
    i.housingContactUrl || i.housingContactEmail || i.housingContactPhone,
  );

  return (
    <section
      aria-labelledby="moradia-faculdade"
      data-testid="housing-contact-card"
      className="grid gap-4 rounded-3xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <GraduationCap aria-hidden className="size-5" />
        </span>
        <div className="grid gap-1">
          <h2 id="moradia-faculdade" className="text-xl font-semibold">
            Moradia da {short}
          </h2>
          {i.hasOwnHousing ? (
            <p className="w-fit rounded-full bg-accent px-3 py-0.5 text-sm font-semibold text-accent-foreground">
              Tem moradia estudantil própria
            </p>
          ) : null}
        </div>
      </div>

      {i.housingNotes ? <p className="leading-relaxed">{i.housingNotes}</p> : null}

      {hasContact ? (
        <ul
          className="grid gap-2 sm:grid-cols-2"
          aria-label={`Contatos de moradia da ${short}`}
        >
          {i.housingContactUrl ? (
            <li>
              <ContactLink href={i.housingContactUrl} icon={ExternalLink} external>
                Página oficial
              </ContactLink>
            </li>
          ) : null}
          {i.housingContactEmail ? (
            <li>
              <ContactLink href={`mailto:${i.housingContactEmail}`} icon={Mail}>
                {i.housingContactEmail}
              </ContactLink>
            </li>
          ) : null}
          {i.housingContactPhone ? (
            <li>
              <ContactLink
                href={`tel:${i.housingContactPhone.replace(/\D/g, "")}`}
                icon={Phone}
              >
                {i.housingContactPhone}
              </ContactLink>
            </li>
          ) : null}
        </ul>
      ) : (
        <div className="flex gap-3 rounded-2xl bg-muted p-4 text-sm">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p>
            Ainda não confirmamos um contato de moradia da {short} no site oficial.
            Procure a secretaria ou a assistência estudantil
            {i.website ? (
              <>
                {" "}
                pelo{" "}
                <a
                  href={i.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  site da {short}
                </a>
              </>
            ) : null}
            .
          </p>
        </div>
      )}
    </section>
  );
}

function ContactLink({
  href,
  icon: Icon,
  external,
  children,
}: {
  href: string;
  icon: typeof Mail;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex h-12 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium break-all transition-colors hover:border-primary hover:text-primary"
    >
      <Icon aria-hidden className="size-4 shrink-0" />
      {children}
    </a>
  );
}
