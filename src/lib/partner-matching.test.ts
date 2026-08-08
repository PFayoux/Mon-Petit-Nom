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

  test('Given I love a name my partner has not reviewed, When grouping, Then it is filed under Loved with no match tier', () => {
    const mine = { Jean: { status: 'love' as const, gender: 'boy' as const } };

    expect(groupNamesByPartnerMatch(mine, {}, NAMES)).toEqual({
      love: [{ name: 'Jean', myStatus: 'love', matchTier: null }],
      maybe: [],
    });
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

  test('Given I love a name that only appears with a dislike on the partner side, When grouping, Then it is filed under Loved with no match tier', () => {
    const mine = { Jean: { status: 'love' as const, gender: 'boy' as const } };
    const theirs = { Jean: { status: 'dislike' as const, gender: 'both' as const } };

    expect(groupNamesByPartnerMatch(mine, theirs, NAMES)).toEqual({
      love: [{ name: 'Jean', myStatus: 'love', matchTier: null }],
      maybe: [],
    });
  });

  test('Given several entries in the same section, When grouping, Then they come back sorted alphabetically', () => {
    const mine = {
      Zoe: { status: 'love' as const, gender: 'girl' as const },
      Alice: { status: 'love' as const, gender: 'girl' as const },
      Camille: { status: 'love' as const, gender: 'both' as const },
    };

    expect(groupNamesByPartnerMatch(mine, {}, NAMES).love.map((entry) => entry.name)).toEqual([
      'Alice',
      'Camille',
      'Zoe',
    ]);
  });
});
