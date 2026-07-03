import { useLocales } from 'expo-localization';

import { translations, type LanguageCode } from './translations';

function toSupportedLanguage(languageCode: string | null | undefined): LanguageCode {
  return languageCode === 'fr' ? 'fr' : 'en';
}

export function useTranslation() {
  const locales = useLocales();
  const language = toSupportedLanguage(locales[0]?.languageCode);
  return translations[language];
}
