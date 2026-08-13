import { z } from 'zod';

// Mirrors src/types/name.ts — the single source of truth for validating
// externally-authored JSON (partner exports, backups) against our own
// shapes. See CONTEXT.md's "Review", "Profil partenaire", "Sauvegarde".
export const reviewStatusSchema = z.enum(['love', 'maybe', 'dislike']);
export const genderSchema = z.enum(['boy', 'girl', 'both']);

// Rejects a blank/whitespace-only name without altering the value on
// success — unlike `.trim()`, which would also change the returned string.
const nonBlankString = z.string().refine((value) => value.trim().length > 0, 'must not be blank');

export const reviewSchema = z.object({
  status: reviewStatusSchema,
  gender: genderSchema,
});

export const reviewMapSchema = z.record(z.string(), reviewSchema);

export const partnerProfileSchema = z.object({
  displayName: nonBlankString,
  reviews: reviewMapSchema,
});

export const backupSchema = z.object({
  kind: z.literal('backup'),
  version: z.literal(1),
  displayName: nonBlankString,
  reviews: reviewMapSchema,
  partnerProfiles: z.array(partnerProfileSchema),
  activePartnerName: z.string().nullable(),
});
