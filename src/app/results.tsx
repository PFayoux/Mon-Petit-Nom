import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DecisionButtons } from '@/components/decision-buttons';
import { GenderPicker } from '@/components/gender-picker';
import { SegmentedTabBar } from '@/components/segmented-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';
import { GENDER_BY_NAME, NAMES, getDefaultReviewGender, matchesReviewGenderFilter } from '@/data/names';
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

// The Résultats gender tabs add a 4th option beyond Gender ('boy' | 'girl' |
// 'both'): 'all' is an overview showing everything regardless of gender, and
// is the default landing tab. Unlike Swipe's "both" filter (which also means
// "show everyone" — see matchesGenderFilter), "both" here is an exact match:
// only names/reviews genuinely tagged 'both' (see ADR-0005).
type ResultsGenderFilter = Gender | 'all';

// Matches DecisionButtons' compact button size — the tallest element in a row —
// so FlatList's getItemLayout can compute offsets without measuring. The gap
// between rows is baked into ROW_SLOT_HEIGHT (via row's marginBottom) so every
// slot, including the last, has the same, easy-to-offset height.
const ROW_HEIGHT = 36;
const ROW_GAP = Spacing.three;
const ROW_SLOT_HEIGHT = ROW_HEIGHT + ROW_GAP;

// Once a name has a love/maybe review, the gender the user chose for it
// (`review.gender`) decides which gender tab it shows up in — not the name's
// default gender. Dislike and unmarked names have no chosen gender, so they
// keep filtering on the name's default gender (see CONTEXT.md's "Genre choisi").
function groupNamesByStatus(
  reviews: ReviewMap,
  names: readonly { name: string; gender: Gender }[],
  selectedGender: ResultsGenderFilter
): NamesBySection {
  const groups: NamesBySection = { love: [], maybe: [], dislike: [], unmarked: [] };
  for (const { name, gender: defaultGender } of names) {
    const review = reviews[name];
    if (review?.status === 'love' || review?.status === 'maybe') {
      if (selectedGender === 'all' || matchesReviewGenderFilter(review.gender, selectedGender)) {
        groups[review.status].push(name);
      }
    } else if (selectedGender === 'all' || matchesReviewGenderFilter(defaultGender, selectedGender)) {
      groups[review?.status ?? 'unmarked'].push(name);
    }
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
  onEditGender,
}: {
  name: string;
  status?: ReviewStatus;
  onSelect: (name: string, status: ReviewStatus) => void;
  onEditGender: (name: string) => void;
}) {
  const t = useTranslation();
  const canEditGender = status === 'love' || status === 'maybe';

  return (
    <View style={styles.row}>
      <ThemedText style={styles.rowName}>{name}</ThemedText>
      <View style={styles.rowActions}>
        <DecisionButtons size="compact" selectedStatus={status} onSelect={(status) => onSelect(name, status)} />
        {canEditGender && (
          <Pressable
            accessibilityLabel={t.results.editGenderButton(name)}
            onPress={() => onEditGender(name)}
            style={({ pressed }) => [styles.editGenderButton, pressed && styles.pressed]}>
            <ThemedText type="subtitle">⋮</ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
});

export default function ResultsScreen() {
  const { reviews, setReview } = useAppStore();
  const t = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedGender, setSelectedGender] = useState<ResultsGenderFilter>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusSectionKey>('love');
  const [editingGenderName, setEditingGenderName] = useState<string | null>(null);

  const groups = useMemo(() => groupNamesByStatus(reviews, NAMES, selectedGender), [reviews, selectedGender]);

  const genderSections: { key: ResultsGenderFilter; label: string }[] = [
    { key: 'all', label: t.results.allGenderTab },
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
      // Changing status alone keeps a name's already-chosen gender — only the
      // "⋮" menu is meant to change it (CONTEXT.md's "Genre choisi"). A brand
      // new review falls back to the current gender tab's default — "all"
      // has no specific gender of its own, so it falls back the same way
      // "both" already did: the name's own default gender.
      const genderTabForDefault = selectedGender === 'all' ? 'both' : selectedGender;
      const gender = reviews[name]?.gender ?? getDefaultReviewGender(genderTabForDefault, GENDER_BY_NAME.get(name)!);
      setReview(name, status, gender);
    },
    [reviews, selectedGender, setReview]
  );

  const handleEditGender = useCallback((name: string) => {
    setEditingGenderName(name);
  }, []);

  const handleGenderCorrection = useCallback(
    (gender: Gender) => {
      if (!editingGenderName) return;
      const status = reviews[editingGenderName]?.status;
      if (!status) return;
      setReview(editingGenderName, status, gender);
      setEditingGenderName(null);
    },
    [editingGenderName, reviews, setReview]
  );

  const renderItem = useCallback(
    ({ item: name }: ListRenderItemInfo<string>) => (
      <NameReviewRow
        name={name}
        status={reviews[name]?.status}
        onSelect={handleRowSelect}
        onEditGender={handleEditGender}
      />
    ),
    [reviews, handleRowSelect, handleEditGender]
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

      <Modal
        visible={editingGenderName !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingGenderName(null)}>
        <Pressable
          style={styles.modalOverlay}
          accessibilityLabel={t.common.cancel}
          onPress={() => setEditingGenderName(null)}>
          <Pressable style={styles.modalCardWrapper} onPress={() => {}}>
            <ThemedView testID="genderCorrectionModal" type="surface" style={styles.modalCard}>
              <ThemedText type="subtitle" style={styles.centerText}>
                {editingGenderName}
              </ThemedText>
              <ThemedText themeColor="textSecondary" type="small" style={styles.centerText}>
                {t.results.editGenderModalTitle}
              </ThemedText>
              {editingGenderName && (
                <GenderPicker
                  selected={reviews[editingGenderName]?.gender ?? 'both'}
                  onSelect={handleGenderCorrection}
                />
              )}
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
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
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  editGenderButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: Spacing.four,
  },
  modalCardWrapper: {
    width: '100%',
    maxWidth: 320,
  },
  modalCard: {
    borderRadius: Spacing.four,
    padding: Spacing.five,
    gap: Spacing.three,
  },
  centerText: {
    textAlign: 'center',
  },
});
