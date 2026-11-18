import "server-only";
import { parsePointEwkb } from "@/lib/geo";
import type { RepublicKind } from "@/lib/search/filters";
import { createSessionClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// Tudo aqui usa a sessão do admin: o RLS (is_admin) é quem libera a leitura.

type RepublicRow = Database["public"]["Tables"]["republics"]["Row"];

export type AdminRepublic = {
  id: string;
  slug: string;
  name: string;
  kind: RepublicKind;
  status: RepublicRow["status"];
  verified: boolean;
  neighborhood: string | null;
  description: string | null;
  houseRules: string | null;
  priceMin: number | null;
  priceMax: number | null;
  openSpots: number;
  totalResidents: number | null;
  amenities: string[];
  photos: string[];
  contactName: string | null;
  whatsapp: string | null;
  instagram: string | null;
  moderationNote: string | null;
  point: { lat: number; lng: number } | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
};

function toAdminRepublic(r: RepublicRow): AdminRepublic {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    kind: r.kind,
    status: r.status,
    verified: r.verified,
    neighborhood: r.neighborhood,
    description: r.description,
    houseRules: r.house_rules,
    priceMin: r.price_min,
    priceMax: r.price_max,
    openSpots: r.open_spots,
    totalResidents: r.total_residents,
    amenities: r.amenities,
    photos: r.photos,
    contactName: r.contact_name,
    whatsapp: r.whatsapp,
    instagram: r.instagram,
    moderationNote: r.moderation_note,
    point: parsePointEwkb(String(r.approx_location)),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    reviewedAt: r.reviewed_at,
  };
}

/** Repúblicas em análise, das mais antigas para as mais novas (fila). */
export async function listPending(): Promise<AdminRepublic[]> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase
    .from("republics")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Erro ao carregar pendentes: ${error.message}`);
  return data.map(toAdminRepublic);
}

// A trigger grava updated_at com a hora do banco e o admin grava reviewed_at com a hora do
// servidor: uma margem evita marcar como "alterada" a república que acabou de ser revisada.
const REVIEW_MARGIN_MS = 10_000;

export function editedAfterReview(r: { updated_at: string; reviewed_at: string | null }) {
  if (!r.reviewed_at) return true;
  return (
    new Date(r.updated_at).getTime() - new Date(r.reviewed_at).getTime() >
    REVIEW_MARGIN_MS
  );
}

/** Publicadas que o dono editou depois da última revisão. */
export async function listRecentlyEdited(): Promise<AdminRepublic[]> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase
    .from("republics")
    .select("*")
    .eq("status", "approved")
    .eq("is_sample", false)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Erro ao carregar alterações: ${error.message}`);
  return data.filter(editedAfterReview).map(toAdminRepublic);
}

export async function listPublished(query: string): Promise<AdminRepublic[]> {
  const supabase = await createSessionClient();
  let request = supabase
    .from("republics")
    .select("*")
    .in("status", ["approved", "archived"])
    .order("name")
    .limit(100);
  const q = query.trim();
  if (q) request = request.ilike("name", `%${q.replace(/[%_]/g, "")}%`);
  const { data, error } = await request;
  if (error) throw new Error(`Erro ao carregar publicadas: ${error.message}`);
  return data.map(toAdminRepublic);
}

export type AdminReport = {
  id: string;
  reason: Database["public"]["Enums"]["report_reason"];
  message: string | null;
  createdAt: string;
  republic: {
    id: string;
    slug: string;
    name: string;
    status: RepublicRow["status"];
  } | null;
};

/** Denúncias abertas; pedidos de remoção (LGPD) primeiro. */
export async function listOpenReports(): Promise<AdminReport[]> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase
    .from("reports")
    .select("id, reason, message, created_at, republics(id, slug, name, status)")
    .is("resolved_at", null)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Erro ao carregar denúncias: ${error.message}`);
  return data
    .map((r) => ({
      id: r.id,
      reason: r.reason,
      message: r.message,
      createdAt: r.created_at,
      republic: r.republics,
    }))
    .sort(
      (a, b) =>
        Number(b.reason === "removal_request") - Number(a.reason === "removal_request"),
    );
}

export async function adminCounts() {
  const supabase = await createSessionClient();
  const [pending, reports, edited] = await Promise.all([
    supabase
      .from("republics")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .is("resolved_at", null),
    listRecentlyEdited(),
  ]);
  return {
    pending: pending.count ?? 0,
    reports: reports.count ?? 0,
    edited: edited.length,
  };
}
