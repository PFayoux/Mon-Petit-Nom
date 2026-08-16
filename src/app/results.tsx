import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
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
import { type AlphabeticalSection, groupByFirstLetter } from '@/lib/alphabetical-grouping';
import { matchesNameQuery } from '@/lib/name-search';
import { groupNamesByPartnerMatch, type MatchTier } from '@/lib/partner-matching';
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

// "Moi" is always available; the partner tab only exists once one is active
// (see ADR-0008 and CONTEXT.md's "Correspondance") — orthogonal to the
// gender tabs above, not a replacement for them.
type ResultsViewKey = 'me' | 'partner';

const MATCH_EMOJI: Record<MatchTier, string> = {
  strong: '💗',
  partial: '💚',
  soft: '🩶',
};

// Matches DecisionButtons' compact button size — the tallest element in a row —
// so FlatList's getItemLayout can compute offsets without measuring. The gap
// between rows is baked into ROW_SLOT_HEIGHT (via row's marginBottom) so every
// slot, including the last, has the same, easy-to-offset height.
const ROW_HEIGHT = 36;
const ROW_GAP = Spacing.three;
const ROW_SLOT_HEIGHT = ROW_HEIGHT + ROW_GAP;

const SECTION_HEADER_HEIGHT = 28;
const SECTION_HEADER_GAP = Spacing.two;
const SECTION_HEADER_SLOT_HEIGHT = SECTION_HEADER_HEIGHT + SECTION_HEADER_GAP;

// SectionList flattens each section into header-slot + N item-slots +
// footer-slot (always +2, even without a renderSectionFooter — see
// VirtualizedSectionList's _subExtractor), so a plain per-row offset like
// FlatList's getItemLayout above isn't enough; this walks section boundaries
// to find which slot `index` lands in. Cheap: at most 26 sections (A–Z).
function getSectionItemLayout(
  data: readonly AlphabeticalSection[] | null,
  index: number
): { length: number; offset: number; index: number } {
  let offset = 0;
  let remaining = index;
  if (data) {
    for (const section of data) {
      if (remaining === 0) return { length: SECTION_HEADER_SLOT_HEIGHT, offset, index };
      offset += SECTION_HEADER_SLOT_HEIGHT;
      remaining -= 1;

      const itemCount = section.data.length;
      if (remaining < itemCount) {
        return { length: ROW_SLOT_HEIGHT, offset: offset + remaining * ROW_SLOT_HEIGHT, index };
      }
      offset += itemCount * ROW_SLOT_HEIGHT;
      remaining -= itemCount;

      if (remaining === 0) return { length: 0, offset, index };
      remaining -= 1;
    }
  }
  return { length: 0, offset, index };
}

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

type StatusSection = { key: StatusSectionKey; label: string; count: number };

const SWIPE_THRESHOLD = 40;

function cycleStatus(sections: StatusSection[], selected: StatusSectionKey, direction: 1 | -1): StatusSectionKey {
  const index = sections.findIndex((section) => section.key === selected);
  return sections[(index + direction + sections.length) % sections.length].key;
}

const MATCH_TIER_LABEL_KEY: Record<MatchTier, 'strongMatchLabel' | 'partialMatchLabel' | 'softMatchLabel'> = {
  strong: 'strongMatchLabel',
  partial: 'partialMatchLabel',
  soft: 'softMatchLabel',
};

