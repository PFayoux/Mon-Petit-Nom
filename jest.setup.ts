import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Each screen test seeds its own storage state — without this, reviews saved
// by one test (via setReview -> saveReviews) would leak into the next.
afterEach(async () => {
  await AsyncStorage.clear();
});
