import { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DecisionButtons } from '@/components/decision-buttons';
import { GenderPicker } from '@/components/gender-picker';
import { SegmentedTabBar } from '@/components/segmented-tab-bar';
import { SwipeableNameCard } from '@/components/swipeable-name-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';
import { COUNTS_BY_NAME, GENDER_BY_NAME, NAMES, getDefaultReviewGender, matchesGenderFilter } from '@/data/names';
import { useAppStore } from '@/hooks/use-app-store';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n/use-translation';
import { shuffle } from '@/lib/shuffle';
import type { Gender, ReviewStatus } from '@/types/name';

const ALL_NAME_STRINGS = NAMES.map((entry) => entry.name);

// The name card keeps a portrait 3:4 (width:height) shape, but is sized to the
// space actually available on screen so it shrinks instead of getting cropped
// on shorter viewports.
const CARD_ASPECT_RATIO = 3 / 4;
const MAX_CARD_WIDTH = 420;

export default function SwipeScreen() {
  const { reviews, setReview, clearReview } = useAppStore();
  const t = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [order, setOrder] = useState<string[]>(() => shuffle(ALL_NAME_STRINGS));
  const [selectedGender, setSelectedGender] = useState<Gender>('both');
  const [history, setHistory] = useState<string[]>([]);
  const [deckSize, setDeckSize] = useState({ width: 0, height: 0 });
  const [reviewGenderOverride, setReviewGenderOverride] = useState<Gender | null>(null);
  const [reviewGenderCardName, setReviewGenderCardName] = useState<string | undefined>(undefined);

  const genderSections: { key: Gender; label: string }[] = [
    { key: 'boy', label: t.gender.boy },
    { key: 'girl', label: t.gender.girl },
    { key: 'both', label: t.gender.both },
  ];

  const remaining = useMemo(
    () =>
      order.filter(
        (name) => !(name in reviews) && matchesGenderFilter(GENDER_BY_NAME.get(name)!, selectedGender)
      ),
    [order, reviews, selectedGender]
  );
  const currentName = remaining[0];

  // Each new card gets a fresh default (following the deck filter, or the
  // name's own default gender when the filter is "both") — any manual
  // override only applies to the card it was made on. Reset during render
  // (not in an effect) per https://react.dev/learn/you-might-not-need-an-effect.
  if (currentName !== reviewGenderCardName) {
    setReviewGenderCardName(currentName);
    setReviewGenderOverride(null);
  }

  const reviewGender =
    reviewGenderOverride ??
    (currentName ? getDefaultReviewGender(selectedGender, GENDER_BY_NAME.get(currentName)!) : 'both');

  const GENDER_TINT: Record<Gender, string> = {
    boy: theme.genderBoy,
    girl: theme.genderGirl,
    both: theme.genderBoth,
  };

  function handleDeckLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setDeckSize({ width, height });
  }

  const cardSize = useMemo(() => {
    const { width, height } = deckSize;
    if (width === 0 || height === 0) return null;
    let cardWidth = Math.min(width, MAX_CARD_WIDTH);
    let cardHeight = cardWidth / CARD_ASPECT_RATIO;
    if (cardHeight > height) {
      cardHeight = height;
      cardWidth = cardHeight * CARD_ASPECT_RATIO;
    }
    // minHeight, not height: a long name that wraps to 2 lines needs more
    // room than the 3:4 ratio allows for, and the card must grow to fit it
    // rather than clip the popularity row underneath.
    return { width: cardWidth, minHeight: cardHeight };
  }, [deckSize]);

  function handleDecision(status: ReviewStatus) {
    if (!currentName) return;
    setReview(currentName, status, reviewGender);
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
      <View
        style={[
          styles.safeArea,
          {
            // The native tab bar already insets content at the bottom, so we
            // only add breathing room here — never the safe-area inset again.
            paddingTop: insets.top + TopTabInset + Spacing.two,
            paddingBottom: Spacing.three,
          },
        ]}>
        <SegmentedTabBar sections={genderSections} selected={selectedGender} onSelect={setSelectedGender} />

        <ThemedText type="small" themeColor="textSecondary" style={styles.remainingCount}>
          {t.swipe.remainingCount(remaining.length)}
        </ThemedText>

        <View testID="swipeDeck" style={styles.deck} onLayout={handleDeckLayout}>
          {cardSize &&
            (currentName ? (
              <SwipeableNameCard
                name={currentName}
                boyCount={COUNTS_BY_NAME.get(currentName)!.boyCount}
                girlCount={COUNTS_BY_NAME.get(currentName)!.girlCount}
                style={cardSize}
                onDecision={handleDecision}
              />
            ) : (
              <ThemedView type="surface" style={[styles.emptyState, cardSize]}>
                <ThemedText type="subtitle" style={styles.centerText}>
                  {t.swipe.emptyTitle}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.centerText}>
                  {t.swipe.emptySubtitle}
                </ThemedText>
              </ThemedView>
            ))}
        </View>

        <ThemedView style={styles.controls}>
          <GenderPicker selected={reviewGender} onSelect={setReviewGenderOverride} />
          <DecisionButtons
            onSelect={handleDecision}
            size="large"
            tintColors={{ love: GENDER_TINT[reviewGender], maybe: GENDER_TINT[reviewGender] }}
          />
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
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
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
