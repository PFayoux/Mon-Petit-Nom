import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { PartnerProfile, ReviewMap } from '@/types/name';

// Only love/maybe ever leave the phone — see ADR-0008 and CONTEXT.md's
// "Profil partenaire".
export function buildPartnerExport(displayName: string, reviews: ReviewMap): PartnerProfile {
  const shared: ReviewMap = {};
  for (const [name, review] of Object.entries(reviews)) {
    if (review.status === 'love' || review.status === 'maybe') {
      shared[name] = review;
    }
  }
  return { displayName, reviews: shared };
}

function exportFileName(displayName: string): string {
  const slug = displayName
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return `mon-petit-nom-${slug || 'liste'}.json`;
}

export async function exportPartnerProfile(profile: PartnerProfile): Promise<void> {
  const file = new File(Paths.cache, exportFileName(profile.displayName));
  file.create({ overwrite: true });
  file.write(JSON.stringify(profile));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
}
