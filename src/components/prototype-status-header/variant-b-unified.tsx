// PROTOTYPE — Variant B for wayfinder ticket #45.
//
// Scope: the redesign reshapes *all* three header rows, not just status —
// gender and Moi/Partenaire collapse into one compact row to free up the
// vertical space the old status ScrollView used to take. The status pill
// itself exposes explicit ‹ › chevrons ("reachable... by the bar itself")
// as well as a swipe across the *whole pill* (not just screen edges, unlike
// Variant A) — a wider, more forgiving gesture zone. Dots sit beside the
// chevrons and are tappable.
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { cycleStatus, type PrototypeBodyProps } from './types';

const SWIPE_THRESHOLD = 40;

export function VariantBUnified({
  genderSections,
  selectedGender,
  onSelectGender,
  viewSections,
  selectedView,
  onSelectView,
  statusSections,
  selectedStatus,
  onSelectStatus,
  headerPaddingTop,
  listData,
  renderItem,
  keyExtractor,
  getItemLayout,
  emptyLabel,
}: PrototypeBodyProps) {
  const theme = useTheme();

  const swipeNext = () => onSelectStatus(cycleStatus(statusSections, selectedStatus, 1));
  const swipePrev = () => onSelectStatus(cycleStatus(statusSections, selectedStatus, -1));

  const pillGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-20, 20])
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) runOnJS(swipeNext)();
      else if (event.translationX > SWIPE_THRESHOLD) runOnJS(swipePrev)();
    });

  const active = statusSections.find((section) => section.key === selectedStatus)!;

  return (
    <View style={styles.screen}>
      <View style={[styles.headerRow, { paddingTop: headerPaddingTop }]}>
        <View style={styles.headerContent}>
          <View style={styles.filterRow}>
            {genderSections.map((section) => (
              <Chip
                key={section.key}
                label={section.label}
                selected={section.key === selectedGender}
                onPress={() => onSelectGender(section.key)}
              />
            ))}
            {viewSections && <View style={styles.divider} />}
            {viewSections?.map((section) => (
              <Chip
                key={section.key}
                label={section.label}
                selected={section.key === selectedView}
                onPress={() => onSelectView(section.key)}
              />
            ))}
          </View>

          <View style={styles.gap} />

          <GestureDetector gesture={pillGesture}>
            <ThemedView testID="prototype-status-pill" type="surface" style={styles.statusPill}>
              <Pressable testID="prototype-chevron-prev" hitSlop={12} onPress={swipePrev} style={styles.chevron}>
                <ThemedText type="smallBold">‹</ThemedText>
              </Pressable>
              <View style={styles.statusCenter}>
                <ThemedText type="smallBold">
                  {active.count === undefined ? active.label : `${active.label} (${active.count})`}
                </ThemedText>
                <View style={styles.dots}>
                  {statusSections.map((section) => (
                    <Pressable
                      key={section.key}
                      testID={`prototype-dot-${section.key}`}
                      hitSlop={8}
                      onPress={() => onSelectStatus(section.key)}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: section.key === selectedStatus ? theme.primary : theme.border },
                        ]}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
              <Pressable testID="prototype-chevron-next" hitSlop={12} onPress={swipeNext} style={styles.chevron}>
                <ThemedText type="smallBold">›</ThemedText>
              </Pressable>
            </ThemedView>
          </GestureDetector>
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={16}
        windowSize={7}
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" type="small">
            {emptyLabel}
          </ThemedText>
        }
      />
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && !selected && styles.pressed}>
      <ThemedView type={selected ? 'primary' : 'surface'} style={styles.chip}>
        <ThemedText type="small" themeColor={selected ? 'onPrimary' : 'text'}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
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
    maxWidth: 800,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    marginHorizontal: Spacing.one,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
  gap: {
    height: Spacing.three,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.five,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  chevron: {
    paddingHorizontal: Spacing.two,
  },
  statusCenter: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
});
