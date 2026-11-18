/** "Rep Jabuticaba Ã" → "rep-jabuticaba-a" (minúsculas, sem acento, só letras/números/hífen). */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/g, "");
}

/** Slug único: nome + 4 caracteres aleatórios ("rep-jabuticaba-k3f9"). */
export function republicSlug(name: string, random: () => number = Math.random): string {
  const base = slugify(name) || "republica";
  const suffix = Array.from({ length: 4 }, () =>
    "abcdefghijkmnpqrstuvwxyz23456789".charAt(Math.floor(random() * 32)),
  ).join("");
  return `${base}-${suffix}`;
}
