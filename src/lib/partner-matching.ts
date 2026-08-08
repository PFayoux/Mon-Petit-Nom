import type { ReviewMap } from '@/types/name';

// See CONTEXT.md's "Correspondance": strong = love+love, partial = love+maybe
// (either direction), soft = maybe+maybe, null = no match (a pure discovery
// row, or a name only one side reviewed).
export type MatchTier = 'strong' | 'partial' | 'soft';

export type MatchedEntry = {
  name: string;
  // Undefined for a "découverte" — the partner loved/maybe'd this name, but
  // the user hasn't reviewed it at all yet.
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

// Given the user's own reviews and the active partner's imported reviews,
// groups every name either side loved/maybe'd — filed under the user's own
// status when they have one, or the partner's status for a discovery row.
export function groupNamesByPartnerMatch(
  myReviews: ReviewMap,
  partnerReviews: ReviewMap,
  names: readonly { name: string }[]
): PartnerMatches {
  const groups: PartnerMatches = { love: [], maybe: [] };

  for (const { name } of names) {
    const myStatus = toLoveOrMaybe(myReviews[name]?.status);
    const partnerStatus = toLoveOrMaybe(partnerReviews[name]?.status);
    if (!myStatus && !partnerStatus) continue;

    const matchTier = myStatus && partnerStatus ? getMatchTier(myStatus, partnerStatus) : null;
    const sectionKey = myStatus ?? partnerStatus!;
    groups[sectionKey].push({ name, myStatus, matchTier });
  }

  for (const entries of Object.values(groups)) {
    entries.sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups;
}
