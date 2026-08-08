import { Alert } from 'react-native';
import { File } from 'expo-file-system';
import { screen, userEvent, waitFor } from '@testing-library/react-native';

import SettingsScreen from '@/app/settings';
import { getStoredActivePartnerName, getStoredPartnerProfiles, renderScreen, seedAppStore } from '@/lib/test-utils';

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

  describe('selecting and managing the active partner', () => {
    const CAMILLE = { displayName: 'Camille', reviews: {} };
    const ALICE = { displayName: 'Alice', reviews: {} };

    test('Given imported partner profiles, When the user selects one, Then it is stored as the active partner', async () => {
      const user = userEvent.setup();
      await seedAppStore({ displayName: 'Alex', partnerProfiles: [CAMILLE, ALICE] });
      await renderScreen(<SettingsScreen />);

      await user.press(await screen.findByLabelText('Compare with Camille'));

      await waitFor(async () => expect(await getStoredActivePartnerName()).toBe('Camille'));
    });

    test('Given an active partner, When the user selects it again, Then the active partner is cleared', async () => {
      const user = userEvent.setup();
      await seedAppStore({
        displayName: 'Alex',
        partnerProfiles: [CAMILLE, ALICE],
        activePartnerName: 'Camille',
      });
      await renderScreen(<SettingsScreen />);

      await user.press(await screen.findByLabelText('Stop comparing with Camille'));

      await waitFor(async () => expect(await getStoredActivePartnerName()).toBeNull());
    });

    test('Given the active partner is removed, When the profile list is checked, Then both the profile and the active selection are gone', async () => {
      const user = userEvent.setup();
      await seedAppStore({
        displayName: 'Alex',
        partnerProfiles: [CAMILLE, ALICE],
        activePartnerName: 'Camille',
      });
      await renderScreen(<SettingsScreen />);

      await user.press(await screen.findByLabelText("Remove Camille's list"));

      await waitFor(async () => expect(await getStoredPartnerProfiles()).toEqual([ALICE]));
      expect(await getStoredActivePartnerName()).toBeNull();
    });

    test('Given a non-active partner is removed, When the profile list is checked, Then the active partner is unaffected', async () => {
      const user = userEvent.setup();
      await seedAppStore({
        displayName: 'Alex',
        partnerProfiles: [CAMILLE, ALICE],
        activePartnerName: 'Camille',
      });
      await renderScreen(<SettingsScreen />);

      await user.press(await screen.findByLabelText("Remove Alice's list"));

      await waitFor(async () => expect(await getStoredPartnerProfiles()).toEqual([CAMILLE]));
      expect(await getStoredActivePartnerName()).toBe('Camille');
    });
  });
});
