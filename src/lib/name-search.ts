// Accent- and case-insensitive prefix match, e.g. "e" matches "Émile" and
// "Eva" alike — most users won't type accents on a quick filter.
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function matchesNameQuery(name: string, query: string): boolean {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return true;
  return normalizeForSearch(name).startsWith(normalizeForSearch(trimmedQuery));
}
