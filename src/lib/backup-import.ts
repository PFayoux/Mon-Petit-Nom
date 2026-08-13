import type { Backup } from '@/types/name';

import { backupSchema } from './schemas';

// Validates a picked file's content — an externally-authored file is a
// system boundary, unlike the app's own internal state.
export function parseBackup(jsonText: string): Backup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Imported file is not valid JSON.');
  }

  const result = backupSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error('Imported file is not a valid backup.');
  }
  return result.data;
}
