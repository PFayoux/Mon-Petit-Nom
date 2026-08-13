import { z } from 'zod';

export type SharedFileKind = 'backup' | 'partner' | 'unrecognized';

// Deliberately looser than backupSchema/partnerProfileSchema (src/lib/schemas.ts)
// — this only tells the two formats apart structurally, by their shape alone,
// so a file tagged `kind: 'backup'` is still routed to the backup flow even
// if the rest of it turns out invalid; parseBackup/parsePartnerProfile do the
// real validation once the kind is known.
const backupTagSchema = z.object({ kind: z.literal('backup') });
const partnerShapeSchema = z.object({
  displayName: z.string(),
  reviews: z.record(z.string(), z.unknown()),
});

// A file opened via "Open with Mon Petit Nom" (see ADR-0011) could be either
// of our own JSON formats — a backup (tagged `kind: 'backup'`) or a
// partner-share export (untagged, `{ displayName, reviews }`) — or an
// unrelated JSON file, since Android can't restrict "Open with" more
// precisely than the `application/json` MIME type.
export function identifySharedFileKind(jsonText: string): SharedFileKind {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return 'unrecognized';
  }

  if (backupTagSchema.safeParse(parsed).success) {
    return 'backup';
  }
  if (partnerShapeSchema.safeParse(parsed).success) {
    return 'partner';
  }
  return 'unrecognized';
}
