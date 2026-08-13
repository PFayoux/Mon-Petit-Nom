import { backupSchema, partnerProfileSchema, reviewSchema } from './schemas';

describe('reviewSchema', () => {
  test('Given a valid review, When parsing it, Then it succeeds', () => {
    expect(reviewSchema.safeParse({ status: 'love', gender: 'boy' }).success).toBe(true);
  });

  test('Given an invalid status, When parsing it, Then it fails', () => {
    expect(reviewSchema.safeParse({ status: 'nope', gender: 'boy' }).success).toBe(false);
  });

  test('Given an invalid gender, When parsing it, Then it fails', () => {
    expect(reviewSchema.safeParse({ status: 'love', gender: 'nope' }).success).toBe(false);
  });
});

describe('partnerProfileSchema', () => {
  test('Given a whitespace-only display name, When parsing it, Then it fails', () => {
    expect(partnerProfileSchema.safeParse({ displayName: '   ', reviews: {} }).success).toBe(false);
  });

  test('Given a display name with surrounding whitespace, When parsing it, Then the original string is preserved, not trimmed', () => {
    const result = partnerProfileSchema.safeParse({ displayName: ' Camille ', reviews: {} });

    expect(result.success && result.data.displayName).toBe(' Camille ');
  });

  test('Given a review map with an invalid entry, When parsing it, Then it fails', () => {
    const result = partnerProfileSchema.safeParse({
      displayName: 'Camille',
      reviews: { Jean: { status: 'nope', gender: 'boy' } },
    });

    expect(result.success).toBe(false);
  });
});

describe('backupSchema', () => {
  const VALID_BACKUP = {
    kind: 'backup' as const,
    version: 1 as const,
    displayName: 'Camille',
    reviews: {},
    partnerProfiles: [],
    activePartnerName: null,
  };

  test('Given activePartnerName is null, When parsing it, Then it succeeds', () => {
    expect(backupSchema.safeParse(VALID_BACKUP).success).toBe(true);
  });

  test('Given activePartnerName is a string, When parsing it, Then it succeeds', () => {
    expect(backupSchema.safeParse({ ...VALID_BACKUP, activePartnerName: 'Alex' }).success).toBe(true);
  });

  test('Given activePartnerName is neither a string nor null, When parsing it, Then it fails', () => {
    expect(backupSchema.safeParse({ ...VALID_BACKUP, activePartnerName: 42 }).success).toBe(false);
  });

  test('Given a nested partner profile with an invalid review, When parsing it, Then it fails', () => {
    const result = backupSchema.safeParse({
      ...VALID_BACKUP,
      partnerProfiles: [{ displayName: 'Alex', reviews: { Jean: { status: 'nope', gender: 'boy' } } }],
    });

    expect(result.success).toBe(false);
  });

  test('Given a version other than 1, When parsing it, Then it fails', () => {
    expect(backupSchema.safeParse({ ...VALID_BACKUP, version: 2 }).success).toBe(false);
  });
});
