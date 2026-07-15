import type { Page } from '@playwright/test';

type ReviewStatus = 'love' | 'maybe' | 'dislike';

// Seeds the same AsyncStorage keys src/lib/storage.ts reads on native, so the
// app skips onboarding and hydrates with a known review state.
export async function seedAndGoto(
  page: Page,
  { reviews = {} }: { reviews?: Record<string, ReviewStatus> } = {}
) {
  await page.goto('/');
  await page.evaluate(
    ([reviewsJson]) => {
      localStorage.setItem('@mon-petit-nom/display-name', 'Testeur');
      localStorage.setItem('@mon-petit-nom/reviews', reviewsJson);
    },
    [JSON.stringify(reviews)]
  );
  await page.reload();
}
