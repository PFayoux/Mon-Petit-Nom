import type { Backup, Gender, PartnerProfile, Review, ReviewMap, ReviewStatus } from '@/types/name';

const REVIEW_STATUSES: ReviewStatus[] = ['love', 'maybe', 'dislike'];
const GENDERS: Gender[] = ['boy', 'girl', 'both'];
const BACKUP_VERSION = 1;

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

function isReviewMap(value: unknown): value is ReviewMap {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.values(value).every(isReview);
}

function isPartnerProfile(value: unknown): value is PartnerProfile {
  if (typeof value !== 'object' || value === null) return false;
  const { displayName, reviews } = value as Record<string, unknown>;
  return typeof displayName === 'string' && displayName.trim().length > 0 && isReviewMap(reviews);
}

// Validates a picked file's content — an externally-authored file is a
// system boundary, unlike the app's own internal state. `kind`/`version` are
// checked before anything else so a partner-share file (or a future backup
// format) fails with a message that actually explains what went wrong.
export function parseBackup(jsonText: string): Backup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Imported file is not valid JSON.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Imported file does not contain a backup.');
  }

  const { kind, version, displayName, reviews, partnerProfiles, activePartnerName } = parsed as Record<
    string,
    unknown
  >;

  if (kind !== 'backup') {
    throw new Error('Imported file is not a Mon Petit Nom backup.');
  }
  if (version !== BACKUP_VERSION) {
    throw new Error('This backup was made with an incompatible version of the app.');
  }
  if (typeof displayName !== 'string' || displayName.trim().length === 0) {
    throw new Error('Imported file is missing a display name.');
  }
  if (!isReviewMap(reviews)) {
    throw new Error('Imported file has an invalid review map.');
  }
  if (!Array.isArray(partnerProfiles) || !partnerProfiles.every(isPartnerProfile)) {
    throw new Error('Imported file has invalid partner lists.');
  }
  if (activePartnerName !== null && typeof activePartnerName !== 'string') {
    throw new Error('Imported file has an invalid active partner.');
  }

  return { kind: 'backup', version: BACKUP_VERSION, displayName, reviews, partnerProfiles, activePartnerName };
}
