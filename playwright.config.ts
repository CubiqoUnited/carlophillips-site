import { defineConfig, devices } from '@playwright/test';

const outputDir =
  process.env.CP_A11Y_OUTPUT_DIR || 'test_reports/playwright-2026-08-20';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: `${outputDir}/html-report`, open: 'never' }],
    ['json', { outputFile: `${outputDir}/results.json` }],
  ],
  outputDir: `${outputDir}/artifacts`,
  snapshotPathTemplate:
    '{testDir}/visual-baselines/{platform}/{projectName}/{arg}{ext}',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  expect: {
    toHaveScreenshot: { animations: 'disabled' },
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'yarn build && yarn start',
    url: 'http://localhost:3000',
    reuseExistingServer: Boolean(process.env.CI),
    timeout: 120_000,
    env: {
      ...process.env,
      COMMERCE_DATA_MODE: 'fixture',
      NEXT_PUBLIC_COMMERCE_ENVIRONMENT: 'local',
      NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS: 'true',
      NEXT_PUBLIC_SHOW_PRODUCTS: 'true',
      NEXT_PUBLIC_STAGING_REVIEW: 'true',
      CP_ADMIN_REVIEW_TOKEN: 'qa-review-token',
    },
  },
});
