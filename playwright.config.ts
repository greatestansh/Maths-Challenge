import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:4179',
    channel: process.env.ADIC_BROWSER_CHANNEL || undefined,
    viewport: { width: 1440, height: 960 },
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4179 --strictPort',
    url: 'http://127.0.0.1:4179',
    reuseExistingServer: false,
  },
});
