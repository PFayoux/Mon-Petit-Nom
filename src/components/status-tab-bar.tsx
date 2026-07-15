import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type StatusTabBarItem<Key extends string> = {
  key: Key;
  label: string;
  count: number;
};

type StatusTabBarProps<Key extends string> = {
  sections: StatusTabBarItem<Key>[];
  selected: Key;
  onSelect: (key: Key) => void;
};

export function StatusTabBar<Key extends string>({ sections, selected, onSelect }: StatusTabBarProps<Key>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {sections.map(({ key, label, count }) => {
        const isSelected = key === selected;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            style={({ pressed }) => pressed && !isSelected && styles.pressed}>
            <ThemedView type={isSelected ? 'primary' : 'surface'} style={styles.tab}>
              <ThemedText type="small" themeColor={isSelected ? 'onPrimary' : 'text'}>
                {`${label} (${count})`}
              </ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
