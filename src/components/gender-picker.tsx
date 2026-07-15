import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/i18n/use-translation';
import type { Gender } from '@/types/name';

const GENDER_ORDER: Gender[] = ['boy', 'girl', 'both'];
const GENDER_SYMBOL: Record<Gender, string> = {
  boy: '♂',
  girl: '♀',
  both: '⚥',
};
const GENDER_THEME_TYPE = {
  boy: 'genderBoy',
  girl: 'genderGirl',
  both: 'genderBoth',
} as const;

type GenderPickerProps = {
  selected: Gender;
  onSelect: (gender: Gender) => void;
};

export function GenderPicker({ selected, onSelect }: GenderPickerProps) {
  const t = useTranslation();

  const labelForGender: Record<Gender, string> = {
    boy: t.gender.boy,
    girl: t.gender.girl,
    both: t.gender.both,
  };

  return (
    <View style={styles.row}>
      {GENDER_ORDER.map((gender) => {
        const isSelected = gender === selected;
        return (
          <Pressable
            key={gender}
            accessibilityLabel={labelForGender[gender]}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(gender)}
            style={({ pressed }) => pressed && !isSelected && styles.pressed}>
            <ThemedView type={isSelected ? GENDER_THEME_TYPE[gender] : 'surface'} style={styles.button}>
              <ThemedText style={styles.symbol}>{GENDER_SYMBOL[gender]}</ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 18,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.7,
  },
});
