import { expect, test } from '@playwright/test';

import { seedAndGoto } from './helpers';

test.describe('Swipe screen layout', () => {
  test('Given the Swipe screen on a phone viewport, When it renders, Then the name card fills most of the available vertical space', async ({
    page,
  }) => {
    await seedAndGoto(page);

    const card = page.getByTestId('nameCard');
    await expect(card).toBeVisible();

    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    // Regression guard: a SegmentedTabBar ScrollView with unconstrained
    // flexGrow once stole vertical space from the deck, shrinking the card to
    // a sliver instead of filling the space between the header and controls.
    expect(box!.height).toBeGreaterThan(300);
  });

  test('Given the Swipe screen on a phone viewport, When it renders, Then the gender filter and the remaining-count text sit close together with no large empty gap', async ({
    page,
  }) => {
    await seedAndGoto(page);

    const genderFilter = page.getByText('Both', { exact: true });
    const remainingCount = page.getByText(/names? left/);
    await expect(genderFilter).toBeVisible();
    await expect(remainingCount).toBeVisible();

    const filterBox = await genderFilter.boundingBox();
    const countBox = await remainingCount.boundingBox();
    expect(filterBox).not.toBeNull();
    expect(countBox).not.toBeNull();

    const gap = countBox!.y - (filterBox!.y + filterBox!.height);
    expect(gap).toBeLessThan(80);
  });
});
