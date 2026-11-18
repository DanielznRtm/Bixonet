import { getRepublic } from "@/lib/data/republic-detail";
import { formatOpenSpots, formatPriceRange, KIND_LABEL } from "@/lib/search/format";
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og/frame";

export const alt = "República no bixo.net";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) ? await getRepublic(slug) : null;
  if (!r) return ogImage({ title: "Ache sua rep perto", highlight: "da faculdade." });

  return ogImage({
    eyebrow: `República ${KIND_LABEL[r.kind].toLowerCase()} · ${[r.neighborhood, r.city.name].filter(Boolean).join(", ")}`,
    title: r.name,
    chips: [
      formatPriceRange(r.priceMin, r.priceMax),
      formatOpenSpots(r.openSpots),
      ...(r.verified ? ["Verificada"] : []),
    ],
  });
}