const NameReviewRow = memo(function NameReviewRow({
  name,
  status,
  matchTier,
  onSelect,
  onEditGender,
}: {
  name: string;
  status?: ReviewStatus;
  matchTier?: MatchTier | null;
  onSelect: (name: string, status: ReviewStatus) => void;
  onEditGender: (name: string) => void;
}) {
  const t = useTranslation();
  const canEditGender = status === 'love' || status === 'maybe';

  return (
    <View style={styles.row}>
      <View style={styles.rowNameGroup}>
        <ThemedText style={styles.rowName}>{name}</ThemedText>
        {matchTier && (
          <ThemedText accessibilityLabel={t.results[MATCH_TIER_LABEL_KEY[matchTier]]}>
            {MATCH_EMOJI[matchTier]}
          </ThemedText>
        )}
      </View>
      <View style={styles.rowActions}>
        <DecisionButtons size="compact" selectedStatus={status} onSelect={(status) => onSelect(name, status)} />
        {canEditGender && (
          <Pressable
            accessibilityLabel={t.results.editGenderButton(name)}
            onPress={() => onEditGender(name)}
            style={({ pressed }) => [styles.editGenderButton, pressed && styles.pressed]}>
            <ThemedText style={styles.editGenderIcon}>⋮</ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
});

// The active status (Loved/Maybe/Disliked/Unmarked) is the only one shown as
// a label — the rest are dots, tappable for a direct jump. A pan gesture
// anywhere on the pill also cycles it (not just via the ‹ › buttons):
// activeOffsetX gives it a small deadzone so a tap doesn't register as a
// drag, and failOffsetY yields to a more-vertical gesture (e.g. scrolling
// the list right below it).
const StatusTabPill = memo(function StatusTabPill({
  sections,
  selected,
  onSelect,
}: {
  sections: StatusSection[];
  selected: StatusSectionKey;
  onSelect: (key: StatusSectionKey) => void;
}) {
  const theme = useTheme();
  const t = useTranslation();

  const goToPrevious = useCallback(
    () => onSelect(cycleStatus(sections, selected, -1)),
    [sections, selected, onSelect]
  );
  const goToNext = useCallback(() => onSelect(cycleStatus(sections, selected, 1)), [sections, selected, onSelect]);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-20, 20])
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) runOnJS(goToNext)();
      else if (event.translationX > SWIPE_THRESHOLD) runOnJS(goToPrevious)();
    });

  const active = sections.find((section) => section.key === selected)!;

  return (
    <GestureDetector gesture={gesture}>
      <ThemedView type="surface" style={styles.statusPill}>
        <Pressable
          accessibilityLabel={t.results.previousStatusTabButton}
          hitSlop={8}
          onPress={goToPrevious}
          style={styles.chevronButton}>
          <ThemedText type="smallBold">‹</ThemedText>
        </Pressable>
        <View style={styles.statusCenter}>
          <ThemedText type="smallBold">{`${active.label} (${active.count})`}</ThemedText>
          <View style={styles.statusDots}>
            {sections.map((section) => (
              <Pressable
                key={section.key}
                accessibilityLabel={`${section.label} (${section.count})`}
                hitSlop={8}
                onPress={() => onSelect(section.key)}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: section.key === selected ? theme.primary : theme.border },
                  ]}
                />
              </Pressable>
            ))}
          </View>
        </View>
        <Pressable
          accessibilityLabel={t.results.nextStatusTabButton}
          hitSlop={8}
          onPress={goToNext}
          style={styles.chevronButton}>
          <ThemedText type="smallBold">›</ThemedText>
        </Pressable>
      </ThemedView>
    </GestureDetector>
  );
});

