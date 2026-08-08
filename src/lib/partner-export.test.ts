import { buildPartnerExport } from './partner-export';

describe('buildPartnerExport', () => {
  test('Given no reviews, When building the export, Then it carries the display name with an empty review map', () => {
    expect(buildPartnerExport('Camille', {})).toEqual({ displayName: 'Camille', reviews: {} });
  });

  test('Given a mix of love/maybe/dislike reviews, When building the export, Then only love and maybe are kept', () => {
    const reviews = {
      Jean: { status: 'love' as const, gender: 'boy' as const },
      Alice: { status: 'maybe' as const, gender: 'girl' as const },
      Bob: { status: 'dislike' as const, gender: 'both' as const },
    };

    expect(buildPartnerExport('Camille', reviews)).toEqual({
      displayName: 'Camille',
      reviews: {
        Jean: { status: 'love', gender: 'boy' },
        Alice: { status: 'maybe', gender: 'girl' },
      },
    });
  });
});
