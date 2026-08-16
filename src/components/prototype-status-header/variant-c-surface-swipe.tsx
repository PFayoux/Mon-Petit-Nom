// PROTOTYPE — Variant C for wayfinder ticket #45.
//
// Scope: only the status row is redesigned (gender/Moi-Partenaire rows
// untouched, same as Variant A) but the swipe gesture is *not* confined to
// the screen edges — it wraps the whole FlatList, so any clearly-horizontal
// drag anywhere in the list switches tabs (no need to find an exact edge).
// activeOffsetX/failOffsetY give the pan a directional lock so a mostly
// vertical drag still scrolls the list normally. Dots are a pure indicator
// here — not tappable — placed inline next to the label instead of below it.
import { FlatList, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { SegmentedTabBar } from '@/components/segmented-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { cycleStatus, type PrototypeBodyProps } from './types';

const SWIPE_THRESHOLD = 60;

export function VariantCSurfaceSwipe({
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

  // Directional lock: only a drag that moves noticeably more horizontally
  // than vertically activates the pan, so vertical list scrolling is
  // unaffected everywhere else in the list.
  const surfaceGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) runOnJS(swipeNext)();
      else if (event.translationX > SWIPE_THRESHOLD) runOnJS(swipePrev)();
    });

  const active = statusSections.find((section) => section.key === selectedStatus)!;

  return (
    <View style={styles.screen}>
      <View style={[styles.headerRow, { paddingTop: headerPaddingTop }]}>
        <View style={styles.headerContent}>
          <SegmentedTabBar sections={genderSections} selected={selectedGender} onSelect={onSelectGender} />
          {viewSections && (
            <>
              <View style={styles.gap} />
              <SegmentedTabBar sections={viewSections} selected={selectedView} onSelect={onSelectView} />
            </>
          )}
          <View style={styles.gap} />
          <View style={styles.statusRow}>
            <ThemedText type="smallBold">
              {active.count === undefined ? active.label : `${active.label} (${active.count})`}
            </ThemedText>
            <View style={styles.dots}>
              {statusSections.map((section) => (
                <View
                  key={section.key}
                  style={[
                    styles.dot,
                    { backgroundColor: section.key === selectedStatus ? theme.primary : theme.border },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      <GestureDetector gesture={surfaceGesture}>
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
      </GestureDetector>
    </View>
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
  gap: {
    height: Spacing.two,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
