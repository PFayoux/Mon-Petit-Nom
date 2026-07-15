import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useTranslation } from '@/i18n/use-translation';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const t = useTranslation();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.primary}
      rippleColor={colors.primaryPressed}
      iconColor={{ default: colors.textSecondary, selected: colors.onPrimary }}
      labelStyle={{
        default: { color: colors.textSecondary },
        selected: { color: colors.primary },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t.tabs.swipe}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'heart', selected: 'heart.fill' }}
          md={{ default: 'favorite_border', selected: 'favorite' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="results">
        <NativeTabs.Trigger.Label>{t.tabs.results}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'list.bullet', selected: 'list.bullet' }}
          md={{ default: 'format_list_bulleted', selected: 'format_list_bulleted' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{t.tabs.settings}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          md={{ default: 'settings', selected: 'settings' }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
