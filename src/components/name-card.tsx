import * as Linking from 'expo-linking';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/i18n/use-translation';
import { formatPopularityCount } from '@/lib/format-count';
import { getWiktionaryUrl } from '@/lib/wiktionary-url';

type NameCardProps = {
  name: string;
  boyCount: number;
  girlCount: number;
  style?: StyleProp<ViewStyle>;
};

export function NameCard({ name, boyCount, girlCount, style }: NameCardProps) {
  const t = useTranslation();

  function handleWiktionaryPress() {
    Linking.openURL(getWiktionaryUrl(name)).catch(() => {});
  }

  return (
    <ThemedView testID="nameCard" type="surface" style={[styles.card, style]}>
      <Pressable
        accessibilityLabel={t.swipe.wiktionaryLinkButton(name)}
        onPress={handleWiktionaryPress}
        style={({ pressed }) => [styles.wiktionaryButton, pressed && styles.pressed]}>
        <ThemedText style={styles.wiktionaryIcon}>ⓘ</ThemedText>
      </Pressable>
      <ThemedText
        type="title"
        style={styles.name}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.6}>
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
    paddingHorizontal: Spacing.three,
  },
  wiktionaryButton: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wiktionaryIcon: {
    fontSize: 20,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  name: {
    // The card's alignItems: 'center' shrink-wraps children to their content
    // size by default, so a long name has no width to wrap against and
    // overflows horizontally instead of breaking to a second line. Stretch
    // forces it to the card's actual available width (minus padding) so
    // wrapping — and adjustsFontSizeToFit above — have something to measure.
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  popularity: {
    textAlign: 'center',
    marginTop: Spacing.three,
  },
});
