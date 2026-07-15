# Playwright layout tests on a phone viewport, targeting the web dev server

Jest + React Native Testing Library (see the previous PR) catches behavior regressions, but doesn't run real layout — it can't catch a bug like `SegmentedTabBar`'s `ScrollView` stealing flex space from the Swipe deck, which only showed up visually on a phone-shaped viewport (a 1280×720 desktop-shaped screenshot didn't reveal it).

Decision: add `@playwright/test`, run it against `npx expo start --web` (via Playwright's `webServer` config, auto-started/torn down), with a single `phone`-viewport project (`devices['Pixel 7']`). Tests assert on element bounding boxes (heights, gaps between elements) rather than full pixel screenshots — cheaper to write, and doesn't break on every incidental visual tweak the way pixel-diffing would.

Verified the approach actually catches the target bug: temporarily reverted the `SegmentedTabBar` fix and confirmed both `e2e/swipe-layout.spec.ts` tests fail with the exact numbers you'd expect (card height 253 vs required >300, gap 276 vs required <80), then restored the fix.

## Status
accepted

## Consequences
- Tests live in `e2e/`, separate from Jest's `src/__tests__/`; `testPathIgnorePatterns` keeps Jest from picking up `.spec.ts` files there.
- This targets the **web** build specifically — react-native-web's layout quirks (like `ScrollView`'s default `flexGrow: 1`) don't necessarily reproduce identically on native, but web is where this bug actually surfaced, and it's the cheapest platform to test on (no simulator/device needed).
- Not wired into CI yet — deferred by request; local `npm run test:e2e` only for now.
