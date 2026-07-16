export function getWiktionaryUrl(name: string): string {
  return `https://fr.wiktionary.org/wiki/${encodeURIComponent(name)}`;
}
