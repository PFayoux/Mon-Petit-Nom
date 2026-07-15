import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/i18n/use-translation';
import { formatPopularityCount } from '@/lib/format-count';

type NameCardProps = {
  name: string;
  boyCount: number;
  girlCount: number;
  style?: StyleProp<ViewStyle>;
};

export function NameCard({ name, boyCount, girlCount, style }: NameCardProps) {
  const t = useTranslation();

  return (
    <ThemedView testID="nameCard" type="surface" style={[styles.card, style]}>
      <ThemedText type="title" style={styles.name}>
        {name}
      </ThemedText>
      <ThemedText
        type="small"
        themeColor="textSecondary"
        accessibilityLabel={t.swipe.popularityLabel(boyCount, girlCount)}
        style={styles.popularity}>
        {`👦 ${formatPopularityCount(boyCount)} · 👧 ${formatPopularityCount(girlCount)}`}
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
  popularity: {
    textAlign: 'center',
    marginTop: Spacing.three,
  },
});
