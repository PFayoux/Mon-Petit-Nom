import type { Gender, PartnerProfile, Review, ReviewStatus } from '@/types/name';

const REVIEW_STATUSES: ReviewStatus[] = ['love', 'maybe', 'dislike'];
const GENDERS: Gender[] = ['boy', 'girl', 'both'];

function isReview(value: unknown): value is Review {
  if (typeof value !== 'object' || value === null) return false;
  const { status, gender } = value as Record<string, unknown>;
  return (
    typeof status === 'string' &&
    REVIEW_STATUSES.includes(status as ReviewStatus) &&
    typeof gender === 'string' &&
    GENDERS.includes(gender as Gender)
  );
}

// Validates a picked file's content — an externally-authored file is a
// system boundary, unlike the app's own internal state.
export function parsePartnerProfile(jsonText: string): PartnerProfile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Imported file is not valid JSON.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Imported file does not contain a partner profile.');
  }

  const { displayName, reviews } = parsed as Record<string, unknown>;

  if (typeof displayName !== 'string' || displayName.trim().length === 0) {
    throw new Error('Imported file is missing a display name.');
  }
  if (typeof reviews !== 'object' || reviews === null || Array.isArray(reviews)) {
    throw new Error('Imported file is missing a review map.');
  }
  if (!Object.values(reviews).every(isReview)) {
    throw new Error('Imported file contains an invalid review.');
  }

  return { displayName, reviews: reviews as PartnerProfile['reviews'] };
}
