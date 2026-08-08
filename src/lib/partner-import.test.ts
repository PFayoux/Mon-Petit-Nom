import { parsePartnerProfile } from './partner-import';

describe('parsePartnerProfile', () => {
  test('Given a valid partner export, When parsing it, Then it returns the display name and reviews', () => {
    const jsonText = JSON.stringify({
      displayName: 'Camille',
      reviews: { Jean: { status: 'love', gender: 'boy' }, Alice: { status: 'maybe', gender: 'girl' } },
    });

    expect(parsePartnerProfile(jsonText)).toEqual({
      displayName: 'Camille',
      reviews: { Jean: { status: 'love', gender: 'boy' }, Alice: { status: 'maybe', gender: 'girl' } },
    });
  });

  test('Given text that is not JSON, When parsing it, Then it throws', () => {
    expect(() => parsePartnerProfile('not json')).toThrow();
  });

  test('Given JSON missing a displayName, When parsing it, Then it throws', () => {
    expect(() => parsePartnerProfile(JSON.stringify({ reviews: {} }))).toThrow();
  });

  test('Given JSON missing a reviews map, When parsing it, Then it throws', () => {
    expect(() => parsePartnerProfile(JSON.stringify({ displayName: 'Camille' }))).toThrow();
  });

  test('Given a review with an invalid status, When parsing it, Then it throws', () => {
    const jsonText = JSON.stringify({
      displayName: 'Camille',
      reviews: { Jean: { status: 'nope', gender: 'boy' } },
    });

    expect(() => parsePartnerProfile(jsonText)).toThrow();
  });

  test('Given an empty reviews map, When parsing it, Then it returns a profile with no reviews', () => {
    const jsonText = JSON.stringify({ displayName: 'Camille', reviews: {} });

    expect(parsePartnerProfile(jsonText)).toEqual({ displayName: 'Camille', reviews: {} });
  });
});
