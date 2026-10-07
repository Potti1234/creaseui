import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/sites',
  outputDir: 'test-results/sites',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  workers: 3,
  retries: 0,
  timeout: 60_000,
  reporter: [
    ['line'],
    ['html', { open: 'never', outputFolder: 'playwright-report/sites' }],
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'tailwind',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4173' },
    },
    {
      name: 'stylex',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4174' },
    },
  ],
  webServer: [
    {
      command: 'npm run preview:tailwind -- --host 127.0.0.1',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run preview:stylex -- --host 127.0.0.1',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
