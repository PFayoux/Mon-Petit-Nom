import { matchesReviewGenderFilter } from '@/data/names';
import type { Gender, ReviewMap } from '@/types/name';

// See CONTEXT.md's "Correspondance": strong = love+love, partial = love+maybe
// (either direction), soft = maybe+maybe, null = no match — either a pure
// discovery row (the user never reviewed the name at all), or a name both
// sides reviewed but for incompatible genders (see gendersCorrespond below).
export type MatchTier = 'strong' | 'partial' | 'soft';

export type MatchedEntry = {
  name: string;
  // The user's own status, when they have one — even if it didn't produce a
  // match (e.g. reviewed for a gender incompatible with the partner's own
  // choice). Undefined only when the user never reviewed this name at all.
  myStatus?: 'love' | 'maybe';
  matchTier: MatchTier | null;
};

export type PartnerMatches = {
  love: MatchedEntry[];
  maybe: MatchedEntry[];
};

function getMatchTier(myStatus: 'love' | 'maybe', partnerStatus: 'love' | 'maybe'): MatchTier {
  if (myStatus === 'love' && partnerStatus === 'love') return 'strong';
  if (myStatus === 'maybe' && partnerStatus === 'maybe') return 'soft';
  return 'partial';
}

// dislike never factors in on either side: the user's own dislikes are
// excluded outright, and a partner's dislike can't reach this function in
// practice since exported profiles never contain one (ADR-0008) — but a
// defensive check keeps this correct even if that ever changes.
function toLoveOrMaybe(status: string | undefined): 'love' | 'maybe' | undefined {
  return status === 'love' || status === 'maybe' ? status : undefined;
}

// 'both' is a wildcard on either side — choosing it means "I don't rule out
// either gender", so it never blocks a match with a specific choice on the
// other side (see CONTEXT.md's "Correspondance" and ADR-0009).
function gendersCorrespond(a: Gender, b: Gender): boolean {
  return a === b || a === 'both' || b === 'both';
}

// Given the user's own reviews and the active partner's imported reviews,
// groups every name the *partner* loved/maybe'd — this is the partner's
// list, so a name only the user reviewed (with no opinion from the partner)
// never appears here. Filed under the user's own status when it produces a
// real correspondence (status *and* gender both compatible — ADR-0009), or
// the partner's status otherwise, so the partner's own picks always stay
// visible even when the user's own review (if any) disagrees.
export function groupNamesByPartnerMatch(
  myReviews: ReviewMap,
  partnerReviews: ReviewMap,
  names: readonly { name: string }[],
  selectedGender: Gender | 'all' = 'all'
): PartnerMatches {
  const groups: PartnerMatches = { love: [], maybe: [] };

  for (const { name } of names) {
    const myReview = myReviews[name];
    const partnerReview = partnerReviews[name];
    const myStatus = toLoveOrMaybe(myReview?.status);
    const partnerStatus = toLoveOrMaybe(partnerReview?.status);
    if (!partnerStatus) continue;

    // This tab is the partner's list, so which gender sub-tab a name shows
    // under always follows the partner's own choice, never the user's own.
    if (selectedGender !== 'all' && !matchesReviewGenderFilter(partnerReview.gender, selectedGender)) continue;

    const isMatch = myStatus !== undefined && gendersCorrespond(myReview!.gender, partnerReview.gender);
    const matchTier = isMatch ? getMatchTier(myStatus!, partnerStatus) : null;
    const sectionKey = isMatch ? myStatus! : partnerStatus;
    groups[sectionKey].push({ name, myStatus, matchTier });
  }

  for (const entries of Object.values(groups)) {
    entries.sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups;
}
