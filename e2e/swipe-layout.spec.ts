import { expect, test } from '@playwright/test';

import { NAMES } from '../src/data/names';
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

  test('Given a long name is the only one left to review on a narrow viewport, When the Swipe screen renders, Then the name wraps to two lines and the popularity counts stay fully inside the card', async ({
    page,
  }) => {
    // "Émelyne" wrapping to two lines on a narrow phone (e.g. some Samsung
    // display-scale settings vs. a Pixel) once pushed its girl-count number
    // below the card's fixed-height bounds, where it got clipped — the emoji
    // was still visible, the number wasn't. Narrowing the viewport well past
    // what adjustsFontSizeToFit's minimumFontScale can compensate for forces
    // the genuine two-line case, deterministically, regardless of exactly
    // which real device widths and font engines this maps to. Reviewing
    // every other name leaves it as the deterministic current card,
    // regardless of the swipe deck's shuffle order.
    await page.setViewportSize({ width: 220, height: 780 });
    const LONG_NAME = 'Émelyne';
    const reviews = Object.fromEntries(
      NAMES.filter((entry) => entry.name !== LONG_NAME).map((entry) => [
        entry.name,
        { status: 'dislike' as const, gender: 'both' as const },
      ])
    );
    await seedAndGoto(page, { reviews });

    const card = page.getByTestId('nameCard');
    await expect(card).toBeVisible();
    const nameText = page.getByText(LONG_NAME);
    await expect(nameText).toBeVisible();

    const popularity = page.getByText(/👦.*·.*👧/);
    await expect(popularity).toBeVisible();

    const cardBox = await card.boundingBox();
    const nameBox = await nameText.boundingBox();
    const popularityBox = await popularity.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(nameBox).not.toBeNull();
    expect(popularityBox).not.toBeNull();

    // Sanity check that this viewport actually exercises the two-line case
    // (a single line would be ~52px tall) rather than passing vacuously.
    expect(nameBox!.height).toBeGreaterThan(80);
    expect(popularityBox!.y + popularityBox!.height).toBeLessThanOrEqual(cardBox!.y + cardBox!.height);
  });
});
