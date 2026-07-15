import { NAMES, getNamesForGender, matchesGenderFilter } from './names';

describe('names dataset', () => {
  test('Given the NAMES dataset, When collecting every entry, Then no name string appears twice', () => {
    const seen = new Set<string>();
    for (const entry of NAMES) {
      expect(seen.has(entry.name)).toBe(false);
      seen.add(entry.name);
    }
  });

  test('Given the NAMES dataset, When checking every entry, Then each has a non-empty name and a valid gender', () => {
    for (const entry of NAMES) {
      expect(entry.name.length).toBeGreaterThan(0);
      expect(['boy', 'girl', 'both']).toContain(entry.gender);
    }
  });

  describe('matchesGenderFilter', () => {
    test('Given a name tagged "boy", When filtering for "boy", Then it matches', () => {
      expect(matchesGenderFilter('boy', 'boy')).toBe(true);
    });

    test('Given a name tagged "boy", When filtering for "girl", Then it does not match', () => {
      expect(matchesGenderFilter('boy', 'girl')).toBe(false);
    });

    test('Given a name tagged "both", When filtering for either "boy" or "girl", Then it matches', () => {
      expect(matchesGenderFilter('both', 'boy')).toBe(true);
      expect(matchesGenderFilter('both', 'girl')).toBe(true);
    });

    test('Given any name, When filtering for "both", Then it always matches', () => {
      expect(matchesGenderFilter('boy', 'both')).toBe(true);
      expect(matchesGenderFilter('girl', 'both')).toBe(true);
      expect(matchesGenderFilter('both', 'both')).toBe(true);
    });
  });

  describe('getNamesForGender', () => {
    test('Given the "both" filter, When getting names for it, Then every name in the dataset is included', () => {
      expect(getNamesForGender('both')).toHaveLength(NAMES.length);
    });

    test('Given the "boy" filter, When getting names for it, Then only boy and both-tagged names are included', () => {
      const result = getNamesForGender('boy');
      expect(result.every((entry) => entry.gender === 'boy' || entry.gender === 'both')).toBe(true);
      expect(result.some((entry) => entry.gender === 'girl')).toBe(false);
    });

    test('Given the "girl" filter, When getting names for it, Then only girl and both-tagged names are included', () => {
      const result = getNamesForGender('girl');
      expect(result.every((entry) => entry.gender === 'girl' || entry.gender === 'both')).toBe(true);
      expect(result.some((entry) => entry.gender === 'boy')).toBe(false);
    });

    test('Given a classically unisex name like "Camille", When filtering for either "boy" or "girl", Then it appears in both results', () => {
      expect(getNamesForGender('boy').some((entry) => entry.name === 'Camille')).toBe(true);
      expect(getNamesForGender('girl').some((entry) => entry.name === 'Camille')).toBe(true);
    });
  });
});
