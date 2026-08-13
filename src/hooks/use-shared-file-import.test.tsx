import { Alert } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { AppStoreProvider } from '@/hooks/use-app-store';
import { getStoredActivePartnerName, getStoredPartnerProfiles, getStoredReviews, seedAppStore } from '@/lib/test-utils';

import { useSharedFileImport } from './use-shared-file-import';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

let mockUrl: string | null = null;
const mockClearInitialURL = jest.fn();
jest.mock('expo-linking', () => ({
  useLinkingURL: () => mockUrl,
  clearInitialURL: () => mockClearInitialURL(),
}));

let mockFileText = '';
let mockFileShouldThrow = false;
jest.mock('expo-file-system', () => ({
  File: class {
    async text() {
      if (mockFileShouldThrow) throw new Error('Could not read file');
      return mockFileText;
    }
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <AppStoreProvider>{children}</AppStoreProvider>;
}

function confirmRestore(alertSpy: jest.SpyInstance) {
  const [, , buttons] = alertSpy.mock.calls[alertSpy.mock.calls.length - 1];
  const destructive = (buttons as { style?: string; onPress?: () => void }[]).find(
    (button) => button.style === 'destructive'
  );
  return act(async () => destructive?.onPress?.());
}

describe('useSharedFileImport', () => {
  beforeEach(() => {
    mockUrl = null;
    mockFileText = '';
    mockFileShouldThrow = false;
    jest.clearAllMocks();
  });

  test('Given a content:// URI with a partner export, When the hook runs, Then the profile is imported and Settings is opened', async () => {
    mockFileText = JSON.stringify({ displayName: 'Camille', reviews: { Jean: { status: 'love', gender: 'boy' } } });
    mockUrl = 'content://com.whatsapp.provider/shared.json';
    await seedAppStore({ displayName: 'Alex' });

    await renderHook(() => useSharedFileImport(), { wrapper });

    await waitFor(async () => {
      expect(await getStoredPartnerProfiles()).toEqual([
        { displayName: 'Camille', reviews: { Jean: { status: 'love', gender: 'boy' } } },
      ]);
    });
    expect(mockReplace).toHaveBeenCalledWith('/settings');
  });

  test('Given a content:// URI with a backup, When the hook runs and the user confirms, Then local data is replaced', async () => {
    mockFileText = JSON.stringify({
      kind: 'backup',
      version: 1,
      displayName: 'Restored',
      reviews: { Bob: { status: 'dislike', gender: 'both' } },
      partnerProfiles: [],
      activePartnerName: null,
    });
    mockUrl = 'content://com.android.providers.downloads.documents/shared.json';
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await seedAppStore({ displayName: 'Alex', reviews: { Jean: { status: 'love', gender: 'boy' } } });

    await renderHook(() => useSharedFileImport(), { wrapper });

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    await confirmRestore(alertSpy);

    await waitFor(async () => expect(await getStoredReviews()).toEqual({ Bob: { status: 'dislike', gender: 'both' } }));
    expect(await getStoredActivePartnerName()).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/settings');
  });

  test('Given a content:// URI with unrelated JSON, When the hook runs, Then an "unrecognized" alert is shown and nothing is imported', async () => {
    mockFileText = JSON.stringify({ some: 'other app config' });
    mockUrl = 'content://some.other.app/config.json';
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await seedAppStore({ displayName: 'Alex' });

    await renderHook(() => useSharedFileImport(), { wrapper });

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith("This file isn't recognized by Mon Petit Nom."));
    expect(await getStoredPartnerProfiles()).toEqual([]);
  });

  test('Given the file cannot be read, When the hook runs, Then an "unrecognized" alert is shown', async () => {
    mockFileShouldThrow = true;
    mockUrl = 'content://some.provider/shared.json';
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await seedAppStore({ displayName: 'Alex' });

    await renderHook(() => useSharedFileImport(), { wrapper });

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith("This file isn't recognized by Mon Petit Nom."));
  });

  test('Given a URL that is not a content:// URI, When the hook runs, Then nothing happens', async () => {
    mockUrl = 'myfindnameapplication://some/route';
    await seedAppStore({ displayName: 'Alex' });

    await renderHook(() => useSharedFileImport(), { wrapper });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('Given onboarding is not complete (no display name yet), When a content:// URL arrives, Then nothing is imported', async () => {
    mockFileText = JSON.stringify({ displayName: 'Camille', reviews: {} });
    mockUrl = 'content://com.whatsapp.provider/shared.json';

    await renderHook(() => useSharedFileImport(), { wrapper });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(await getStoredPartnerProfiles()).toEqual([]);
  });

  test('Given the same URL is still current, When the hook re-renders, Then the file is not processed again', async () => {
    mockFileText = JSON.stringify({ displayName: 'Camille', reviews: {} });
    mockUrl = 'content://com.whatsapp.provider/shared.json';
    await seedAppStore({ displayName: 'Alex' });

    const { rerender } = await renderHook(() => useSharedFileImport(), { wrapper });
    await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1));

    await rerender({});
    await rerender({});

    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});
