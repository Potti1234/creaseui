import { defineConfig, devices } from '@playwright/test'

import sites from './playwright.sites.config'

/* R3 critical interactions on Firefox and WebKit. Chromium runs the full
   site matrix in playwright.sites.config.ts. CREASE_DEV_PORTS=1 targets
   running dev servers (5173-5175) instead of the preview builds. */
const dev = process.env.CREASE_DEV_PORTS === '1'
const SITES = [
  ['tailwind', dev ? 5173 : 4173],
  ['stylex', dev ? 5174 : 4174],
  ['pleat', dev ? 5175 : 4175],
] as const
const BROWSERS = [
  ['firefox', devices['Desktop Firefox']],
  ['webkit', devices['Desktop Safari']],
] as const

export default defineConfig({
  ...sites,
  testMatch: [
    'theme-scope.spec.ts',
    'overlay-surfaces.spec.ts',
    'rtl-reflow.spec.ts',
  ],
  outputDir: 'test-results/cross-browser',
  reporter: [
    ['line'],
    [
      'html',
      { open: 'never', outputFolder: 'playwright-report/cross-browser' },
    ],
  ],
  projects: BROWSERS.flatMap(([browser, device]) =>
    SITES.map(([site, port]) => ({
      name: `${site}-${browser}`,
      use: { ...device, baseURL: `http://127.0.0.1:${port}` },
    })),
  ),
  webServer: dev ? undefined : sites.webServer,
})
