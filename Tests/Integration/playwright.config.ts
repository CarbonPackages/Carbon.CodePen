import { PlaywrightTestConfig, devices } from '@playwright/test';
import path from 'path';

import * as dotenv from 'dotenv'
dotenv.config()


// Reference: https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  // workers: 1,
  globalSetup: "./Features/setup.ts",
  testDir: path.join(__dirname, 'Features'), /* Test directory */
  forbidOnly: !!process.env.CI,                 /* Whether to exit with an error if any tests or groups are marked as test.only() or test.describe.only(). Useful on CI. */
  retries: process.env.CI ? 2 : 0,              /* If a test fails on CI, retry it additional 2 times */
  timeout: 30000,                        /* Timeout per test */
  // outputDir: 'test-results/',                /* Artifacts folder where screenshots, videos, and traces are stored. */

  /* Run your local dev server before starting the tests: */
  /* https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests */
  // webServer: {
  //   command: 'pnpm run startNeos',
  //   url: 'https://carboncodepentestdistribution.ddev.site',
  //   timeout: 120 * 1000,
  //   reuseExistingServer: true,
  // },

  use: {
    trace: 'on-first-retry',
    storageState: 'tmpSharedNeosTestSession.json',
    screenshot: "only-on-failure",
    baseURL: process.env.BASE_URL
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //   },
    // },
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    // },
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },
    /* Test against stable browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],
};
export default config;
