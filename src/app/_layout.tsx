import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { AppStoreProvider, useAppStore } from '@/hooks/use-app-store';
import { useSharedFileImport } from '@/hooks/use-shared-file-import';

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { isHydrated, displayName } = useAppStore();
  useSharedFileImport();

  if (!isHydrated) {
    return null;
  }

  return displayName ? <AppTabs /> : <OnboardingScreen />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppStoreProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <RootNavigation />
        </ThemeProvider>
      </AppStoreProvider>
    </GestureHandlerRootView>
  );
}
