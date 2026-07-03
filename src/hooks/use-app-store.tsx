import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { loadDisplayName, loadReviews, saveDisplayName, saveReviews } from '@/lib/storage';
import type { ReviewMap, ReviewStatus } from '@/types/name';

type AppStore = {
  isHydrated: boolean;
  displayName: string | null;
  reviews: ReviewMap;
  setDisplayName: (name: string) => void;
  setReview: (name: string, status: ReviewStatus) => void;
  clearReview: (name: string) => void;
  resetAllReviews: () => void;
};

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewMap>({});

  useEffect(() => {
    Promise.all([loadDisplayName(), loadReviews()]).then(([storedName, storedReviews]) => {
      setDisplayNameState(storedName);
      setReviews(storedReviews);
      setIsHydrated(true);
    });
  }, []);

  const setDisplayName = useCallback((name: string) => {
    setDisplayNameState(name);
    saveDisplayName(name);
  }, []);

  const setReview = useCallback((name: string, status: ReviewStatus) => {
    setReviews((current) => {
      const next = { ...current, [name]: status };
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

  const value = useMemo<AppStore>(
    () => ({
      isHydrated,
      displayName,
      reviews,
      setDisplayName,
      setReview,
      clearReview,
      resetAllReviews,
    }),
    [isHydrated, displayName, reviews, setDisplayName, setReview, clearReview, resetAllReviews]
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
