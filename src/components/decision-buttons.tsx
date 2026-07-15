import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n/use-translation';
import type { ReviewStatus } from '@/types/name';

const DECISION_ORDER: ReviewStatus[] = ['dislike', 'maybe', 'love'];
const DECISION_EMOJI: Record<ReviewStatus, string> = {
  love: '❤️',
  maybe: '🤔',
  dislike: '✕',
};

type DecisionButtonsProps = {
  onSelect: (status: ReviewStatus) => void;
  selectedStatus?: ReviewStatus;
  size?: 'large' | 'compact';
};

export const DecisionButtons = memo(function DecisionButtons({
  onSelect,
  selectedStatus,
  size = 'large',
}: DecisionButtonsProps) {
  const theme = useTheme();
  const t = useTranslation();
  const isCompact = size === 'compact';

  const labelForStatus: Record<ReviewStatus, string> = {
    love: t.decisions.loveButton,
    maybe: t.decisions.maybeButton,
    dislike: t.decisions.dislikeButton,
  };

  return (
    <View style={[styles.row, isCompact && styles.rowCompact]}>
      {DECISION_ORDER.map((status) => {
        const isSelected = selectedStatus === status;
        return (
          <Pressable
            key={status}
            accessibilityLabel={labelForStatus[status]}
            onPress={() => onSelect(status)}
            style={({ pressed }) => [
              styles.button,
              isCompact && styles.buttonCompact,
              {
                backgroundColor: isSelected
                  ? pressed
                    ? theme.primaryPressed
                    : theme.primary
                  : theme.surface,
              },
              pressed && !isSelected && styles.pressed,
            ]}>
            <ThemedText style={isCompact ? styles.emojiCompact : styles.emoji}>
              {DECISION_EMOJI[status]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    justifyContent: 'center',
  },
  rowCompact: {
    gap: Spacing.two,
    justifyContent: 'flex-start',
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  emoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  emojiCompact: {
    fontSize: 16,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
});
