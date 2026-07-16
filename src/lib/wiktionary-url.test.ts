import { getWiktionaryUrl } from './wiktionary-url';

describe('getWiktionaryUrl', () => {
  test('Given a plain name, When building the URL, Then it targets the French Wiktionary entry', () => {
    expect(getWiktionaryUrl('Jean')).toBe('https://fr.wiktionary.org/wiki/Jean');
  });

  test('Given a hyphenated name, When building the URL, Then the hyphen is kept as-is', () => {
    expect(getWiktionaryUrl('Anne-Laure')).toBe('https://fr.wiktionary.org/wiki/Anne-Laure');
  });

  test('Given an accented name, When building the URL, Then the accent is percent-encoded', () => {
    expect(getWiktionaryUrl('Gaëlle')).toBe('https://fr.wiktionary.org/wiki/Ga%C3%ABlle');
  });
});
