import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';

import { AppStoreProvider } from '@/hooks/use-app-store';
import type { ReviewMap } from '@/types/name';

const DISPLAY_NAME_KEY = '@mon-petit-nom/display-name';
const REVIEWS_KEY = '@mon-petit-nom/reviews';

// Pre-populates the mocked AsyncStorage so AppStoreProvider hydrates with this
// state on the next render, instead of starting empty.
export async function seedAppStore({
  displayName,
  reviews,
}: {
  displayName?: string;
  reviews?: ReviewMap;
}) {
  if (displayName !== undefined) {
    await AsyncStorage.setItem(DISPLAY_NAME_KEY, displayName);
  }
  if (reviews !== undefined) {
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }
}

function AllProviders({ children }: { children: ReactNode }) {
  return <AppStoreProvider>{children}</AppStoreProvider>;
}

export function renderScreen(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react-native';
