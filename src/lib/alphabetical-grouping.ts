import { normalizeForSearch } from './name-search';

export type AlphabeticalSection = { title: string; data: string[] };

// Names arrive already sorted alphabetically (see groupNamesByStatus), so a
// single forward pass is enough — a new section starts whenever the
// accent-stripped first letter changes. Accented first letters group under
// their base letter ("Émile" under "E", alongside "Eva") rather than getting
// their own header, matching the accent-insensitive search (see
// CONTEXT.md's "Recherche").
export function groupByFirstLetter(names: readonly string[]): AlphabeticalSection[] {
  const sections: AlphabeticalSection[] = [];
  for (const name of names) {
    const letter = normalizeForSearch(name).charAt(0).toUpperCase();
    const current = sections.at(-1);
    if (current?.title === letter) {
      current.data.push(name);
    } else {
      sections.push({ title: letter, data: [name] });
    }
  }
  return sections;
}
