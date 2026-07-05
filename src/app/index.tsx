import { useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DecisionButtons } from '@/components/decision-buttons';
import { NameCard } from '@/components/name-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';
import { BOY_NAMES } from '@/data/boy-names';
import { useAppStore } from '@/hooks/use-app-store';
import { useTranslation } from '@/i18n/use-translation';
import { shuffle } from '@/lib/shuffle';
import type { ReviewStatus } from '@/types/name';

export default function SwipeScreen() {
  const { reviews, setReview, clearReview } = useAppStore();
  const t = useTranslation();

  const [order, setOrder] = useState<string[]>(() => shuffle(BOY_NAMES));
  const [history, setHistory] = useState<string[]>([]);

  const remaining = useMemo(
    () => order.filter((name) => !(name in reviews)),
    [order, reviews]
  );
  const currentName = remaining[0];

  function handleDecision(status: ReviewStatus) {
    if (!currentName) return;
    setReview(currentName, status);
    setHistory((current) => [...current, currentName]);
  }

  function handleBack() {
    const previousName = history[history.length - 1];
    if (!previousName) return;
    setHistory((current) => current.slice(0, -1));
    clearReview(previousName);
    setOrder((current) => [previousName, ...current.filter((name) => name !== previousName)]);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.deck}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.remainingCount}>
            {t.swipe.remainingCount(remaining.length)}
          </ThemedText>

          {currentName ? (
            <NameCard name={currentName} />
          ) : (
            <ThemedView type="surface" style={styles.emptyState}>
              <ThemedText type="subtitle" style={styles.centerText}>
                {t.swipe.emptyTitle}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.centerText}>
                {t.swipe.emptySubtitle}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.controls}>
          <DecisionButtons onSelect={handleDecision} size="large" />
          <Pressable
            onPress={handleBack}
            disabled={history.length === 0}
            style={({ pressed }) => [
              styles.backButton,
              pressed && history.length > 0 && styles.pressed,
            ]}>
            <ThemedText
              type="link"
              themeColor={history.length === 0 ? 'textSecondary' : 'text'}>
              {t.swipe.backButton}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: TopTabInset,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  remainingCount: {
    textAlign: 'center',
  },
  deck: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  emptyState: {
    borderRadius: Spacing.four,
    padding: Spacing.five,
    gap: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  controls: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingBottom: Spacing.three,
  },
  backButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
