import { getInstitution, institutionShortName } from "@/lib/data/catalog";
import { searchRepublics } from "@/lib/data/republics";
import { DEFAULT_FILTERS } from "@/lib/search/filters";
import { formatResultCount } from "@/lib/search/format";
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og/frame";

export const alt = "Repúblicas perto da faculdade no bixo.net";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ cidade: string; instituicao: string }>;
}) {
  const { cidade, instituicao } = await params;
  const institution = await getInstitution(cidade, instituicao);
  if (!institution)
    return ogImage({ title: "Ache sua rep perto", highlight: "da faculdade." });

  const short = institutionShortName(institution);
  const republics = await searchRepublics(institution.id, DEFAULT_FILTERS);
  return ogImage({
    eyebrow: `${institution.city.name} (${institution.city.state})`,
    title: "Repúblicas perto da",
    highlight: short,
    subtitle: institution.acronym ? institution.name : undefined,
    chips: [
      `${formatResultCount(republics.length)} até 5 km`,
      "Lista e mapa",
      "Kitnets também",
    ],
  });
}
