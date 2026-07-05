import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type NameCardProps = {
  name: string;
};

export function NameCard({ name }: NameCardProps) {
  return (
    <ThemedView type="surface" style={styles.card}>
      <ThemedText type="title" style={styles.name}>
        {name}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  name: {
    textAlign: 'center',
  },
});
