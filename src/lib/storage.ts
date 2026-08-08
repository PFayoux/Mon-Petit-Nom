import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PartnerProfile, ReviewMap } from '@/types/name';

const DISPLAY_NAME_KEY = '@mon-petit-nom/display-name';
const REVIEWS_KEY = '@mon-petit-nom/reviews';
const PARTNER_PROFILES_KEY = '@mon-petit-nom/partner-profiles';

export async function loadDisplayName(): Promise<string | null> {
  return AsyncStorage.getItem(DISPLAY_NAME_KEY);
}

export async function saveDisplayName(name: string): Promise<void> {
  await AsyncStorage.setItem(DISPLAY_NAME_KEY, name);
}

export async function loadReviews(): Promise<ReviewMap> {
  const raw = await AsyncStorage.getItem(REVIEWS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function saveReviews(reviews: ReviewMap): Promise<void> {
  await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

export async function loadPartnerProfiles(): Promise<PartnerProfile[]> {
  const raw = await AsyncStorage.getItem(PARTNER_PROFILES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function savePartnerProfiles(profiles: PartnerProfile[]): Promise<void> {
  await AsyncStorage.setItem(PARTNER_PROFILES_KEY, JSON.stringify(profiles));
}
