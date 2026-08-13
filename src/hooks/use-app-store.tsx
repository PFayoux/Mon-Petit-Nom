import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  loadActivePartnerName,
  loadDisplayName,
  loadPartnerProfiles,
  loadReviews,
  saveActivePartnerName,
  saveDisplayName,
  savePartnerProfiles,
  saveReviews,
} from '@/lib/storage';
import type { Backup, Gender, PartnerProfile, ReviewMap, ReviewStatus } from '@/types/name';

type AppStore = {
  isHydrated: boolean;
  displayName: string | null;
  reviews: ReviewMap;
  partnerProfiles: PartnerProfile[];
  activePartnerName: string | null;
  activePartnerProfile: PartnerProfile | null;
  setDisplayName: (name: string) => void;
  setReview: (name: string, status: ReviewStatus, gender: Gender) => void;
  clearReview: (name: string) => void;
  resetAllReviews: () => void;
  importPartnerProfile: (profile: PartnerProfile) => void;
  removePartnerProfile: (displayName: string) => void;
  setActivePartnerName: (displayName: string | null) => void;
  restoreFromBackup: (backup: Backup) => void;
};

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [partnerProfiles, setPartnerProfiles] = useState<PartnerProfile[]>([]);
  const [activePartnerName, setActivePartnerNameState] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadDisplayName(), loadReviews(), loadPartnerProfiles(), loadActivePartnerName()]).then(
      ([storedName, storedReviews, storedPartnerProfiles, storedActivePartnerName]) => {
        setDisplayNameState(storedName);
        setReviews(storedReviews);
        setPartnerProfiles(storedPartnerProfiles);
        setActivePartnerNameState(storedActivePartnerName);
        setIsHydrated(true);
      }
    );
  }, []);

  const setDisplayName = useCallback((name: string) => {
    setDisplayNameState(name);
    saveDisplayName(name);
  }, []);

  const setReview = useCallback((name: string, status: ReviewStatus, gender: Gender) => {
    setReviews((current) => {
      // A dislike is universal — never tied to a specific gender — regardless
      // of whatever gender was selected when the decision was made.
      const next = { ...current, [name]: { status, gender: status === 'dislike' ? 'both' : gender } };
      saveReviews(next);
      return next;
    });
  }, []);

  const clearReview = useCallback((name: string) => {
    setReviews((current) => {
      const next = { ...current };
      delete next[name];
      saveReviews(next);
      return next;
    });
  }, []);

  const resetAllReviews = useCallback(() => {
    setReviews({});
    saveReviews({});
  }, []);

  const importPartnerProfile = useCallback((profile: PartnerProfile) => {
    setPartnerProfiles((current) => {
      const next = [...current.filter((existing) => existing.displayName !== profile.displayName), profile];
      savePartnerProfiles(next);
      return next;
    });
  }, []);

  const setActivePartnerName = useCallback((name: string | null) => {
    setActivePartnerNameState(name);
    saveActivePartnerName(name);
  }, []);

  const removePartnerProfile = useCallback((displayNameToRemove: string) => {
    setPartnerProfiles((current) => {
      const next = current.filter((existing) => existing.displayName !== displayNameToRemove);
      savePartnerProfiles(next);
      return next;
    });
    // Removing the active partner's profile also clears the selection —
    // otherwise Résultats would keep comparing against data that no longer exists.
    setActivePartnerNameState((current) => {
      if (current !== displayNameToRemove) return current;
      saveActivePartnerName(null);
      return null;
    });
  }, []);

  // Wholesale replace, not a merge — a backup is a full snapshot of a phone's
  // state, and restoring it is meant to reproduce that state exactly (see
  // ADR-0010), same as the destructive-confirm UX around resetAllReviews.
  const restoreFromBackup = useCallback((backup: Backup) => {
    setDisplayNameState(backup.displayName);
    saveDisplayName(backup.displayName);
    setReviews(backup.reviews);
    saveReviews(backup.reviews);
    setPartnerProfiles(backup.partnerProfiles);
    savePartnerProfiles(backup.partnerProfiles);
    setActivePartnerNameState(backup.activePartnerName);
    saveActivePartnerName(backup.activePartnerName);
  }, []);

  const activePartnerProfile = useMemo(
    () => partnerProfiles.find((profile) => profile.displayName === activePartnerName) ?? null,
    [partnerProfiles, activePartnerName]
  );

  const value = useMemo<AppStore>(
    () => ({
      isHydrated,
      displayName,
      reviews,
      partnerProfiles,
      activePartnerName,
      activePartnerProfile,
      setDisplayName,
      setReview,
      clearReview,
      resetAllReviews,
      importPartnerProfile,
      removePartnerProfile,
      setActivePartnerName,
      restoreFromBackup,
    }),
    [
      isHydrated,
      displayName,
      reviews,
      partnerProfiles,
      activePartnerName,
      activePartnerProfile,
      setDisplayName,
      setReview,
      clearReview,
      resetAllReviews,
      importPartnerProfile,
      removePartnerProfile,
      setActivePartnerName,
      restoreFromBackup,
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(AppStoreContext);
  if (!store) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return store;
}
