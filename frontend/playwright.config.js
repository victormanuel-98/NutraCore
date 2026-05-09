import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60 * 1000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: 'http://127.0.0.1:4174',
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev:e2e',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  },
  projects: [
    {
      name: 'mobile-se',
      use: {
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: 'mobile-pro',
      use: {
        viewport: { width: 393, height: 852 },
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: 'tablet-ipad',
      use: {
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: 'desktop',
      use: {
        viewport: { width: 1280, height: 900 }
      }
    }
  ]
});
