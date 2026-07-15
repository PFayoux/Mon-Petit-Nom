import { fireEvent, screen, userEvent } from '@testing-library/react-native';

import SwipeScreen from '@/app/index';
import { renderScreen } from '@/lib/test-utils';

// The deck's card size only appears once the deck View reports a real layout,
// which never happens on its own in the test renderer (no real measurement).
async function layOutDeck() {
  await fireEvent(screen.getByTestId('swipeDeck'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 320, height: 480 } },
  });
}

// Deterministic order: no shuffling, so the deck follows src/data/names.ts's
// authored order. Aaron is the first boy-only entry; Camille (tagged 'both')
// is the first entry that also matches the 'girl' filter.
jest.mock('@/lib/shuffle', () => ({
  shuffle: <T,>(items: readonly T[]) => [...items],
}));

describe('SwipeScreen', () => {
  test('Given no reviews yet, When the deck lays out, Then the first name in dataset order is shown', async () => {
    await renderScreen(<SwipeScreen />);
    await layOutDeck();

    expect(await screen.findByText('Aaron')).toBeOnTheScreen();
  });

  test('Given the current name is shown, When the user presses the love button, Then the next name in order is shown', async () => {
    const user = userEvent.setup();
    await renderScreen(<SwipeScreen />);
    await layOutDeck();
    await screen.findByText('Aaron');

    await user.press(screen.getByLabelText('Love'));

    expect(await screen.findByText('Abel')).toBeOnTheScreen();
    expect(screen.queryByText('Aaron')).not.toBeOnTheScreen();
  });

  test('Given a decision was just made, When the user presses Back, Then the previous name is shown again', async () => {
    const user = userEvent.setup();
    await renderScreen(<SwipeScreen />);
    await layOutDeck();
    await screen.findByText('Aaron');
    await user.press(screen.getByLabelText('Love'));
    await screen.findByText('Abel');

    await user.press(screen.getByText('Back'));

    expect(await screen.findByText('Aaron')).toBeOnTheScreen();
  });

  test('Given the gender filter is switched to "Girl", When the deck updates, Then it shows the first name matching that filter', async () => {
    const user = userEvent.setup();
    await renderScreen(<SwipeScreen />);
    await layOutDeck();
    await screen.findByText('Aaron');

    await user.press(screen.getByText('Girl'));

    expect(await screen.findByText('Camille')).toBeOnTheScreen();
  });
});
