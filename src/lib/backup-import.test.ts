import { parseBackup } from './backup-import';

function validBackupJson(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    kind: 'backup',
    version: 1,
    displayName: 'Camille',
    reviews: { Jean: { status: 'love', gender: 'boy' } },
    partnerProfiles: [{ displayName: 'Alex', reviews: { Alice: { status: 'maybe', gender: 'girl' } } }],
    activePartnerName: 'Alex',
    ...overrides,
  });
}

describe('parseBackup', () => {
  test('Given a valid backup, When parsing it, Then it returns every field including dislikes', () => {
    const jsonText = validBackupJson({
      reviews: { Jean: { status: 'love', gender: 'boy' }, Bob: { status: 'dislike', gender: 'both' } },
    });

    expect(parseBackup(jsonText)).toEqual({
      kind: 'backup',
      version: 1,
      displayName: 'Camille',
      reviews: { Jean: { status: 'love', gender: 'boy' }, Bob: { status: 'dislike', gender: 'both' } },
      partnerProfiles: [{ displayName: 'Alex', reviews: { Alice: { status: 'maybe', gender: 'girl' } } }],
      activePartnerName: 'Alex',
    });
  });

  test('Given a backup with no active partner, When parsing it, Then activePartnerName stays null', () => {
    expect(parseBackup(validBackupJson({ activePartnerName: null })).activePartnerName).toBeNull();
  });

  test('Given text that is not JSON, When parsing it, Then it throws', () => {
    expect(() => parseBackup('not json')).toThrow();
  });

  test('Given a file with no "kind" field (e.g. a partner-share export), When parsing it, Then it throws', () => {
    const jsonText = JSON.stringify({ displayName: 'Camille', reviews: {} });

    expect(() => parseBackup(jsonText)).toThrow();
  });

  test('Given a backup with an incompatible version, When parsing it, Then it throws', () => {
    expect(() => parseBackup(validBackupJson({ version: 2 }))).toThrow();
  });

  test('Given a backup missing a display name, When parsing it, Then it throws', () => {
    expect(() => parseBackup(validBackupJson({ displayName: '' }))).toThrow();
  });

  test('Given a backup with an invalid review, When parsing it, Then it throws', () => {
    expect(() => parseBackup(validBackupJson({ reviews: { Jean: { status: 'nope', gender: 'boy' } } }))).toThrow();
  });

  test('Given a backup with an invalid partner profile, When parsing it, Then it throws', () => {
    expect(() => parseBackup(validBackupJson({ partnerProfiles: [{ reviews: {} }] }))).toThrow();
  });

  test('Given a backup with no partner profiles, When parsing it, Then it returns an empty array', () => {
    expect(parseBackup(validBackupJson({ partnerProfiles: [] })).partnerProfiles).toEqual([]);
  });
});
