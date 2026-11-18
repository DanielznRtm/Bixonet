import type { MetadataRoute } from "next";
import { getAllInstitutions, getCities } from "@/lib/data/catalog";
import { listPublicRepublics } from "@/lib/data/sitemap";
import { SITE_URL } from "@/lib/site";

/** Mapa do site para o Google: páginas públicas (sem login, sem exemplos, sem pendentes). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, institutions, republics] = await Promise.all([
    getCities(),
    getAllInstitutions(),
    listPublicRepublics(),
  ]);

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...cities.map((c) => ({
      url: `${SITE_URL}/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...institutions.flatMap((i) => [
      {
        url: `${SITE_URL}/${i.city.slug}/${i.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/${i.city.slug}/${i.slug}/moradia`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      },
    ]),
    ...republics.map((r) => ({
      url: `${SITE_URL}/republica/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/termos`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
