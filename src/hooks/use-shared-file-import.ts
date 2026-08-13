import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { File } from 'expo-file-system';
import { clearInitialURL, useLinkingURL } from 'expo-linking';
import { useRouter } from 'expo-router';

import { useTranslation } from '@/i18n/use-translation';
import { parseBackup } from '@/lib/backup-import';
import { parsePartnerProfile } from '@/lib/partner-import';
import { identifySharedFileKind } from '@/lib/shared-file';

import { useAppStore } from './use-app-store';

// Handles the app being launched via "Open with Mon Petit Nom" on a shared
// .json file (Android intent filter on application/json — see ADR-0011).
// The incoming URL is a content:// URI, not one of our own app routes, so
// this reads it directly, recognizes it as one of our own formats (or not),
// and applies the same action the matching Settings button would.
export function useSharedFileImport() {
  const url = useLinkingURL();
  const router = useRouter();
  const { displayName, importPartnerProfile, restoreFromBackup } = useAppStore();
  const t = useTranslation();
  const handledUrl = useRef<string | null>(null);

  useEffect(() => {
    // Settings (and the rest of the tab navigator) don't exist until
    // onboarding is done — defer until displayName is set; this effect
    // re-runs once it is, so the file isn't lost, just handled later.
    if (!displayName) return;
    if (!url || url === handledUrl.current || !url.startsWith('content://')) return;

    handledUrl.current = url;
    // Prevents re-processing the same file on a later app resume/reload —
    // otherwise every relaunch would re-trigger this import.
    clearInitialURL();

    (async () => {
      let jsonText: string;
      try {
        jsonText = await new File(url).text();
      } catch {
        Alert.alert(t.settings.unrecognizedFileMessage);
        return;
      }

      const kind = identifySharedFileKind(jsonText);
      router.replace('/settings');

      if (kind === 'backup') {
        try {
          const backup = parseBackup(jsonText);
          // Same destructive-confirm pattern as pressing "Restore a backup".
          Alert.alert(t.settings.restoreConfirmTitle, t.settings.restoreConfirmMessage, [
            { text: t.common.cancel, style: 'cancel' },
            { text: t.settings.restoreButton, style: 'destructive', onPress: () => restoreFromBackup(backup) },
          ]);
        } catch {
          Alert.alert(t.settings.restoreErrorMessage);
        }
      } else if (kind === 'partner') {
        try {
          importPartnerProfile(parsePartnerProfile(jsonText));
        } catch {
          Alert.alert(t.settings.importErrorMessage);
        }
      } else {
        Alert.alert(t.settings.unrecognizedFileMessage);
      }
    })();
  }, [url, displayName, router, importPartnerProfile, restoreFromBackup, t]);
}
