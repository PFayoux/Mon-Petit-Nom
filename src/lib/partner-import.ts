import type { PartnerProfile } from '@/types/name';

import { partnerProfileSchema } from './schemas';

// Validates a picked file's content — an externally-authored file is a
// system boundary, unlike the app's own internal state.
export function parsePartnerProfile(jsonText: string): PartnerProfile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Imported file is not valid JSON.');
  }

  const result = partnerProfileSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error('Imported file is not a valid partner profile.');
  }
  return result.data;
}
