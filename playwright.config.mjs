import { defineConfig } from '@playwright/test';

const port = Number(process.env.LUMIERE_UI_PORT || 65447);
const baseURL = `http://127.0.0.1:${port}`;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: 'tests',
  testMatch: '*.browser.spec.mjs',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  timeout: 30000,
  use: {
    baseURL,
    browserName: 'chromium',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    locale: 'tr-TR',
    trace: 'retain-on-failure',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: 'desktop', grepInvert: /@mobile-only/, use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', grep: /@mobile/, use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'node scripts/storefront-ui-fixture/serve.mjs',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: { LUMIERE_UI_PORT: String(port) },
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
  },
});
