import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type NameCardProps = {
  name: string;
  style?: StyleProp<ViewStyle>;
};

export function NameCard({ name, style }: NameCardProps) {
  return (
    <ThemedView type="surface" style={[styles.card, style]}>
      <ThemedText type="title" style={styles.name}>
        {name}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  name: {
    textAlign: 'center',
  },
});
