import { groupByFirstLetter } from './alphabetical-grouping';

describe('groupByFirstLetter', () => {
  test('Given an empty list, When grouped, Then no sections are returned', () => {
    expect(groupByFirstLetter([])).toEqual([]);
  });

  test('Given pre-sorted names sharing first letters, When grouped, Then each section holds all names for that letter in order', () => {
    expect(groupByFirstLetter(['Amandine', 'Armand', 'Bastien', 'Boris'])).toEqual([
      { title: 'A', data: ['Amandine', 'Armand'] },
      { title: 'B', data: ['Bastien', 'Boris'] },
    ]);
  });

  test('Given a single name, When grouped, Then it forms its own one-item section', () => {
    expect(groupByFirstLetter(['Zoé'])).toEqual([{ title: 'Z', data: ['Zoé'] }]);
  });

  test('Given an accented first letter, When grouped, Then it joins the base letter\'s section rather than getting its own', () => {
    expect(groupByFirstLetter(['Edouard', 'Émile', 'Eva'])).toEqual([
      { title: 'E', data: ['Edouard', 'Émile', 'Eva'] },
    ]);
  });

  test('Given names that revisit an earlier letter out of alphabetical order, When grouped, Then each occurrence starts a new section rather than merging with the earlier one', () => {
    expect(groupByFirstLetter(['Amandine', 'Bastien', 'Armand'])).toEqual([
      { title: 'A', data: ['Amandine'] },
      { title: 'B', data: ['Bastien'] },
      { title: 'A', data: ['Armand'] },
    ]);
  });
});
