import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { Backup, PartnerProfile, ReviewMap } from '@/types/name';

const BACKUP_VERSION = 1;

// Unlike buildPartnerExport, a backup keeps every review including `dislike`,
// plus the rest of the user's local state — it's meant to restore this same
// phone, not to be read by someone else (see ADR-0010).
export function buildBackup(
  displayName: string,
  reviews: ReviewMap,
  partnerProfiles: PartnerProfile[],
  activePartnerName: string | null
): Backup {
  return { kind: 'backup', version: BACKUP_VERSION, displayName, reviews, partnerProfiles, activePartnerName };
}

function backupFileName(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `mon-petit-nom-sauvegarde-${date}.json`;
}

export async function exportBackup(backup: Backup): Promise<void> {
  const file = new File(Paths.cache, backupFileName());
  file.create({ overwrite: true });
  file.write(JSON.stringify(backup));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
}
