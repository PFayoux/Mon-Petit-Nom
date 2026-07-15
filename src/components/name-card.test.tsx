import { render, screen } from '@testing-library/react-native';

import { NameCard } from './name-card';

describe('NameCard', () => {
  test('Given counts under 1000, When rendered, Then the popularity row shows the raw numbers', async () => {
    await render(<NameCard name="Aaron" boyCount={71} girlCount={3} />);

    expect(screen.getByText('👦 71 · 👧 3')).toBeOnTheScreen();
  });

  test('Given counts in the thousands or above, When rendered, Then the popularity row shows abbreviated numbers', async () => {
    await render(<NameCard name="Thierry" boyCount={289564} girlCount={1200000} />);

    expect(screen.getByText('👦 290k · 👧 1M')).toBeOnTheScreen();
  });

  test('Given boy and girl counts, When rendered, Then the popularity row has an accessibility label with the raw numbers', async () => {
    await render(<NameCard name="Aaron" boyCount={33998} girlCount={71} />);

    expect(screen.getByLabelText('33998 boys, 71 girls')).toBeOnTheScreen();
  });
});
