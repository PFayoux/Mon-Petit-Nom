import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DecisionButtons } from '@/components/decision-buttons';
import { StatusTabBar } from '@/components/status-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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

type StatusSectionKey = keyof NamesBySection;

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

  const [selectedStatus, setSelectedStatus] = useState<StatusSectionKey>('love');

  const groups = useMemo(() => groupNamesByStatus(reviews), [reviews]);

  const sections: { key: StatusSectionKey; label: string; count: number }[] = [
    { key: 'love', label: t.results.lovedSection, count: groups.love.length },
    { key: 'maybe', label: t.results.maybeSection, count: groups.maybe.length },
    { key: 'dislike', label: t.results.dislikedSection, count: groups.dislike.length },
    { key: 'unmarked', label: t.results.unmarkedSection, count: groups.unmarked.length },
  ];

  const selectedNames = groups[selectedStatus];

  return (
    <ThemedView style={[styles.screen, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.headerRow,
          // The native tab bar already reserves its own space at the bottom, so we
          // only add breathing room here rather than re-adding the safe-area inset.
          { paddingTop: insets.top + TopTabInset + Spacing.four },
        ]}>
        <View style={styles.headerContent}>
          <StatusTabBar sections={sections} selected={selectedStatus} onSelect={setSelectedStatus} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.container}>
          {selectedNames.length === 0 ? (
            <ThemedText themeColor="textSecondary" type="small">
              {t.results.emptySection}
            </ThemedText>
          ) : (
            <View style={styles.rowList}>
              {selectedNames.map((name) => (
                <NameReviewRow
                  key={name}
                  name={name}
                  status={reviews[name]}
                  onSelect={(status) => setReview(name, status)}
                />
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.three,
  },
  headerContent: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.six,
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
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
