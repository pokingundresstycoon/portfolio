import { defineConfig, devices } from '@playwright/test';

const channel = process.env.CI ? undefined : 'chrome';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: process.env.CI ? 'line' : 'list',
  use: { baseURL: 'http://localhost:4322', channel },
  webServer: {
    command: 'npm run build:fixture && npm run preview:fixture',
    url: 'http://localhost:4322',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 }, channel } },
    { name: 'phone', use: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 }, channel } },
  ],
});
