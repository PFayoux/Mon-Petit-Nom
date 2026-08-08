import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';
import { useAppStore } from '@/hooks/use-app-store';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n/use-translation';
import { buildPartnerExport, exportPartnerProfile } from '@/lib/partner-export';
import { parsePartnerProfile } from '@/lib/partner-import';

export default function SettingsScreen() {
  const { displayName, setDisplayName, resetAllReviews, reviews, importPartnerProfile } = useAppStore();
  const t = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [nameDraft, setNameDraft] = useState(displayName ?? '');
  // Partner list sharing is scoped to iOS/Android: expo-sharing doesn't support
  // sharing local files on web, so import is hidden alongside it there too
  // rather than offering half a feature (see ADR-0008).
  const [canSharePartnerLists, setCanSharePartnerLists] = useState(false);

  useEffect(() => {
    Sharing.isAvailableAsync().then(setCanSharePartnerLists);
  }, []);

  function handleSaveDisplayName() {
    const trimmed = nameDraft.trim();
    if (trimmed) {
      setDisplayName(trimmed);
    }
  }

  function handleResetPress() {
    // Alert.alert() is a no-op on react-native-web, so the web build needs its own confirm path.
    if (Platform.OS === 'web') {
      if (window.confirm(`${t.settings.resetConfirmTitle}\n\n${t.settings.resetConfirmMessage}`)) {
        resetAllReviews();
      }
      return;
    }
    Alert.alert(t.settings.resetConfirmTitle, t.settings.resetConfirmMessage, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.settings.resetButton, style: 'destructive', onPress: resetAllReviews },
    ]);
  }

  async function handleSharePress() {
    if (!displayName) return;
    try {
      await exportPartnerProfile(buildPartnerExport(displayName, reviews));
    } catch {
      // canSharePartnerLists gates this button off on web, so Alert.alert() (a no-op there) is always safe here.
      Alert.alert(t.settings.shareErrorMessage);
    }
  }

  async function handleImportPress() {
    const picked = await File.pickFileAsync({ mimeTypes: 'application/json' });
    if (picked.canceled) return;

    try {
      const jsonText = await picked.result.text();
      importPartnerProfile(parsePartnerProfile(jsonText));
    } catch {
      // canSharePartnerLists gates this button off on web, so Alert.alert() (a no-op there) is always safe here.
      Alert.alert(t.settings.importErrorMessage);
    }
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        // The native tab bar already reserves its own space at the bottom, so we
        // only add breathing room here rather than re-adding the safe-area inset.
        { paddingTop: insets.top + TopTabInset + Spacing.four, paddingBottom: Spacing.six },
      ]}>
      <ThemedView style={styles.container}>
        <ThemedView type="surface" style={styles.settings}>
          <ThemedText type="smallBold">{t.settings.title}</ThemedText>

          <View style={styles.settingsRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {t.settings.displayNameLabel}
            </ThemedText>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              onSubmitEditing={handleSaveDisplayName}
              onBlur={handleSaveDisplayName}
              returnKeyType="done"
              style={[
                styles.input,
                { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
              ]}
            />
          </View>

          {canSharePartnerLists && (
            <>
              <Pressable
                onPress={handleSharePress}
                style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
                <ThemedText type="link" themeColor="text">
                  {t.settings.shareButton}
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={handleImportPress}
                style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
                <ThemedText type="link" themeColor="text">
                  {t.settings.importButton}
                </ThemedText>
              </Pressable>
            </>
          )}

          <Pressable
            onPress={handleResetPress}
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
            <ThemedText type="link" themeColor="text">
              {t.settings.resetButton}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  settings: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  settingsRow: {
    gap: Spacing.one,
  },
  input: {
    borderRadius: Spacing.two,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  linkButton: {
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.7,
  },
});
