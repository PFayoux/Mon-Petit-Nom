import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DecisionButtons } from '@/components/decision-buttons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { BOY_NAMES } from '@/data/boy-names';
import { useAppStore } from '@/hooks/use-app-store';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n/use-translation';
import type { ReviewMap, ReviewStatus } from '@/types/name';

type NamesBySection = {
  love: string[];
  maybe: string[];
  dislike: string[];
  unmarked: string[];
};

function groupNamesByStatus(reviews: ReviewMap): NamesBySection {
  const groups: NamesBySection = { love: [], maybe: [], dislike: [], unmarked: [] };
  for (const name of BOY_NAMES) {
    const status = reviews[name];
    groups[status ?? 'unmarked'].push(name);
  }
  for (const names of Object.values(groups)) {
    names.sort((a, b) => a.localeCompare(b));
  }
  return groups;
}

function NameReviewRow({
  name,
  status,
  onSelect,
}: {
  name: string;
  status?: ReviewStatus;
  onSelect: (status: ReviewStatus) => void;
}) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.rowName}>{name}</ThemedText>
      <DecisionButtons size="compact" selectedStatus={status} onSelect={onSelect} />
    </View>
  );
}

export default function ResultsScreen() {
  const { displayName, reviews, setReview, setDisplayName, resetAllReviews } = useAppStore();
  const t = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [nameDraft, setNameDraft] = useState(displayName ?? '');

  const groups = useMemo(() => groupNamesByStatus(reviews), [reviews]);

  const sections: { key: keyof NamesBySection; label: string }[] = [
    { key: 'love', label: t.results.lovedSection },
    { key: 'maybe', label: t.results.maybeSection },
    { key: 'dislike', label: t.results.dislikedSection },
    { key: 'unmarked', label: t.results.unmarkedSection },
  ];

  function handleSaveDisplayName() {
    const trimmed = nameDraft.trim();
    if (trimmed) {
      setDisplayName(trimmed);
    }
  }

  function handleResetPress() {
    // Alert.alert() is a no-op on react-native-web, so the web build needs its own confirm path.
    if (Platform.OS === 'web') {
      if (window.confirm(`${t.results.resetConfirmTitle}\n\n${t.results.resetConfirmMessage}`)) {
        resetAllReviews();
      }
      return;
    }
    Alert.alert(t.results.resetConfirmTitle, t.results.resetConfirmMessage, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.results.resetButton, style: 'destructive', onPress: resetAllReviews },
    ]);
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom + BottomTabInset },
      ]}>
      <ThemedView style={styles.container}>
        {sections.map(({ key, label }) => {
          const names = groups[key];
          return (
            <Collapsible key={key} title={`${label} (${names.length})`}>
              {names.length === 0 ? (
                <ThemedText themeColor="textSecondary" type="small">
                  {t.results.emptySection}
                </ThemedText>
              ) : (
                <View style={styles.rowList}>
                  {names.map((name) => (
                    <NameReviewRow
                      key={name}
                      name={name}
                      status={reviews[name]}
                      onSelect={(status) => setReview(name, status)}
                    />
                  ))}
                </View>
              )}
            </Collapsible>
          );
        })}

        <ThemedView type="backgroundElement" style={styles.settings}>
          <ThemedText type="smallBold">{t.results.settingsTitle}</ThemedText>

          <ThemedView style={styles.settingsRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {t.results.displayNameLabel}
            </ThemedText>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              onSubmitEditing={handleSaveDisplayName}
              onBlur={handleSaveDisplayName}
              returnKeyType="done"
              style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
            />
          </ThemedView>

          <Pressable
            onPress={handleResetPress}
            style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}>
            <ThemedText type="link" themeColor="text">
              {t.results.resetButton}
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
  rowList: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  rowName: {
    flexShrink: 1,
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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  resetButton: {
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.7,
  },
});
