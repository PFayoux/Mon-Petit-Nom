import { defineConfig, devices } from '@playwright/test';

const PORT = 8100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npx expo start --web --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      // Named "phone" (not a specific device) because the goal is catching
      // layout bugs that only show up on a narrow/tall viewport — see
      // docs/adr/0004-playwright-layout-tests.md.
      name: 'phone',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
