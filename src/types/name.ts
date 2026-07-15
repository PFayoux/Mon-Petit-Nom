export type ReviewStatus = 'love' | 'maybe' | 'dislike';

export type ReviewMap = Record<string, ReviewStatus>;

// The name's commonly-associated gender in the static dataset (curation data,
// not a user choice) — see CONTEXT.md's "Genre par défaut" vs "Genre choisi".
export type Gender = 'boy' | 'girl' | 'both';

export type Name = {
  name: string;
  gender: Gender;
};
