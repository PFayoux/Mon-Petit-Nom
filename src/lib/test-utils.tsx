import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';

import { AppStoreProvider } from '@/hooks/use-app-store';
import type { PartnerProfile, ReviewMap } from '@/types/name';

const DISPLAY_NAME_KEY = '@mon-petit-nom/display-name';
const REVIEWS_KEY = '@mon-petit-nom/reviews';
const PARTNER_PROFILES_KEY = '@mon-petit-nom/partner-profiles';

// Pre-populates the mocked AsyncStorage so AppStoreProvider hydrates with this
// state on the next render, instead of starting empty.
export async function seedAppStore({
  displayName,
  reviews,
  partnerProfiles,
}: {
  displayName?: string;
  reviews?: ReviewMap;
  partnerProfiles?: PartnerProfile[];
}) {
  if (displayName !== undefined) {
    await AsyncStorage.setItem(DISPLAY_NAME_KEY, displayName);
  }
  if (reviews !== undefined) {
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }
  if (partnerProfiles !== undefined) {
    await AsyncStorage.setItem(PARTNER_PROFILES_KEY, JSON.stringify(partnerProfiles));
  }
}

// Reads back what the app actually persisted, for asserting on state that
// isn't (yet) surfaced anywhere in the UI.
export async function getStoredReviews(): Promise<ReviewMap> {
  const raw = await AsyncStorage.getItem(REVIEWS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function getStoredPartnerProfiles(): Promise<PartnerProfile[]> {
  const raw = await AsyncStorage.getItem(PARTNER_PROFILES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function AllProviders({ children }: { children: ReactNode }) {
  return <AppStoreProvider>{children}</AppStoreProvider>;
}

export function renderScreen(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react-native';
