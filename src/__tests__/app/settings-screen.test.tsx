import { Alert } from 'react-native';
import { File } from 'expo-file-system';
import { screen, userEvent, waitFor } from '@testing-library/react-native';

import SettingsScreen from '@/app/settings';
import { getStoredPartnerProfiles, renderScreen, seedAppStore } from '@/lib/test-utils';

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// File.pickFileAsync is overloaded (including a deprecated pre-options
// signature); jest's spy typing only surfaces the last overload, so the mock
// return value is cast rather than typed against it directly.
function spyOnPickFile() {
  return jest.spyOn(File, 'pickFileAsync') as unknown as jest.Mock;
}

function mockPickedFile(jsonText: string) {
  spyOnPickFile().mockResolvedValue({ canceled: false, result: { text: async () => jsonText } });
}

function mockPickCanceled() {
  spyOnPickFile().mockResolvedValue({ canceled: true, result: null });
}

describe('SettingsScreen', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Given a valid exported file, When the user imports it, Then it is stored as a partner profile', async () => {
    const user = userEvent.setup();
    mockPickedFile(JSON.stringify({ displayName: 'Camille', reviews: { Jean: { status: 'love', gender: 'boy' } } }));
    await seedAppStore({ displayName: 'Alex' });
    await renderScreen(<SettingsScreen />);

    await user.press(await screen.findByText('Import a list'));

    await waitFor(async () => {
      expect(await getStoredPartnerProfiles()).toEqual([
        { displayName: 'Camille', reviews: { Jean: { status: 'love', gender: 'boy' } } },
      ]);
    });
  });

  test('Given an existing partner profile, When a new file with the same display name is imported, Then it replaces the previous one', async () => {
    const user = userEvent.setup();
    mockPickedFile(JSON.stringify({ displayName: 'Camille', reviews: { Alice: { status: 'maybe', gender: 'girl' } } }));
    await seedAppStore({
      displayName: 'Alex',
      partnerProfiles: [{ displayName: 'Camille', reviews: { Jean: { status: 'love', gender: 'boy' } } }],
    });
    await renderScreen(<SettingsScreen />);

    await user.press(await screen.findByText('Import a list'));

    await waitFor(async () => {
      expect(await getStoredPartnerProfiles()).toEqual([
        { displayName: 'Camille', reviews: { Alice: { status: 'maybe', gender: 'girl' } } },
      ]);
    });
  });

  test('Given the user cancels the file picker, When importing, Then no partner profile is stored', async () => {
    const user = userEvent.setup();
    mockPickCanceled();
    await seedAppStore({ displayName: 'Alex' });
    await renderScreen(<SettingsScreen />);

    await user.press(await screen.findByText('Import a list'));

    expect(await getStoredPartnerProfiles()).toEqual([]);
  });

  test('Given a malformed file, When importing, Then an error is shown and no partner profile is stored', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockPickedFile('not json');
    await seedAppStore({ displayName: 'Alex' });
    await renderScreen(<SettingsScreen />);

    await user.press(await screen.findByText('Import a list'));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Could not import this file. Please check it is a list exported from this app.'));
    expect(await getStoredPartnerProfiles()).toEqual([]);
  });
});
