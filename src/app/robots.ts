import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Áreas com login não têm o que indexar.
      disallow: ["/admin", "/minhas-reps", "/entrar", "/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
