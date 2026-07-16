export type ReviewStatus = 'love' | 'maybe' | 'dislike';

// The name's commonly-associated gender in the static dataset (curation data,
// not a user choice) — see CONTEXT.md's "Genre par défaut" vs "Genre choisi".
export type Gender = 'boy' | 'girl' | 'both';

// boyCount/girlCount are cumulative French birth counts by sex since 1900
// (INSEE first-names file, data.gouv.fr) — a popularity signal for later
// display, not used for gender filtering (see `gender` and CONTEXT.md's
// "Genre par défaut").
//
// originLanguage/originReligion/originCountry are extracted from the French
// Wiktionary etymology text by a one-time LLM batch pass (see
// scripts/enrich-names-etymology.ts and docs/adr/0008). Purely informative —
// null independently of each other when the etymology doesn't mention it, per
// ADR-0002's consequence that this metadata is display-only, never a filter.
export type Name = {
  name: string;
  gender: Gender;
  boyCount: number;
  girlCount: number;
  originLanguage: string | null;
  originReligion: string | null;
  originCountry: string | null;
};

// The user's decision on a name. `gender` here is the "Genre choisi" — always
// 'both' for a dislike (you don't dislike a name for a specific gender).
export type Review = {
  status: ReviewStatus;
  gender: Gender;
};

export type ReviewMap = Record<string, Review>;
