export function formatPopularityCount(count: number): string {
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${Math.round(count / 1000)}k`;
  return `${Math.round(count / 1_000_000)}M`;
}
