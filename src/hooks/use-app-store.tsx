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
  loadDisplayName,
  loadPartnerProfiles,
  loadReviews,
  saveDisplayName,
  savePartnerProfiles,
  saveReviews,
} from '@/lib/storage';
import type { Gender, PartnerProfile, ReviewMap, ReviewStatus } from '@/types/name';

type AppStore = {
  isHydrated: boolean;
  displayName: string | null;
  reviews: ReviewMap;
  partnerProfiles: PartnerProfile[];
  setDisplayName: (name: string) => void;
  setReview: (name: string, status: ReviewStatus, gender: Gender) => void;
  clearReview: (name: string) => void;
  resetAllReviews: () => void;
  importPartnerProfile: (profile: PartnerProfile) => void;
};

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [partnerProfiles, setPartnerProfiles] = useState<PartnerProfile[]>([]);

  useEffect(() => {
    Promise.all([loadDisplayName(), loadReviews(), loadPartnerProfiles()]).then(
      ([storedName, storedReviews, storedPartnerProfiles]) => {
        setDisplayNameState(storedName);
        setReviews(storedReviews);
        setPartnerProfiles(storedPartnerProfiles);
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

  const value = useMemo<AppStore>(
    () => ({
      isHydrated,
      displayName,
      reviews,
      partnerProfiles,
      setDisplayName,
      setReview,
      clearReview,
      resetAllReviews,
      importPartnerProfile,
    }),
    [
      isHydrated,
      displayName,
      reviews,
      partnerProfiles,
      setDisplayName,
      setReview,
      clearReview,
      resetAllReviews,
      importPartnerProfile,
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
