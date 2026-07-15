import { expect, test } from '@playwright/test';

import { seedAndGoto } from './helpers';

test.describe('Results screen layout', () => {
  test('Given the Results screen on a phone viewport, When it renders, Then the name list has room below the tab bars with no large empty gap', async ({
    page,
  }) => {
    await seedAndGoto(page, { reviews: { Aaron: { status: 'love', gender: 'boy' } } });
    await page.getByText('Results', { exact: true }).click();

    const statusFilter = page.getByText('Loved (1)', { exact: true });
    const firstRow = page.getByText('Aaron', { exact: true });
    await expect(statusFilter).toBeVisible();
    await expect(firstRow).toBeVisible();

    const filterBox = await statusFilter.boundingBox();
    const rowBox = await firstRow.boundingBox();
    expect(filterBox).not.toBeNull();
    expect(rowBox).not.toBeNull();

    const gap = rowBox!.y - (filterBox!.y + filterBox!.height);
    expect(gap).toBeLessThan(80);
  });
});
