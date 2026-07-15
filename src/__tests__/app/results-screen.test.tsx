import { screen, userEvent } from '@testing-library/react-native';

import ResultsScreen from '@/app/results';
import { NAMES } from '@/data/names';
import { renderScreen, seedAppStore } from '@/lib/test-utils';

// Aaron is boy-only, Camille is tagged 'both' in the dataset — see src/data/names.ts.
const BOY_ONLY_NAME = 'Aaron';
const BOTH_GENDER_NAME = 'Camille';

describe('ResultsScreen', () => {
  test('Given no reviews yet, When the screen renders, Then every name is Unmarked and the other tabs are empty', async () => {
    await renderScreen(<ResultsScreen />);

    expect(await screen.findByText(`Unmarked (${NAMES.length})`)).toBeOnTheScreen();
    expect(screen.getByText('Loved (0)')).toBeOnTheScreen();
    expect(screen.getByText('Maybe (0)')).toBeOnTheScreen();
    expect(screen.getByText('Disliked (0)')).toBeOnTheScreen();
  });

  test('Given a boy-only name marked as loved, When the screen renders with the default "Both" gender filter, Then it appears in the Loved tab', async () => {
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
});
