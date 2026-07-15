import { formatPopularityCount } from './format-count';

describe('formatPopularityCount', () => {
  test('Given a count under 1000, When formatted, Then it is shown as-is', () => {
    expect(formatPopularityCount(0)).toBe('0');
    expect(formatPopularityCount(71)).toBe('71');
    expect(formatPopularityCount(999)).toBe('999');
  });

  test('Given a count in the thousands, When formatted, Then it is rounded to the nearest thousand with a "k" suffix', () => {
    expect(formatPopularityCount(1000)).toBe('1k');
    expect(formatPopularityCount(33998)).toBe('34k');
    expect(formatPopularityCount(289564)).toBe('290k');
    expect(formatPopularityCount(999499)).toBe('999k');
  });

  test('Given a count in the millions, When formatted, Then it is rounded to the nearest million with an "M" suffix', () => {
    expect(formatPopularityCount(1_000_000)).toBe('1M');
    expect(formatPopularityCount(1_200_000)).toBe('1M');
    expect(formatPopularityCount(2_600_000)).toBe('3M');
  });
});
