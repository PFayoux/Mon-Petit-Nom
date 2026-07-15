import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DecisionButtons } from '@/components/decision-buttons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';
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
  const { reviews, setReview } = useAppStore();
  const t = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const groups = useMemo(() => groupNamesByStatus(reviews), [reviews]);

  const sections: { key: keyof NamesBySection; label: string }[] = [
    { key: 'love', label: t.results.lovedSection },
    { key: 'maybe', label: t.results.maybeSection },
    { key: 'dislike', label: t.results.dislikedSection },
    { key: 'unmarked', label: t.results.unmarkedSection },
  ];

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
});
