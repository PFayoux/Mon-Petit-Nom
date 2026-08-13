import { buildBackup } from './backup-export';

describe('buildBackup', () => {
  test('Given no reviews or partner data, When building the backup, Then it carries the display name with empty collections', () => {
    expect(buildBackup('Camille', {}, [], null)).toEqual({
      kind: 'backup',
      version: 1,
      displayName: 'Camille',
      reviews: {},
      partnerProfiles: [],
      activePartnerName: null,
    });
  });

  test('Given a mix of love/maybe/dislike reviews, When building the backup, Then every status is kept, unlike a partner export', () => {
    const reviews = {
      Jean: { status: 'love' as const, gender: 'boy' as const },
      Alice: { status: 'maybe' as const, gender: 'girl' as const },
      Bob: { status: 'dislike' as const, gender: 'both' as const },
    };

    expect(buildBackup('Camille', reviews, [], null).reviews).toEqual(reviews);
  });

  test('Given imported partner profiles and an active partner, When building the backup, Then both are carried over', () => {
    const partnerProfiles = [{ displayName: 'Alex', reviews: { Jean: { status: 'love' as const, gender: 'boy' as const } } }];

    expect(buildBackup('Camille', {}, partnerProfiles, 'Alex')).toEqual({
      kind: 'backup',
      version: 1,
      displayName: 'Camille',
      reviews: {},
      partnerProfiles,
      activePartnerName: 'Alex',
    });
  });
});
