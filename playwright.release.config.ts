import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.CP_RELEASE_GATE_BASE_URL;
if (!baseURL) throw new Error('CP_RELEASE_GATE_BASE_URL_REQUIRED');

const outputDir =
  process.env.CP_RELEASE_GATE_OUTPUT_DIR || 'test_reports/protected-staging';
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: './tests/release-gate',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 120_000,
  // JSON/HTML reporters serialize config and can retain environment-scoped
  // headers. The protected receipt consumes only explicit sanitized artifacts.
  reporter: [['list']],
  outputDir: `${outputDir}/artifacts`,
  use: {
    baseURL,
    extraHTTPHeaders: bypass
      ? { 'x-vercel-protection-bypass': bypass }
      : undefined,
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'mobile-320',
      use: { ...devices['Pixel 7'], viewport: { width: 320, height: 700 } },
    },
    {
      name: 'mobile-360',
      use: { ...devices['Pixel 7'], viewport: { width: 360, height: 800 } },
    },
    {
      name: 'mobile-390',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'mobile-430',
      use: { ...devices['Pixel 7'], viewport: { width: 430, height: 900 } },
    },
    {
      name: 'tablet-768',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'desktop-1024',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 900 },
      },
    },
    {
      name: 'desktop-1440',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
      },
    },
  ],
});
