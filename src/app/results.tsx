import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DecisionButtons } from '@/components/decision-buttons';
import { SegmentedTabBar } from '@/components/segmented-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';
import { GENDER_BY_NAME, getDefaultReviewGender, getNamesForGender } from '@/data/names';
import { useAppStore } from '@/hooks/use-app-store';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n/use-translation';
import type { Gender, ReviewMap, ReviewStatus } from '@/types/name';

type NamesBySection = {
  love: string[];
  maybe: string[];
  dislike: string[];
  unmarked: string[];
};

type StatusSectionKey = keyof NamesBySection;

// Matches DecisionButtons' compact button size — the tallest element in a row —
// so FlatList's getItemLayout can compute offsets without measuring. The gap
// between rows is baked into ROW_SLOT_HEIGHT (via row's marginBottom) so every
// slot, including the last, has the same, easy-to-offset height.
const ROW_HEIGHT = 36;
const ROW_GAP = Spacing.three;
const ROW_SLOT_HEIGHT = ROW_HEIGHT + ROW_GAP;

function groupNamesByStatus(reviews: ReviewMap, names: readonly { name: string }[]): NamesBySection {
  const groups: NamesBySection = { love: [], maybe: [], dislike: [], unmarked: [] };
  for (const { name } of names) {
    const status = reviews[name]?.status;
    groups[status ?? 'unmarked'].push(name);
  }
  for (const names of Object.values(groups)) {
    names.sort((a, b) => a.localeCompare(b));
  }
  return groups;
}

const NameReviewRow = memo(function NameReviewRow({
  name,
  status,
  onSelect,
}: {
  name: string;
  status?: ReviewStatus;
  onSelect: (name: string, status: ReviewStatus) => void;
}) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.rowName}>{name}</ThemedText>
      <DecisionButtons size="compact" selectedStatus={status} onSelect={(status) => onSelect(name, status)} />
    </View>
  );
});

export default function ResultsScreen() {
  const { reviews, setReview } = useAppStore();
  const t = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedGender, setSelectedGender] = useState<Gender>('both');
  const [selectedStatus, setSelectedStatus] = useState<StatusSectionKey>('love');

  const genderNames = useMemo(() => getNamesForGender(selectedGender), [selectedGender]);
  const groups = useMemo(() => groupNamesByStatus(reviews, genderNames), [reviews, genderNames]);

  const genderSections: { key: Gender; label: string }[] = [
    { key: 'boy', label: t.gender.boy },
    { key: 'girl', label: t.gender.girl },
    { key: 'both', label: t.gender.both },
  ];

  const sections: { key: StatusSectionKey; label: string; count: number }[] = [
    { key: 'love', label: t.results.lovedSection, count: groups.love.length },
    { key: 'maybe', label: t.results.maybeSection, count: groups.maybe.length },
    { key: 'dislike', label: t.results.dislikedSection, count: groups.dislike.length },
    { key: 'unmarked', label: t.results.unmarkedSection, count: groups.unmarked.length },
  ];

  const selectedNames = groups[selectedStatus];

  const handleRowSelect = useCallback(
    (name: string, status: ReviewStatus) => {
      const gender = getDefaultReviewGender(selectedGender, GENDER_BY_NAME.get(name)!);
      setReview(name, status, gender);
    },
    [selectedGender, setReview]
  );

  const renderItem = useCallback(
    ({ item: name }: ListRenderItemInfo<string>) => (
      <NameReviewRow name={name} status={reviews[name]?.status} onSelect={handleRowSelect} />
    ),
    [reviews, handleRowSelect]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: ROW_SLOT_HEIGHT,
      offset: ROW_SLOT_HEIGHT * index,
      index,
    }),
    []
  );

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
          <SegmentedTabBar sections={genderSections} selected={selectedGender} onSelect={setSelectedGender} />
          <View style={styles.headerGap} />
          <SegmentedTabBar sections={sections} selected={selectedStatus} onSelect={setSelectedStatus} />
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={selectedNames}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={16}
        windowSize={7}
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" type="small">
            {t.results.emptySection}
          </ThemedText>
        }
      />
    </ThemedView>
  );
}

function keyExtractor(name: string) {
  return name;
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
  headerGap: {
    height: Spacing.two,
  },
  list: {
    flex: 1,
  },
  listContent: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  row: {
    height: ROW_HEIGHT,
    marginBottom: ROW_GAP,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  rowName: {
    flexShrink: 1,
  },
});
