import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppStore } from '@/hooks/use-app-store';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n/use-translation';

export function OnboardingScreen() {
  const { setDisplayName } = useAppStore();
  const t = useTranslation();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [showError, setShowError] = useState(false);

  function handleContinue() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setShowError(true);
      return;
    }
    setDisplayName(trimmedName);
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.copy}>
            <ThemedText type="subtitle" style={styles.centerText}>
              {t.onboarding.title}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              {t.onboarding.subtitle}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.form}>
            <TextInput
              value={name}
              onChangeText={(value) => {
                setName(value);
                setShowError(false);
              }}
              placeholder={t.onboarding.namePlaceholder}
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { color: theme.text, backgroundColor: theme.backgroundElement },
              ]}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            {showError && (
              <ThemedText type="small" themeColor="textSecondary">
                {t.onboarding.nameRequiredError}
              </ThemedText>
            )}

            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.backgroundElement },
                pressed && styles.pressed,
              ]}>
              <ThemedText type="linkPrimary">{t.onboarding.continueButton}</ThemedText>
            </Pressable>
          </ThemedView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  keyboardAvoiding: {
    flex: 1,
    alignSelf: 'stretch',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  copy: {
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.three,
  },
  input: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  button: {
    borderRadius: Spacing.five,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
