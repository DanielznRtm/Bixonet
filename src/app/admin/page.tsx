import { ExternalLink, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ModerationButtons,
  ResolveReportButton,
} from "@/components/admin/moderation-buttons";
import { LazyAreaMap } from "@/components/map/lazy-area-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { isAdmin, requireUser } from "@/lib/auth/session";
import {
  type AdminRepublic,
  adminCounts,
  listOpenReports,
  listPending,
  listPublished,
  listRecentlyEdited,
} from "@/lib/data/admin";
import { amenityLabel } from "@/lib/republic/amenities";
import { REPORT_REASONS } from "@/lib/republic/report";
import { formatPhone } from "@/lib/republic/whatsapp";
import { formatOpenSpots, formatPriceRange, KIND_LABEL } from "@/lib/search/format";
import { KIND_STYLE } from "@/lib/search/kind-style";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const TABS = [
  { key: "pendentes", label: "Pendentes" },
  { key: "alteracoes", label: "Alterações recentes" },
  { key: "denuncias", label: "Denúncias" },
  { key: "publicadas", label: "Publicadas" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <main className="mx-auto grid w-full max-w-5xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-8 sm:px-6">
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
        <AdminContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function AdminContent({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  await requireUser("/admin");
  // Para quem não é admin, a página simplesmente não existe.
  if (!(await isAdmin())) notFound();

  const params = await searchParams;
  const tab: TabKey = TABS.some((t) => t.key === params.aba)
    ? (params.aba as TabKey)
    : "pendentes";
  const q = typeof params.q === "string" ? params.q : "";
  const counts = await adminCounts();
  const badge: Partial<Record<TabKey, number>> = {
    pendentes: counts.pending,
    alteracoes: counts.edited,
    denuncias: counts.reports,
  };

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Moderação</h1>
      <nav
        aria-label="Seções do admin"
        className="flex flex-wrap gap-1 rounded-xl bg-muted p-1"
      >
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin?aba=${t.key}`}
            aria-current={t.key === tab ? "page" : undefined}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium",
              t.key === tab
                ? "bg-card shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {badge[t.key] ? (
              <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {badge[t.key]}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      {tab === "pendentes" ? <PendingTab /> : null}
      {tab === "alteracoes" ? <EditedTab /> : null}
      {tab === "denuncias" ? <ReportsTab /> : null}
      {tab === "publicadas" ? <PublishedTab q={q} /> : null}
    </>
  );
}

async function PendingTab() {
  const list = await listPending();
  if (list.length === 0) return <Empty text="Nenhuma república esperando revisão." />;
  return (
    <ul className="grid gap-4">
      {list.map((r) => (
        <li key={r.id}>
          <RepublicReview republic={r}>
            <ModerationButtons
              id={r.id}
              name={r.name}
              status={r.status}
              verified={r.verified}
            />
          </RepublicReview>
        </li>
      ))}
    </ul>
  );
}

async function EditedTab() {
  const list = await listRecentlyEdited();
  if (list.length === 0) return <Empty text="Nenhuma alteração para revisar." />;
  return (
    <ul className="grid gap-4">
      {list.map((r) => (
        <li key={r.id}>
          <RepublicReview republic={r}>
            <ModerationButtons
              id={r.id}
              name={r.name}
              status={r.status}
              verified={r.verified}
              edited
            />
          </RepublicReview>
        </li>
      ))}
    </ul>
  );
}

async function ReportsTab() {
  const reports = await listOpenReports();
  if (reports.length === 0) return <Empty text="Nenhuma denúncia aberta." />;
  const label = Object.fromEntries(REPORT_REASONS.map((r) => [r.value, r.label]));
  return (
    <ul className="grid gap-3">
      {reports.map((r) => (
        <li
          key={r.id}
          data-testid="admin-report"
          className="grid gap-2 rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            {r.reason === "removal_request" ? (
              <Badge variant="destructive" className="rounded-full">
                Pedido de remoção
              </Badge>
            ) : null}
            <span className="font-semibold">{label[r.reason]}</span>
            <span className="text-sm text-muted-foreground">
              {dateFmt.format(new Date(r.createdAt))}
            </span>
          </div>
          {r.republic ? (
            <Link
              href={`/republica/${r.republic.slug}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {r.republic.name}
            </Link>
          ) : null}
          {r.message ? <p className="text-sm">&ldquo;{r.message}&rdquo;</p> : null}
          <ResolveReportButton id={r.id} />
        </li>
      ))}
    </ul>
  );
}

