import { matchesNameQuery } from './name-search';

describe('matchesNameQuery', () => {
  test('Given an empty query, When matching any name, Then it matches', () => {
    expect(matchesNameQuery('Camille', '')).toBe(true);
    expect(matchesNameQuery('Camille', '   ')).toBe(true);
  });

  test('Given a query matching the start of the name, When matching, Then it matches', () => {
    expect(matchesNameQuery('Camille', 'Cam')).toBe(true);
  });

  test('Given a query not matching the start of the name, When matching, Then it does not match', () => {
    expect(matchesNameQuery('Camille', 'mille')).toBe(false);
    expect(matchesNameQuery('Camille', 'Xam')).toBe(false);
  });

  test('Given a query in a different case, When matching, Then it still matches', () => {
    expect(matchesNameQuery('Camille', 'cam')).toBe(true);
    expect(matchesNameQuery('camille', 'CAM')).toBe(true);
  });

  test('Given a query without accents, When matching an accented name, Then it still matches', () => {
    expect(matchesNameQuery('Émile', 'e')).toBe(true);
    expect(matchesNameQuery('Élise', 'ELI')).toBe(true);
  });

  test('Given a query with accents, When matching, Then accented and plain letters are treated the same', () => {
    expect(matchesNameQuery('Emile', 'é')).toBe(true);
  });
});
