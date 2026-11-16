/** Minúsculas e sem acento: "Unesp São" → "unesp sao". */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

type Searchable = { name: string; acronym: string | null; campusName: string | null };

/** Todas as palavras digitadas precisam aparecer no nome, na sigla ou no campus. */
export function matchesInstitution(query: string, institution: Searchable): boolean {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeText(
    [institution.acronym, institution.name, institution.campusName]
      .filter(Boolean)
      .join(" "),
  );
  return words.every((w) => haystack.includes(w));
}
