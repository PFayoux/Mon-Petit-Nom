import { groupNamesByPartnerMatch } from './partner-matching';

const NAMES = [{ name: 'Jean' }, { name: 'Alice' }, { name: 'Camille' }, { name: 'Zoe' }];

describe('groupNamesByPartnerMatch', () => {
  test('Given no reviews on either side, When grouping, Then both sections are empty', () => {
    expect(groupNamesByPartnerMatch({}, {}, NAMES)).toEqual({ love: [], maybe: [] });
  });

  test('Given both love the same name, When grouping, Then it is a strong match filed under Loved', () => {
    const mine = { Jean: { status: 'love' as const, gender: 'boy' as const } };
    const theirs = { Jean: { status: 'love' as const, gender: 'boy' as const } };

    expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
      love: [{ name: 'Jean', myStatus: 'love', matchTier: 'strong' }],
      maybe: [],
    });
  });

  test('Given I love a name and my partner maybes it, When grouping, Then it is a partial match filed under Loved', () => {
    const mine = { Jean: { status: 'love' as const, gender: 'boy' as const } };
    const theirs = { Jean: { status: 'maybe' as const, gender: 'boy' as const } };

    expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
      love: [{ name: 'Jean', myStatus: 'love', matchTier: 'partial' }],
      maybe: [],
    });
  });

  test('Given I maybe a name and my partner loves it, When grouping, Then it is a partial match filed under Maybe', () => {
    const mine = { Jean: { status: 'maybe' as const, gender: 'boy' as const } };
    const theirs = { Jean: { status: 'love' as const, gender: 'boy' as const } };

    expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
      love: [],
      maybe: [{ name: 'Jean', myStatus: 'maybe', matchTier: 'partial' }],
    });
  });

  test('Given both maybe the same name, When grouping, Then it is a soft match filed under Maybe', () => {
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

  describe('filtering by gender', () => {
    test('Given a boy-gendered match, When filtering by "girl", Then it is excluded', () => {
      const mine = { Jean: { status: 'love' as const, gender: 'boy' as const } };
      const theirs = { Jean: { status: 'love' as const, gender: 'boy' as const } };

      expect(groupNamesByPartnerMatch(mine, theirs, NAMES, 'girl')).toEqual({ love: [], maybe: [] });
    });

    test('Given a boy-gendered match, When filtering by "boy", Then it is included', () => {
      const mine = { Jean: { status: 'love' as const, gender: 'boy' as const } };
      const theirs = { Jean: { status: 'love' as const, gender: 'boy' as const } };

      expect(groupNamesByPartnerMatch(mine, theirs, NAMES, 'boy')).toEqual({
        love: [{ name: 'Jean', myStatus: 'love', matchTier: 'strong' }],
        maybe: [],
      });
    });

    test('Given a discovery row (no review of my own), When filtering by gender, Then the partner\'s chosen gender is used', () => {
      const theirs = { Jean: { status: 'love' as const, gender: 'girl' as const } };

      expect(groupNamesByPartnerMatch({}, theirs, NAMES, 'girl').love).toHaveLength(1);
      expect(groupNamesByPartnerMatch({}, theirs, NAMES, 'boy')).toEqual({ love: [], maybe: [] });
    });

    test('Given a match where my chosen gender differs from my partner\'s, When filtering, Then my own chosen gender wins', () => {
      const mine = { Jean: { status: 'love' as const, gender: 'boy' as const } };
      const theirs = { Jean: { status: 'love' as const, gender: 'girl' as const } };

      expect(groupNamesByPartnerMatch(mine, theirs, NAMES, 'boy').love).toHaveLength(1);
      expect(groupNamesByPartnerMatch(mine, theirs, NAMES, 'girl')).toEqual({ love: [], maybe: [] });
    });
  });
});
