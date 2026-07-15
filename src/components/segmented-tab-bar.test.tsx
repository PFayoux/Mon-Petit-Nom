import { render, screen, userEvent } from '@testing-library/react-native';

import { SegmentedTabBar } from './segmented-tab-bar';

describe('SegmentedTabBar', () => {
  test('Given sections with counts, When rendered, Then each tab shows its label and count', async () => {
    await render(
      <SegmentedTabBar
        sections={[
          { key: 'love', label: 'Loved', count: 4 },
          { key: 'maybe', label: 'Maybe', count: 0 },
        ]}
        selected="love"
        onSelect={jest.fn()}
      />
    );

    expect(screen.getByText('Loved (4)')).toBeOnTheScreen();
    expect(screen.getByText('Maybe (0)')).toBeOnTheScreen();
  });

  test('Given sections without counts, When rendered, Then each tab shows only its label', async () => {
    await render(
      <SegmentedTabBar
        sections={[
          { key: 'boy', label: 'Boy' },
          { key: 'girl', label: 'Girl' },
        ]}
        selected="boy"
        onSelect={jest.fn()}
      />
    );

    expect(screen.getByText('Boy')).toBeOnTheScreen();
    expect(screen.getByText('Girl')).toBeOnTheScreen();
  });

  test("Given a tab that is not the selected one, When the user presses it, Then onSelect is called with that tab's key", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    await render(
      <SegmentedTabBar
        sections={[
          { key: 'boy', label: 'Boy' },
          { key: 'girl', label: 'Girl' },
        ]}
        selected="boy"
        onSelect={onSelect}
      />
    );

    await user.press(screen.getByText('Girl'));

    expect(onSelect).toHaveBeenCalledWith('girl');
  });
});
