// Reanimated SharedValues are mutated via `.value =` by design (see
// docs.swmansion.com/react-native-reanimated); the React Compiler rule
// doesn't recognize this as a safe escape hatch.
/* eslint-disable react-hooks/immutability */
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { NameCard } from '@/components/name-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { ReviewStatus } from '@/types/name';

const COMMIT_DISTANCE = 120;
const EXIT_DISTANCE = 600;
const EXIT_DURATION = 200;

// Not in the real theme — love reuses theme.primary via DecisionButtons'
// tintColors instead, but the stamp/feedback colors here are decorative and
// don't need to track the review-gender tint.
const FEEDBACK_LOVE = '#3FA76A';
const FEEDBACK_DISLIKE = '#E2665A';
const FEEDBACK_MAYBE = '#D99B2B';

type SwipeableNameCardProps = {
  name: string;
  boyCount: number;
  girlCount: number;
  style: { width: number; minHeight: number };
  onDecision: (status: ReviewStatus) => void;
};

export function SwipeableNameCard({ name, boyCount, girlCount, style, onDecision }: SwipeableNameCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Each new card starts from center — without this, a card that arrives
  // right after a commit would inherit the outgoing card's fully-dragged
  // position for a frame.
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [name, translateX, translateY]);

  function fireDecision(status: ReviewStatus) {
    onDecision(status);
  }

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const isVertical = Math.abs(event.translationY) > Math.abs(event.translationX);
      if (event.translationY < -COMMIT_DISTANCE && isVertical) {
        translateY.value = withTiming(-EXIT_DISTANCE, { duration: EXIT_DURATION });
        translateX.value = withTiming(0, { duration: EXIT_DURATION }, (finished) => {
          if (finished) runOnJS(fireDecision)('maybe');
        });
      } else if (event.translationX > COMMIT_DISTANCE) {
        translateX.value = withTiming(EXIT_DISTANCE, { duration: EXIT_DURATION }, (finished) => {
          if (finished) runOnJS(fireDecision)('love');
        });
      } else if (event.translationX < -COMMIT_DISTANCE) {
        translateX.value = withTiming(-EXIT_DISTANCE, { duration: EXIT_DURATION }, (finished) => {
          if (finished) runOnJS(fireDecision)('dislike');
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${interpolate(translateX.value, [-300, 300], [-15, 15], Extrapolation.CLAMP)}deg` },
    ],
  }));

  // Mirrors onEnd's isVertical check — a diagonal drag should only light up
  // the stamp matching whichever axis actually dominates, the same axis that
  // decides which status would commit if released here. Otherwise a
  // diagonal drag lights up two stamps at once (e.g. right+up → both
  // "J'adore" and "Peut-être").
  const loveStampStyle = useAnimatedStyle(() => {
    const isVertical = Math.abs(translateY.value) > Math.abs(translateX.value);
    return { opacity: isVertical ? 0 : interpolate(translateX.value, [20, COMMIT_DISTANCE], [0, 1], Extrapolation.CLAMP) };
  });
  const dislikeStampStyle = useAnimatedStyle(() => {
    const isVertical = Math.abs(translateY.value) > Math.abs(translateX.value);
    return {
      opacity: isVertical ? 0 : interpolate(translateX.value, [-COMMIT_DISTANCE, -20], [1, 0], Extrapolation.CLAMP),
    };
  });
  const maybeStampStyle = useAnimatedStyle(() => {
    const isVertical = Math.abs(translateY.value) > Math.abs(translateX.value);
    return {
      opacity: isVertical ? interpolate(translateY.value, [-COMMIT_DISTANCE, -20], [1, 0], Extrapolation.CLAMP) : 0,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[style, cardAnimatedStyle]}>
        <NameCard name={name} boyCount={boyCount} girlCount={girlCount} style={styles.cardFill} />
        <Animated.View pointerEvents="none" style={[styles.stamp, styles.stampLove, loveStampStyle]}>
          <ThemedText type="subtitle" style={[styles.stampText, { color: FEEDBACK_LOVE, borderColor: FEEDBACK_LOVE }]}>
            J’ADORE
          </ThemedText>
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.stamp, styles.stampDislike, dislikeStampStyle]}>
          <ThemedText
            type="subtitle"
            style={[styles.stampText, { color: FEEDBACK_DISLIKE, borderColor: FEEDBACK_DISLIKE }]}>
            PAS ENVIE
          </ThemedText>
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.stamp, styles.stampMaybe, maybeStampStyle]}>
          <ThemedText type="subtitle" style={[styles.stampText, { color: FEEDBACK_MAYBE, borderColor: FEEDBACK_MAYBE }]}>
            PEUT-ÊTRE
          </ThemedText>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cardFill: {
    width: '100%',
    height: '100%',
  },
  stamp: {
    position: 'absolute',
    top: Spacing.five,
    borderWidth: 3,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  stampLove: {
    left: Spacing.four,
    transform: [{ rotateZ: '-18deg' }],
  },
  stampDislike: {
    right: Spacing.four,
    transform: [{ rotateZ: '18deg' }],
  },
  stampMaybe: {
    alignSelf: 'center',
  },
  stampText: {
    fontWeight: '800',
  },
});
