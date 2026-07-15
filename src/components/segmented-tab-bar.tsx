import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type SegmentedTabBarItem<Key extends string> = {
  key: Key;
  label: string;
  // Omit for tabs that aren't counting anything (e.g. a gender filter).
  count?: number;
};

type SegmentedTabBarProps<Key extends string> = {
  sections: SegmentedTabBarItem<Key>[];
  selected: Key;
  onSelect: (key: Key) => void;
};

export function SegmentedTabBar<Key extends string>({ sections, selected, onSelect }: SegmentedTabBarProps<Key>) {
  return (
    <ScrollView
      style={styles.scrollView}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {sections.map(({ key, label, count }) => {
        const isSelected = key === selected;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            style={({ pressed }) => pressed && !isSelected && styles.pressed}>
            <ThemedView type={isSelected ? 'primary' : 'surface'} style={styles.tab}>
              <ThemedText type="small" themeColor={isSelected ? 'onPrimary' : 'text'}>
                {count === undefined ? label : `${label} (${count})`}
              </ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Without this, react-native-web's ScrollView defaults to flexGrow: 1 and
  // steals vertical space from flex:1 siblings (e.g. the Swipe deck) instead
  // of sizing to its single row of pills.
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    gap: Spacing.two,
  },
  tab: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});
