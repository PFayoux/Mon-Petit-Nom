import { screen, userEvent, within } from '@testing-library/react-native';

import ResultsScreen from '@/app/results';
import { NAMES } from '@/data/names';
import { getStoredReviews, renderScreen, seedAppStore } from '@/lib/test-utils';

// Aaron is boy-only, Ada is girl-only, Camille is tagged 'both' — see src/data/names.ts.
const BOY_ONLY_NAME = 'Aaron';
const GIRL_ONLY_NAME = 'Ada';
const BOTH_GENDER_NAME = 'Camille';

describe('ResultsScreen', () => {
  test('Given no reviews yet, When the screen renders, Then every name is Unmarked and the other tabs are empty', async () => {
    await renderScreen(<ResultsScreen />);

    expect(await screen.findByText(`Unmarked (${NAMES.length})`)).toBeOnTheScreen();
    expect(screen.getByText('Loved (0)')).toBeOnTheScreen();
    expect(screen.getByText('Maybe (0)')).toBeOnTheScreen();
    expect(screen.getByText('Disliked (0)')).toBeOnTheScreen();
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
    expect(screen.getByText('Disliked (1)')).toBeOnTheScreen();
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
      await user.press(screen.getByText(`Unmarked (${NAMES.length})`));
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
});
