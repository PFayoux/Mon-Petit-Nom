import { fireEvent, screen, userEvent } from '@testing-library/react-native';

import SwipeScreen from '@/app/index';
import { getStoredReviews, renderScreen } from '@/lib/test-utils';

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

  describe('review gender picker', () => {
    test('Given the deck filter is "Boy", When a card is shown, Then the gender picker defaults to "Boy"', async () => {
      const user = userEvent.setup();
      await renderScreen(<SwipeScreen />);
      await layOutDeck();
      await screen.findByText('Aaron');

      await user.press(screen.getByText('Boy'));

      expect(screen.getByLabelText('Boy').props.accessibilityState.selected).toBe(true);
      expect(screen.getByLabelText('Girl').props.accessibilityState.selected).toBe(false);
    });

    test('Given no gender override, When the user presses Love, Then the saved review uses the picker\'s default gender', async () => {
      const user = userEvent.setup();
      await renderScreen(<SwipeScreen />);
      await layOutDeck();
      await screen.findByText('Aaron');

      await user.press(screen.getByLabelText('Love'));

      expect(await getStoredReviews()).toEqual({ Aaron: { status: 'love', gender: 'boy' } });
    });

    test('Given the user manually picks "Girl" on a boy-only name, When they press Love, Then the saved review uses "Girl" instead of the default', async () => {
      const user = userEvent.setup();
      await renderScreen(<SwipeScreen />);
      await layOutDeck();
      await screen.findByText('Aaron');

      await user.press(screen.getByLabelText('Girl'));
      await user.press(screen.getByLabelText('Love'));

      expect(await getStoredReviews()).toEqual({ Aaron: { status: 'love', gender: 'girl' } });
    });

    test('Given the user picked a specific gender, When they press Dislike, Then the saved review always uses "both"', async () => {
      const user = userEvent.setup();
      await renderScreen(<SwipeScreen />);
      await layOutDeck();
      await screen.findByText('Aaron');

      await user.press(screen.getByLabelText('Girl'));
      await user.press(screen.getByLabelText('Dislike'));

      expect(await getStoredReviews()).toEqual({ Aaron: { status: 'dislike', gender: 'both' } });
    });

    test('Given a manual gender override on one card, When the next card appears, Then its picker resets to that card\'s own default', async () => {
      const user = userEvent.setup();
      await renderScreen(<SwipeScreen />);
      await layOutDeck();
      await screen.findByText('Aaron');

      await user.press(screen.getByLabelText('Girl'));
      await user.press(screen.getByLabelText('Love'));
      await screen.findByText('Abel');

      expect(screen.getByLabelText('Boy').props.accessibilityState.selected).toBe(true);
      expect(screen.getByLabelText('Girl').props.accessibilityState.selected).toBe(false);
    });
  });
});
