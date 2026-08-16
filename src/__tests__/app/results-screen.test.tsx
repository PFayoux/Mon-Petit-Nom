import { screen, userEvent, within } from '@testing-library/react-native';

import ResultsScreen from '@/app/results';
import { NAMES } from '@/data/names';
import { getStoredPartnerProfiles, getStoredReviews, renderScreen, seedAppStore } from '@/lib/test-utils';

// Aaron is boy-only, Ada is girl-only, Camille is tagged 'both' — see src/data/names.ts.
const BOY_ONLY_NAME = 'Aaron';
const GIRL_ONLY_NAME = 'Ada';
const BOTH_GENDER_NAME = 'Camille';

describe('ResultsScreen', () => {
  test('Given no reviews yet, When the screen renders, Then every name is Unmarked and the other tabs are empty', async () => {
    await renderScreen(<ResultsScreen />);

    // Loved is the default active status tab, shown as a plain label; the
    // other three only exist as dots on the status pill (see StatusTabPill).
    expect(await screen.findByText('Loved (0)')).toBeOnTheScreen();
    expect(screen.getByLabelText(`Unmarked (${NAMES.length})`)).toBeOnTheScreen();
    expect(screen.getByLabelText('Maybe (0)')).toBeOnTheScreen();
    expect(screen.getByLabelText('Disliked (0)')).toBeOnTheScreen();
  });

  test('Given a boy-only name marked as loved, When the screen renders with the default "All" gender tab, Then it appears in the Loved tab', async () => {
    await seedAppStore({ reviews: { [BOY_ONLY_NAME]: { status: 'love', gender: 'boy' } } });
    await renderScreen(<ResultsScreen />);

    expect(await screen.findByText('Loved (1)')).toBeOnTheScreen();
    expect(screen.getByText(BOY_ONLY_NAME)).toBeOnTheScreen();
  });

  test('Given a boy-only name marked as loved, When the user filters by "Girl", Then it no longer appears in the Loved tab', async () => {
    const user = userEvent.setup();
    await seedAppStore({ reviews: { [BOY_ONLY_NAME]: { status: 'love', gender: 'boy' } } });
    await renderScreen(<ResultsScreen />);
    await screen.findByText('Loved (1)');

    await user.press(screen.getByText('Girl'));

    expect(await screen.findByText('Loved (0)')).toBeOnTheScreen();
    expect(screen.queryByText(BOY_ONLY_NAME)).not.toBeOnTheScreen();
  });

  test('Given a name tagged "both", When the user filters by "Girl", Then it still appears in the Loved tab', async () => {
    const user = userEvent.setup();
    await seedAppStore({ reviews: { [BOTH_GENDER_NAME]: { status: 'love', gender: 'both' } } });
    await renderScreen(<ResultsScreen />);
    await screen.findByText('Loved (1)');

    await user.press(screen.getByText('Girl'));

    expect(await screen.findByText('Loved (1)')).toBeOnTheScreen();
    expect(screen.getByText(BOTH_GENDER_NAME)).toBeOnTheScreen();
  });

  test('Given a name shown in the Loved tab, When the user presses its dislike button, Then it moves to the Disliked tab', async () => {
    const user = userEvent.setup();
    await seedAppStore({ reviews: { [BOTH_GENDER_NAME]: { status: 'love', gender: 'both' } } });
    await renderScreen(<ResultsScreen />);
    await screen.findByText('Loved (1)');

    await user.press(screen.getByLabelText('Dislike'));

    expect(await screen.findByText('Loved (0)')).toBeOnTheScreen();
    expect(screen.getByLabelText('Disliked (1)')).toBeOnTheScreen();
  });

  describe('filtering by the chosen review gender', () => {
    test('Given a girl-only name loved for "boy" specifically, When the user filters by "Girl", Then it does not appear in the Loved tab', async () => {
      const user = userEvent.setup();
      await seedAppStore({ reviews: { [GIRL_ONLY_NAME]: { status: 'love', gender: 'boy' } } });
      await renderScreen(<ResultsScreen />);
      await screen.findByText('Loved (1)');

      await user.press(screen.getByText('Girl'));

      expect(await screen.findByText('Loved (0)')).toBeOnTheScreen();
      expect(screen.queryByText(GIRL_ONLY_NAME)).not.toBeOnTheScreen();
    });

    test('Given a girl-only name loved for "boy" specifically, When the user filters by "Boy", Then it appears in the Loved tab', async () => {
      const user = userEvent.setup();
      await seedAppStore({ reviews: { [GIRL_ONLY_NAME]: { status: 'love', gender: 'boy' } } });
      await renderScreen(<ResultsScreen />);
      await screen.findByText('Loved (1)');

      await user.press(screen.getByText('Boy'));

      expect(await screen.findByText('Loved (1)')).toBeOnTheScreen();
      expect(screen.getByText(GIRL_ONLY_NAME)).toBeOnTheScreen();
    });

    test('Given a boy-only name loved for "both" specifically, When the user filters by "Girl", Then it still appears in the Loved tab', async () => {
      const user = userEvent.setup();
      await seedAppStore({ reviews: { [BOY_ONLY_NAME]: { status: 'love', gender: 'both' } } });
      await renderScreen(<ResultsScreen />);
      await screen.findByText('Loved (1)');

      await user.press(screen.getByText('Girl'));

      expect(await screen.findByText('Loved (1)')).toBeOnTheScreen();
      expect(screen.getByText(BOY_ONLY_NAME)).toBeOnTheScreen();
    });

    test('Given a boy-only name loved for "boy" specifically, When the user filters by "Both", Then it does not appear in the Loved tab', async () => {
      const user = userEvent.setup();
      await seedAppStore({ reviews: { [BOY_ONLY_NAME]: { status: 'love', gender: 'boy' } } });
      await renderScreen(<ResultsScreen />);
      await screen.findByText('Loved (1)');

      await user.press(screen.getByText('Both'));

      expect(await screen.findByText('Loved (0)')).toBeOnTheScreen();
      expect(screen.queryByText(BOY_ONLY_NAME)).not.toBeOnTheScreen();
    });

    test('Given a name loved for "both" specifically, When the user filters by "Both", Then it appears in the Loved tab', async () => {
      const user = userEvent.setup();
      await seedAppStore({ reviews: { [BOTH_GENDER_NAME]: { status: 'love', gender: 'both' } } });
      await renderScreen(<ResultsScreen />);
      await screen.findByText('Loved (1)');

      await user.press(screen.getByText('Both'));

      expect(await screen.findByText('Loved (1)')).toBeOnTheScreen();
      expect(screen.getByText(BOTH_GENDER_NAME)).toBeOnTheScreen();
    });

    test('Given a boy-only name loved for "boy" specifically, When the user filters by "Both" then back to "All", Then it disappears then reappears in the Loved tab', async () => {
      const user = userEvent.setup();
      await seedAppStore({ reviews: { [BOY_ONLY_NAME]: { status: 'love', gender: 'boy' } } });
      await renderScreen(<ResultsScreen />);
      await screen.findByText('Loved (1)');

      await user.press(screen.getByText('Both'));
      expect(await screen.findByText('Loved (0)')).toBeOnTheScreen();

      await user.press(screen.getByText('All'));
      expect(await screen.findByText('Loved (1)')).toBeOnTheScreen();
      expect(screen.getByText(BOY_ONLY_NAME)).toBeOnTheScreen();
    });

    test('Given a name already loved with a chosen gender, When the user presses a different status on its row, Then the chosen gender is kept, not reset to the filter default', async () => {
      const user = userEvent.setup();
      await seedAppStore({ reviews: { [GIRL_ONLY_NAME]: { status: 'love', gender: 'boy' } } });
      await renderScreen(<ResultsScreen />);
      await user.press(screen.getByText('Boy'));
      await screen.findByText('Loved (1)');

      await user.press(screen.getByLabelText('Maybe'));

      expect(await getStoredReviews()).toEqual({ [GIRL_ONLY_NAME]: { status: 'maybe', gender: 'boy' } });
    });
  });

  describe('correcting a review\'s gender from the "⋮" menu', () => {
    test('Given a loved name, Then its row has an edit-gender button', async () => {
      await seedAppStore({ reviews: { [BOTH_GENDER_NAME]: { status: 'love', gender: 'both' } } });
      await renderScreen(<ResultsScreen />);

      expect(await screen.findByLabelText(`Edit gender for ${BOTH_GENDER_NAME}`)).toBeOnTheScreen();
    });

    test('Given an unmarked name, Then its row has no edit-gender button', async () => {
      const user = userEvent.setup();
      await renderScreen(<ResultsScreen />);
      await user.press(screen.getByLabelText(`Unmarked (${NAMES.length})`));
      await screen.findByText(BOY_ONLY_NAME);

      expect(screen.queryByLabelText(`Edit gender for ${BOY_ONLY_NAME}`)).not.toBeOnTheScreen();
    });

    test('Given the user opens the menu and picks a new gender, Then the stored review is updated to that gender while its status stays the same', async () => {
      const user = userEvent.setup();
      await seedAppStore({ reviews: { [GIRL_ONLY_NAME]: { status: 'love', gender: 'boy' } } });
      await renderScreen(<ResultsScreen />);
      await screen.findByText(GIRL_ONLY_NAME);

      await user.press(screen.getByLabelText(`Edit gender for ${GIRL_ONLY_NAME}`));
      const modal = within(screen.getByTestId('genderCorrectionModal'));
      await user.press(modal.getByLabelText('Girl'));

      expect(await getStoredReviews()).toEqual({ [GIRL_ONLY_NAME]: { status: 'love', gender: 'girl' } });
    });

    test('Given the user corrects a name\'s gender to no longer match the active filter, When the modal closes, Then the row disappears from the current tab', async () => {
      const user = userEvent.setup();
      await seedAppStore({ reviews: { [GIRL_ONLY_NAME]: { status: 'love', gender: 'boy' } } });
      await renderScreen(<ResultsScreen />);
      await user.press(screen.getByText('Boy'));
      await screen.findByText('Loved (1)');

      await user.press(screen.getByLabelText(`Edit gender for ${GIRL_ONLY_NAME}`));
      const modal = within(screen.getByTestId('genderCorrectionModal'));
      await user.press(modal.getByLabelText('Girl'));

      expect(await screen.findByText('Loved (0)')).toBeOnTheScreen();
      expect(screen.queryByText(GIRL_ONLY_NAME)).not.toBeOnTheScreen();
    });
  });

  describe('switching status tabs from the redesigned status pill', () => {
    test('Given the Loved tab is active, When the user taps the Unmarked dot, Then the Unmarked tab becomes active', async () => {
      const user = userEvent.setup();
      await renderScreen(<ResultsScreen />);
      await screen.findByText('Loved (0)');

      await user.press(screen.getByLabelText(`Unmarked (${NAMES.length})`));

      expect(await screen.findByText(`Unmarked (${NAMES.length})`)).toBeOnTheScreen();
      expect(screen.getByLabelText('Loved (0)')).toBeOnTheScreen();
    });

    test('Given the Loved tab is active, When the user presses the next-status button, Then the Maybe tab becomes active', async () => {
      const user = userEvent.setup();
      await renderScreen(<ResultsScreen />);
      await screen.findByText('Loved (0)');

      await user.press(screen.getByLabelText('Next status'));

      expect(await screen.findByText('Maybe (0)')).toBeOnTheScreen();
    });

    test('Given the Loved tab is active, When the user presses the previous-status button, Then it wraps around to the last tab (Unmarked)', async () => {
      const user = userEvent.setup();
      await renderScreen(<ResultsScreen />);
      await screen.findByText('Loved (0)');

      await user.press(screen.getByLabelText('Previous status'));

      expect(await screen.findByText(`Unmarked (${NAMES.length})`)).toBeOnTheScreen();
    });

    test('Given the partner tab only offers Loved and Maybe, When the user presses the previous-status button from Loved, Then it wraps around to Maybe', async () => {
      const user = userEvent.setup();
      const PARTNER_NAME = 'PartnerUser';
      await seedAppStore({
        partnerProfiles: [{ displayName: PARTNER_NAME, reviews: {} }],
        activePartnerName: PARTNER_NAME,
      });
      await renderScreen(<ResultsScreen />);
      await user.press(await screen.findByText(PARTNER_NAME));
      await screen.findByText('Loved (0)');

      await user.press(screen.getByLabelText('Previous status'));

      expect(await screen.findByText('Maybe (0)')).toBeOnTheScreen();
    });
  });

  describe('searching within the current tab', () => {
    test('Given a query matching a name in the current tab, When typed, Then only matching names remain visible', async () => {
      const user = userEvent.setup();
      await renderScreen(<ResultsScreen />);
      await user.press(screen.getByLabelText(`Unmarked (${NAMES.length})`));
      await screen.findByText(BOY_ONLY_NAME);

      await user.type(screen.getByTestId('resultsSearchInput'), BOY_ONLY_NAME.slice(0, 3));

      expect(await screen.findByText(BOY_ONLY_NAME)).toBeOnTheScreen();
      expect(screen.queryByText(GIRL_ONLY_NAME)).not.toBeOnTheScreen();
    });

    test('Given an active search query, Then the tab counts stay based on the unfiltered set', async () => {
      const user = userEvent.setup();
      await renderScreen(<ResultsScreen />);
      await screen.findByLabelText(`Unmarked (${NAMES.length})`);

      await user.type(screen.getByTestId('resultsSearchInput'), BOY_ONLY_NAME);

      expect(screen.getByLabelText(`Unmarked (${NAMES.length})`)).toBeOnTheScreen();
    });

    test('Given a search query matching nothing, Then a search-specific empty message is shown instead of the generic one', async () => {
      const user = userEvent.setup();
      await renderScreen(<ResultsScreen />);
      await screen.findByText('Loved (0)');

      await user.type(screen.getByTestId('resultsSearchInput'), 'zzzzzz');

      expect(await screen.findByText('No names match "zzzzzz"')).toBeOnTheScreen();
      expect(screen.queryByText('No names here yet')).not.toBeOnTheScreen();
    });

    test('Given a query typed in accent-free lowercase, When it matches an accented name, Then that name still appears', async () => {
      const user = userEvent.setup();
      // Émile is in src/data/names.ts — accent-free "emi" should still match it.
      // It sorts near the end of a plain-codepoint comparison, so it isn't
      // among the list's initially-rendered rows before searching narrows
      // the list down to just itself.
      const accentedName = 'Émile';
      expect(NAMES.some((entry) => entry.name === accentedName)).toBe(true);
      await renderScreen(<ResultsScreen />);
      await user.press(screen.getByLabelText(`Unmarked (${NAMES.length})`));
      await screen.findByTestId('resultsSearchInput');

      await user.type(screen.getByTestId('resultsSearchInput'), 'emi');

      expect(await screen.findByText(accentedName)).toBeOnTheScreen();
    });

    test('Given the user presses the clear button, When pressed, Then the search query is cleared and the full list returns', async () => {
      const user = userEvent.setup();
      await renderScreen(<ResultsScreen />);
      await user.press(screen.getByLabelText(`Unmarked (${NAMES.length})`));
      await screen.findByText(BOY_ONLY_NAME);
      await user.type(screen.getByTestId('resultsSearchInput'), 'zzzzzz');
      await screen.findByText('No names match "zzzzzz"');

      await user.press(screen.getByLabelText('Clear search'));

      expect(await screen.findByText(BOY_ONLY_NAME)).toBeOnTheScreen();
      expect(screen.queryByText('No names match "zzzzzz"')).not.toBeOnTheScreen();
    });
  });

  describe('comparing with a partner', () => {
    // Not a real first name in NAMES, so text queries for it can't collide with a rendered row.
    const PARTNER_NAME = 'PartnerUser';

    test('Given no active partner, When the screen renders, Then there is no partner view toggle', async () => {
      await renderScreen(<ResultsScreen />);

      expect(screen.queryByText(PARTNER_NAME)).not.toBeOnTheScreen();
    });

    test('Given an active partner, When the screen renders, Then a toggle for their list appears', async () => {
      await seedAppStore({
        partnerProfiles: [{ displayName: PARTNER_NAME, reviews: {} }],
        activePartnerName: PARTNER_NAME,
      });
      await renderScreen(<ResultsScreen />);

      expect(await screen.findByText(PARTNER_NAME)).toBeOnTheScreen();
    });

    test('Given both loved the same name, When viewing "Me", Then the row shows a strong-match badge', async () => {
      await seedAppStore({
        reviews: { [BOY_ONLY_NAME]: { status: 'love', gender: 'boy' } },
        partnerProfiles: [
          { displayName: PARTNER_NAME, reviews: { [BOY_ONLY_NAME]: { status: 'love', gender: 'boy' } } },
        ],
        activePartnerName: PARTNER_NAME,
      });
      await renderScreen(<ResultsScreen />);

      expect(await screen.findByText(BOY_ONLY_NAME)).toBeOnTheScreen();
      expect(screen.getByLabelText('Both loved')).toBeOnTheScreen();
    });

    test('Given the user switches to the partner tab, Then only Loved and Maybe status tabs are offered', async () => {
      const user = userEvent.setup();
      await seedAppStore({
        partnerProfiles: [{ displayName: PARTNER_NAME, reviews: {} }],
        activePartnerName: PARTNER_NAME,
      });
      await renderScreen(<ResultsScreen />);

      await user.press(await screen.findByText(PARTNER_NAME));

      expect(screen.getByText('Loved (0)')).toBeOnTheScreen();
      expect(screen.getByLabelText('Maybe (0)')).toBeOnTheScreen();
      expect(screen.queryByLabelText(/Disliked/)).not.toBeOnTheScreen();
      expect(screen.queryByLabelText(/Unmarked/)).not.toBeOnTheScreen();
    });

    test('Given the partner loved a name the user has not reviewed, When viewing the partner tab, Then it appears as a discovery row', async () => {
      const user = userEvent.setup();
      await seedAppStore({
        partnerProfiles: [
          { displayName: PARTNER_NAME, reviews: { [BOY_ONLY_NAME]: { status: 'love', gender: 'boy' } } },
        ],
        activePartnerName: PARTNER_NAME,
      });
      await renderScreen(<ResultsScreen />);

      await user.press(await screen.findByText(PARTNER_NAME));

      expect(await screen.findByText('Loved (1)')).toBeOnTheScreen();
      expect(screen.getByText(BOY_ONLY_NAME)).toBeOnTheScreen();
    });

    test('Given a discovery row, When the user classifies it, Then only their own reviews are written — the partner profile stays untouched', async () => {
      const user = userEvent.setup();
      await seedAppStore({
        partnerProfiles: [
          { displayName: PARTNER_NAME, reviews: { [BOY_ONLY_NAME]: { status: 'love', gender: 'boy' } } },
        ],
        activePartnerName: PARTNER_NAME,
      });
      await renderScreen(<ResultsScreen />);
      await user.press(await screen.findByText(PARTNER_NAME));
      await screen.findByText(BOY_ONLY_NAME);

      await user.press(screen.getByLabelText('Love'));

      expect(await getStoredReviews()).toEqual({ [BOY_ONLY_NAME]: { status: 'love', gender: 'boy' } });
      expect(await getStoredPartnerProfiles()).toEqual([
        { displayName: PARTNER_NAME, reviews: { [BOY_ONLY_NAME]: { status: 'love', gender: 'boy' } } },
      ]);
    });

    test('Given a name only the user has loved, When viewing the partner tab, Then it does not appear — the partner has no opinion on it', async () => {
      const user = userEvent.setup();
      await seedAppStore({
        reviews: { [BOY_ONLY_NAME]: { status: 'love', gender: 'boy' } },
        partnerProfiles: [{ displayName: PARTNER_NAME, reviews: {} }],
        activePartnerName: PARTNER_NAME,
      });
      await renderScreen(<ResultsScreen />);
      expect(await screen.findByText(BOY_ONLY_NAME)).toBeOnTheScreen();

      await user.press(await screen.findByText(PARTNER_NAME));

      expect(await screen.findByText('Loved (0)')).toBeOnTheScreen();
      expect(screen.queryByText(BOY_ONLY_NAME)).not.toBeOnTheScreen();
    });

    test('Given the partner loved names of both genders, When the user filters by "Boy" in the partner tab, Then only the boy-gendered one appears', async () => {
      const user = userEvent.setup();
      await seedAppStore({
        partnerProfiles: [
          {
            displayName: PARTNER_NAME,
            reviews: {
              [BOY_ONLY_NAME]: { status: 'love', gender: 'boy' },
              [GIRL_ONLY_NAME]: { status: 'love', gender: 'girl' },
            },
          },
        ],
        activePartnerName: PARTNER_NAME,
      });
      await renderScreen(<ResultsScreen />);
      await user.press(await screen.findByText(PARTNER_NAME));
      expect(await screen.findByText('Loved (2)')).toBeOnTheScreen();

      await user.press(screen.getByText('Boy'));

      expect(await screen.findByText('Loved (1)')).toBeOnTheScreen();
      expect(screen.getByText(BOY_ONLY_NAME)).toBeOnTheScreen();
      expect(screen.queryByText(GIRL_ONLY_NAME)).not.toBeOnTheScreen();
    });
  });
});