const SectionHeader = memo(function SectionHeader({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <ThemedView style={[styles.sectionHeader, { borderBottomColor: theme.border }]}>
      <ThemedView type="surface" style={[styles.sectionHeaderBadge, { borderColor: theme.border }]}>
        <ThemedText type="smallBold">{title}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
});

export default function ResultsScreen() {
  const { reviews, setReview, activePartnerProfile } = useAppStore();
  const t = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedGender, setSelectedGender] = useState<ResultsGenderFilter>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusSectionKey>('love');
  const [selectedView, setSelectedView] = useState<ResultsViewKey>('me');
  const [editingGenderName, setEditingGenderName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const groups = useMemo(() => groupNamesByStatus(reviews, NAMES, selectedGender), [reviews, selectedGender]);

  // Only computed once a partner is active — drives both the partner tab's
  // own Aimé/Peut-être lists and the match badges overlaid on "Moi" tabs.
  // Gender-filtered by the partner's own chosen gender (see ADR-0009), so
  // the gender tabs apply to the partner view too (see ADR-0008: the two
  // tab rows are independent).
  const partnerMatches = useMemo(
    () =>
      activePartnerProfile
        ? groupNamesByPartnerMatch(reviews, activePartnerProfile.reviews, NAMES, selectedGender)
        : null,
    [reviews, activePartnerProfile, selectedGender]
  );

  const matchTierByName = useMemo(() => {
    if (!partnerMatches) return null;
    const map = new Map<string, MatchTier>();
    for (const entry of [...partnerMatches.love, ...partnerMatches.maybe]) {
      if (entry.matchTier) map.set(entry.name, entry.matchTier);
    }
    return map;
  }, [partnerMatches]);

  const isPartnerView = selectedView === 'partner' && partnerMatches !== null;

  function handleSelectView(view: ResultsViewKey) {
    setSelectedView(view);
    // The partner tab only ever has Aimé/Peut-être (no Pas aimé/Non classé —
    // dislikes aren't shared, see ADR-0008) — fall back to Aimé if the
    // previously selected status doesn't apply there.
    if (view === 'partner' && selectedStatus !== 'love' && selectedStatus !== 'maybe') {
      setSelectedStatus('love');
    }
  }

  const genderSections: { key: ResultsGenderFilter; label: string }[] = [
    { key: 'all', label: t.results.allGenderTab },
    { key: 'boy', label: t.gender.boy },
    { key: 'girl', label: t.gender.girl },
    { key: 'both', label: t.gender.both },
  ];

  const viewSections: { key: ResultsViewKey; label: string }[] | null = activePartnerProfile
    ? [
        { key: 'me', label: t.results.myViewTab },
        { key: 'partner', label: activePartnerProfile.displayName },
      ]
    : null;

  const sections: StatusSection[] = isPartnerView
    ? [
        { key: 'love', label: t.results.lovedSection, count: partnerMatches.love.length },
        { key: 'maybe', label: t.results.maybeSection, count: partnerMatches.maybe.length },
      ]
    : [
        { key: 'love', label: t.results.lovedSection, count: groups.love.length },
        { key: 'maybe', label: t.results.maybeSection, count: groups.maybe.length },
        { key: 'dislike', label: t.results.dislikedSection, count: groups.dislike.length },
        { key: 'unmarked', label: t.results.unmarkedSection, count: groups.unmarked.length },
      ];

  const selectedNames =
    isPartnerView && (selectedStatus === 'love' || selectedStatus === 'maybe')
      ? partnerMatches[selectedStatus].map((entry) => entry.name)
      : groups[selectedStatus];

  // Search narrows whatever the gender/view/status tabs already show — it
  // never widens the list, and tab counts above stay based on the unfiltered
  // set so switching status/gender tabs doesn't visually jump around.
  const isSearching = searchQuery.trim().length > 0;
  const displayedNames = selectedNames.filter((name) => matchesNameQuery(name, searchQuery));

  // An active search collapses the letter headers (decided when the search
  // bar itself was built) — a query already narrows the list enough that
  // per-letter grouping is redundant, so it renders as a flat FlatList
  // instead of the grouped SectionList below.
  const groupedSections = useMemo(() => groupByFirstLetter(displayedNames), [displayedNames]);

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

  // Shared between the flat FlatList (searching) and the grouped SectionList
  // (browsing) — both render callbacks hand back an object with at least an
  // `item: string` field, which is all this needs.
  const renderItem = useCallback(
    ({ item: name }: { item: string }) => (
      <NameReviewRow
        name={name}
        status={reviews[name]?.status}
        matchTier={matchTierByName?.get(name)}
        onSelect={handleRowSelect}
        onEditGender={handleEditGender}
      />
    ),
    [reviews, matchTierByName, handleRowSelect, handleEditGender]
  );

  const renderSectionHeader = useCallback(({ section }: { section: AlphabeticalSection }) => {
    return <SectionHeader title={section.title} />;
  }, []);

  const flatItemLayout = useCallback(
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
          <View style={styles.filterRow}>
            <SegmentedTabBar sections={genderSections} selected={selectedGender} onSelect={setSelectedGender} />
            {viewSections && (
              <SegmentedTabBar sections={viewSections} selected={selectedView} onSelect={handleSelectView} />
            )}
          </View>
          <View style={styles.headerGap} />
          <StatusTabPill sections={sections} selected={selectedStatus} onSelect={setSelectedStatus} />
          <View style={styles.headerGap} />
          <View style={styles.searchRow}>
            <TextInput
              testID="resultsSearchInput"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t.results.searchPlaceholder}
              placeholderTextColor={theme.textSecondary}
              autoCorrect={false}
              autoCapitalize="none"
              style={[
                styles.searchInput,
                { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            />
            {searchQuery.length > 0 && (
              <Pressable
                accessibilityLabel={t.results.clearSearchButton}
                onPress={() => setSearchQuery('')}
                style={({ pressed }) => [styles.clearSearchButton, pressed && styles.pressed]}>
                <ThemedText style={styles.clearSearchIcon}>✕</ThemedText>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {isSearching ? (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={displayedNames}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={flatItemLayout}
          initialNumToRender={16}
          windowSize={7}
          ListEmptyComponent={
            <ThemedText themeColor="textSecondary" type="small">
              {t.results.emptySearchResults(searchQuery.trim())}
            </ThemedText>
          }
        />
      ) : (
        <SectionList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          sections={groupedSections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled
          getItemLayout={getSectionItemLayout}
          initialNumToRender={16}
          windowSize={7}
          ListEmptyComponent={
            <ThemedText themeColor="textSecondary" type="small">
              {t.results.emptySection}
            </ThemedText>
          }
        />
      )}

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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.five,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  chevronButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCenter: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  statusDots: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  clearSearchButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearchIcon: {
    fontSize: 16,
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  // Solid background (defaults to theme.background via ThemedView) so the
  // sticky header fully occludes rows scrolling underneath it.
  sectionHeader: {
    height: SECTION_HEADER_HEIGHT,
    justifyContent: 'center',
    marginBottom: SECTION_HEADER_GAP,
    borderBottomWidth: 1,
  },
  sectionHeaderBadge: {
    width: SECTION_HEADER_HEIGHT,
    height: SECTION_HEADER_HEIGHT,
    borderRadius: SECTION_HEADER_HEIGHT / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  rowNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flexShrink: 1,
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
  // type="subtitle" (32/44) left the glyph looking off-center next to the
  // compact decision buttons' tight 16/20 icon — its oversized line-height
  // doesn't visually center the same way inside the same 36px button.
  editGenderIcon: {
    fontSize: 20,
    lineHeight: 20,
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
