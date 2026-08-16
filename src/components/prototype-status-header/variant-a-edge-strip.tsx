// PROTOTYPE — Variant A for wayfinder ticket #45.
//
// Scope: only the status-tab row is redesigned; the gender and Moi/Partenaire
// rows above it are untouched. Two ~32px GestureDetector strips sit at the
// screen's left/right edges — a pan that *starts* inside a strip and clears
// SWIPE_THRESHOLD switches the status tab. Because the strips are separate
// views outside the gender row's ScrollView, there's no gesture conflict.
// Dots below the centered label are tappable (a direct jump), answering the
// ticket's "does tapping a dot jump" question with "yes".
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { SegmentedTabBar } from '@/components/segmented-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { cycleStatus, type PrototypeBodyProps } from './types';

const EDGE_ZONE_WIDTH = 32;
const SWIPE_THRESHOLD = 40;

export function VariantAEdgeStrip({
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

  const rightEdgeGesture = Gesture.Pan()
    .activeOffsetX([-1000, -10])
    .failOffsetY([-20, 20])
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) runOnJS(swipeNext)();
    });

  const leftEdgeGesture = Gesture.Pan()
    .activeOffsetX([10, 1000])
    .failOffsetY([-20, 20])
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) runOnJS(swipePrev)();
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
            <GestureDetector gesture={leftEdgeGesture}>
              <View testID="prototype-edge-left" style={styles.edgeZone} />
            </GestureDetector>
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
            <GestureDetector gesture={rightEdgeGesture}>
              <View testID="prototype-edge-right" style={styles.edgeZone} />
            </GestureDetector>
          </View>
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
    justifyContent: 'space-between',
  },
  edgeZone: {
    width: EDGE_ZONE_WIDTH,
    height: 44,
  },
  statusCenter: {
    flex: 1,
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
