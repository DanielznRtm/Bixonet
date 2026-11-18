/** Só deixa passar caminhos internos ("/minhas-reps"), nunca "//site.com" ou "https://…". */
export function safeNext(
  next: string | null | undefined,
  fallback = "/minhas-reps",
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  return next;
}