async function PublishedTab({ q }: { q: string }) {
  const list = await listPublished(q);
  return (
    <div className="grid gap-4">
      <form className="flex gap-2" action="/admin">
        <input type="hidden" name="aba" value="publicadas" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Buscar pelo nome"
          aria-label="Buscar pelo nome"
          className="h-10"
        />
        <Button type="submit" variant="outline" className="h-10 gap-1.5">
          <Search aria-hidden className="size-4" />
          Buscar
        </Button>
      </form>
      {list.length === 0 ? (
        <Empty text="Nada encontrado." />
      ) : (
        <ul className="grid gap-2">
          {list.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="grid">
                <span className="font-semibold">{r.name}</span>
                <span className="text-sm text-muted-foreground">
                  {r.status === "archived" ? "Fora do ar" : "Publicada"}
                  {r.verified ? " · verificada" : ""}
                  {r.neighborhood ? ` · ${r.neighborhood}` : ""}
                </span>
              </div>
              <ModerationButtons
                id={r.id}
                name={r.name}
                status={r.status}
                verified={r.verified}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RepublicReview({
  republic: r,
  children,
}: {
  republic: AdminRepublic;
  children: React.ReactNode;
}) {
  return (
    <article
      data-testid="admin-republic"
      className="grid gap-4 rounded-3xl border border-border bg-card p-5 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="grid min-w-0 content-start gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn("rounded-full border-0", KIND_STYLE[r.kind].badge)}>
            {KIND_LABEL[r.kind]}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Enviada em {dateFmt.format(new Date(r.createdAt))}
            {r.reviewedAt
              ? ` · revisada em ${dateFmt.format(new Date(r.reviewedAt))}`
              : ""}
          </span>
        </div>
        <h2 className="font-heading text-xl font-semibold">{r.name}</h2>
        <p className="text-sm">
          {r.neighborhood} · {formatPriceRange(r.priceMin, r.priceMax)} ·{" "}
          {formatOpenSpots(r.openSpots)}
          {r.totalResidents ? ` · ${r.totalResidents} moradores` : ""}
        </p>
        {r.description ? (
          <p className="text-sm whitespace-pre-line">{r.description}</p>
        ) : null}
        {r.houseRules ? (
          <p className="text-sm whitespace-pre-line">
            <strong>Regras:</strong> {r.houseRules}
          </p>
        ) : null}
        {r.amenities.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {r.amenities.map(amenityLabel).join(" · ")}
          </p>
        ) : null}
        <p className="text-sm">
          <strong>Contato:</strong> {r.contactName ?? "—"}
          {r.whatsapp ? ` · WhatsApp ${formatPhone(r.whatsapp)}` : ""}
          {r.instagram ? ` · @${r.instagram}` : ""}
        </p>
        {r.photos.length > 0 ? (
          <ul className="flex gap-2 overflow-x-auto" aria-label="Fotos">
            {r.photos.map((src, i) => (
              <li key={src} className="shrink-0">
                <a href={src} target="_blank" rel="noopener noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- foto do Storage para revisão */}
                  <img
                    src={src}
                    alt={`Foto ${i + 1}`}
                    className="size-24 rounded-xl object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Sem fotos.</p>
        )}
        {r.status === "approved" ? (
          <Link
            href={`/republica/${r.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver no site <ExternalLink aria-hidden className="size-3.5" />
          </Link>
        ) : null}
        {children}
      </div>
      {r.point ? (
        <LazyAreaMap lat={r.point.lat} lng={r.point.lng} color={KIND_STYLE[r.kind].hex} />
      ) : null}
    </article>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
      {text}
    </p>
  );
}
