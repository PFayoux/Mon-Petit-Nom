export type ReviewStatus = 'love' | 'maybe' | 'dislike';

// The name's commonly-associated gender in the static dataset (curation data,
// not a user choice) — see CONTEXT.md's "Genre par défaut" vs "Genre choisi".
export type Gender = 'boy' | 'girl' | 'both';

export type Name = {
  name: string;
  gender: Gender;
};

// The user's decision on a name. `gender` here is the "Genre choisi" — always
// 'both' for a dislike (you don't dislike a name for a specific gender).
export type Review = {
  status: ReviewStatus;
  gender: Gender;
};

export type ReviewMap = Record<string, Review>;
