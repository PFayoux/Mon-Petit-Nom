import { groupNamesByPartnerMatch } from './partner-matching';

const NAMES = [{ name: 'Jean' }, { name: 'Alice' }, { name: 'Camille' }, { name: 'Zoe' }];

describe('groupNamesByPartnerMatch', () => {
  test('Given no reviews on either side, When grouping, Then both sections are empty', () => {
    expect(groupNamesByPartnerMatch({}, {}, NAMES)).toEqual({ love: [], maybe: [] });
  });

  test('Given both love the same name for the same gender, When grouping, Then it is a strong match filed under Loved', () => {
    const mine = { Jean: { status: 'love' as const, gender: 'boy' as const } };
    const theirs = { Jean: { status: 'love' as const, gender: 'boy' as const } };

    expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
      love: [{ name: 'Jean', myStatus: 'love', matchTier: 'strong' }],
      maybe: [],
    });
  });

  test('Given I love a name and my partner maybes it for the same gender, When grouping, Then it is a partial match filed under Loved', () => {
    const mine = { Jean: { status: 'love' as const, gender: 'boy' as const } };
    const theirs = { Jean: { status: 'maybe' as const, gender: 'boy' as const } };

    expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
      love: [{ name: 'Jean', myStatus: 'love', matchTier: 'partial' }],
      maybe: [],
    });
  });

  test('Given I maybe a name and my partner loves it for the same gender, When grouping, Then it is a partial match filed under Maybe', () => {
    const mine = { Jean: { status: 'maybe' as const, gender: 'boy' as const } };
    const theirs = { Jean: { status: 'love' as const, gender: 'boy' as const } };

    expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
      love: [],
      maybe: [{ name: 'Jean', myStatus: 'maybe', matchTier: 'partial' }],
    });
  });

  test('Given both maybe the same name for the same gender, When grouping, Then it is a soft match filed under Maybe', () => {
    const mine = { Jean: { status: 'maybe' as const, gender: 'boy' as const } };
    const theirs = { Jean: { status: 'maybe' as const, gender: 'boy' as const } };

    expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
      love: [],
      maybe: [{ name: 'Jean', myStatus: 'maybe', matchTier: 'soft' }],
    });
  });

  test('Given I love a name my partner has not reviewed, When grouping, Then it does not appear at all — this is the partner\'s list', () => {
    const mine = { Jean: { status: 'love' as const, gender: 'boy' as const } };

    expect(groupNamesByPartnerMatch(mine, {}, NAMES)).toEqual({ love: [], maybe: [] });
  });

  test('Given my partner loves a name I have not reviewed, When grouping, Then it is a discovery row filed under Loved', () => {
    const theirs = { Jean: { status: 'love' as const, gender: 'boy' as const } };

    expect(groupNamesByPartnerMatch({}, theirs, NAMES)).toEqual({
      love: [{ name: 'Jean', myStatus: undefined, matchTier: null }],
      maybe: [],
    });
  });

  test('Given I dislike a name my partner loves, When grouping, Then it is treated as a discovery row, not a match', () => {
    const mine = { Jean: { status: 'dislike' as const, gender: 'both' as const } };
    const theirs = { Jean: { status: 'love' as const, gender: 'boy' as const } };

    expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
      love: [{ name: 'Jean', myStatus: undefined, matchTier: null }],
      maybe: [],
    });
  });

  test('Given I love a name that my partner dislikes, When grouping, Then it does not appear at all', () => {
    const mine = { Jean: { status: 'love' as const, gender: 'boy' as const } };
    const theirs = { Jean: { status: 'dislike' as const, gender: 'both' as const } };

    expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({ love: [], maybe: [] });
  });

  test('Given several names the partner loved, When grouping, Then they come back sorted alphabetically', () => {
    const theirs = {
      Zoe: { status: 'love' as const, gender: 'girl' as const },
      Alice: { status: 'love' as const, gender: 'girl' as const },
      Camille: { status: 'love' as const, gender: 'both' as const },
    };

    expect(groupNamesByPartnerMatch({}, theirs, NAMES).love.map((entry) => entry.name)).toEqual([
      'Alice',
      'Camille',
      'Zoe',
    ]);
  });

  describe('gender compatibility gates the match itself', () => {
    test('Given I love a name for a boy and my partner loves it for a girl, When grouping, Then it is not a match — filed under the partner\'s own gender/status, with my status still recorded', () => {
      const mine = { Camille: { status: 'love' as const, gender: 'boy' as const } };
      const theirs = { Camille: { status: 'love' as const, gender: 'girl' as const } };

      expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
        love: [{ name: 'Camille', myStatus: 'love', matchTier: null }],
        maybe: [],
      });
    });

    test('Given incompatible genders, When filtering by the gender I chose, Then the name does not appear (it only follows the partner\'s gender)', () => {
      const mine = { Camille: { status: 'love' as const, gender: 'boy' as const } };
      const theirs = { Camille: { status: 'love' as const, gender: 'girl' as const } };

      expect(groupNamesByPartnerMatch(mine, theirs, NAMES, 'boy')).toEqual({ love: [], maybe: [] });
    });

    test('Given incompatible genders, When filtering by the gender the partner chose, Then the name appears without a match tier', () => {
      const mine = { Camille: { status: 'love' as const, gender: 'boy' as const } };
      const theirs = { Camille: { status: 'love' as const, gender: 'girl' as const } };

      expect(groupNamesByPartnerMatch(mine, theirs, NAMES, 'girl')).toEqual({
        love: [{ name: 'Camille', myStatus: 'love', matchTier: null }],
        maybe: [],
      });
    });

    test('Given I chose "both" and my partner chose a specific gender, When grouping, Then it is a match filed under my status', () => {
      const mine = { Camille: { status: 'love' as const, gender: 'both' as const } };
      const theirs = { Camille: { status: 'love' as const, gender: 'girl' as const } };

      expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
        love: [{ name: 'Camille', myStatus: 'love', matchTier: 'strong' }],
        maybe: [],
      });
    });

    test('Given I chose "both" and my partner chose a specific gender, When filtering by that gender, Then it is included', () => {
      const mine = { Camille: { status: 'love' as const, gender: 'both' as const } };
      const theirs = { Camille: { status: 'love' as const, gender: 'girl' as const } };

      expect(groupNamesByPartnerMatch(mine, theirs, NAMES, 'girl').love).toHaveLength(1);
    });

    test('Given my partner chose "both" and I chose a specific gender, When grouping, Then it is a match filed under my status', () => {
      const mine = { Camille: { status: 'love' as const, gender: 'girl' as const } };
      const theirs = { Camille: { status: 'love' as const, gender: 'both' as const } };

      expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
        love: [{ name: 'Camille', myStatus: 'love', matchTier: 'strong' }],
        maybe: [],
      });
    });

    test('Given my partner chose "both", When filtering by either specific gender, Then the name appears under both', () => {
      const theirs = { Camille: { status: 'love' as const, gender: 'both' as const } };

      expect(groupNamesByPartnerMatch({}, theirs, NAMES, 'boy').love).toHaveLength(1);
      expect(groupNamesByPartnerMatch({}, theirs, NAMES, 'girl').love).toHaveLength(1);
    });

    test('Given I disliked a name (forced to gender "both") and my partner loved it for a girl, When filtering by "boy", Then it does not leak into the boy tab', () => {
      const mine = { Camille: { status: 'dislike' as const, gender: 'both' as const } };
      const theirs = { Camille: { status: 'love' as const, gender: 'girl' as const } };

      expect(groupNamesByPartnerMatch(mine, theirs, NAMES, 'boy')).toEqual({ love: [], maybe: [] });
      expect(groupNamesByPartnerMatch(mine, theirs, NAMES, 'girl').love).toHaveLength(1);
    });

    test('Given I maybe a name for a girl and my partner loves it for a boy, When grouping, Then it is not a match — filed under the partner\'s Loved section, not mine', () => {
      const mine = { Camille: { status: 'maybe' as const, gender: 'girl' as const } };
      const theirs = { Camille: { status: 'love' as const, gender: 'boy' as const } };

      expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
        love: [{ name: 'Camille', myStatus: 'maybe', matchTier: null }],
        maybe: [],
      });
    });
  });
});
