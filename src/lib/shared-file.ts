export type SharedFileKind = 'backup' | 'partner' | 'unrecognized';

// A file opened via "Open with Mon Petit Nom" (see ADR-0011) could be either
// of our own JSON formats — a backup (tagged `kind: 'backup'`) or a
// partner-share export (untagged, `{ displayName, reviews }`) — or an
// unrelated JSON file, since Android can't restrict "Open with" more
// precisely than the `application/json` MIME type. This only tells the two
// formats apart structurally; parseBackup/parsePartnerProfile still validate
// the rest of the shape once the kind is known.
export function identifySharedFileKind(jsonText: string): SharedFileKind {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return 'unrecognized';
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return 'unrecognized';
  }

  const { kind, displayName, reviews } = parsed as Record<string, unknown>;

  if (kind === 'backup') {
    return 'backup';
  }
  if (typeof displayName === 'string' && typeof reviews === 'object' && reviews !== null) {
    return 'partner';
  }
  return 'unrecognized';
}
