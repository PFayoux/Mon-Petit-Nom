// PROTOTYPE — throwaway floating switcher for wayfinder ticket #45. Hidden
// outside __DEV__ so a stray merge can't ship it. Delete with the rest of
// this directory once a variant is chosen.
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';

export const VARIANTS = ['current', 'a', 'b', 'c'] as const;
export type VariantKey = (typeof VARIANTS)[number];

const VARIANT_LABEL: Record<VariantKey, string> = {
  current: 'Current',
  a: 'A — Edge strip',
  b: 'B — Unified header',
  c: 'C — Surface swipe',
};

export function PrototypeSwitcher({ current }: { current: VariantKey }) {
  const router = useRouter();

  function cycle(direction: 1 | -1) {
    const index = VARIANTS.indexOf(current);
    const next = VARIANTS[(index + direction + VARIANTS.length) % VARIANTS.length];
    router.setParams({ variant: next });
  }

  return (
    <View style={[styles.wrapper, { pointerEvents: 'box-none' }]}>
      <View style={styles.bar}>
        <Pressable onPress={() => cycle(-1)} hitSlop={12} style={styles.arrow}>
          <Text style={styles.arrowText}>‹</Text>
        </Pressable>
        <Text style={styles.label}>{VARIANT_LABEL[current]}</Text>
        <Pressable onPress={() => cycle(1)} hitSlop={12} style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.four,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: Spacing.five,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  arrow: {
    paddingHorizontal: Spacing.two,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
