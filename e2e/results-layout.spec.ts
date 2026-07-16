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

  test('Given a loved name\'s row, When it renders, Then the edit-gender icon\'s line height matches the decision buttons\' icons next to it', async ({
    page,
  }) => {
    // type="subtitle" gave the "⋮" a much taller line-height (44) than the
    // compact decision buttons' icons (20). Both glyphs' bounding boxes end up
    // mathematically centered on the same point regardless (their shared
    // parent button centers them), so comparing box *centers* can't tell
    // these apart — it's the mismatched line-height itself, which shifts
    // where the browser positions the glyph's ink within that box, that reads
    // as misaligned.
    await seedAndGoto(page, { reviews: { Aaron: { status: 'love', gender: 'boy' } } });
    await page.getByText('Results', { exact: true }).click();

    // React Native Web renders an extra, non-visible accessibility clone of
    // some elements, so there are two "❤️" nodes — .last() is the real one
    // (matches the pattern already relied on elsewhere in this suite).
    const loveGlyph = page.getByLabel('Love', { exact: true }).getByText('❤️').last();
    const editGlyph = page.getByText('⋮', { exact: true });
    await expect(loveGlyph).toBeVisible();
    await expect(editGlyph).toBeVisible();

    const loveBox = await loveGlyph.boundingBox();
    const editBox = await editGlyph.boundingBox();
    expect(loveBox).not.toBeNull();
    expect(editBox).not.toBeNull();

    expect(editBox!.height).toBeCloseTo(loveBox!.height, 0);
  });
});
