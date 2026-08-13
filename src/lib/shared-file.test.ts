import { identifySharedFileKind } from './shared-file';

describe('identifySharedFileKind', () => {
  test('Given a file with kind "backup", When identifying it, Then it is recognized as a backup', () => {
    const jsonText = JSON.stringify({
      kind: 'backup',
      version: 1,
      displayName: 'Camille',
      reviews: {},
      partnerProfiles: [],
      activePartnerName: null,
    });

    expect(identifySharedFileKind(jsonText)).toBe('backup');
  });

  test('Given a backup with an otherwise invalid shape, When identifying it, Then it is still recognized as a backup by its kind alone', () => {
    const jsonText = JSON.stringify({ kind: 'backup', reviews: 'not a map' });

    expect(identifySharedFileKind(jsonText)).toBe('backup');
  });

  test('Given a partner-share export (displayName + reviews, no kind), When identifying it, Then it is recognized as a partner list', () => {
    const jsonText = JSON.stringify({ displayName: 'Camille', reviews: { Jean: { status: 'love', gender: 'boy' } } });

    expect(identifySharedFileKind(jsonText)).toBe('partner');
  });

  test('Given text that is not JSON, When identifying it, Then it is unrecognized', () => {
    expect(identifySharedFileKind('not json')).toBe('unrecognized');
  });

  test('Given a JSON array, When identifying it, Then it is unrecognized', () => {
    expect(identifySharedFileKind(JSON.stringify(['Jean', 'Alice']))).toBe('unrecognized');
  });

  test('Given an unrelated JSON object, When identifying it, Then it is unrecognized', () => {
    expect(identifySharedFileKind(JSON.stringify({ foo: 'bar' }))).toBe('unrecognized');
  });

  test('Given an object with a displayName but no reviews map, When identifying it, Then it is unrecognized', () => {
    expect(identifySharedFileKind(JSON.stringify({ displayName: 'Camille' }))).toBe('unrecognized');
  });
});
