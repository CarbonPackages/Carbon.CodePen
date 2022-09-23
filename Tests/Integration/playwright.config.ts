import { PlaywrightTestConfig, devices } from '@playwright/test';
import path from 'path';

import * as dotenv from 'dotenv'
dotenv.config()

// Reference: https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  // workers: 1,
  globalSetup: "./Features/setup.ts",
  testDir: path.join(__dirname, 'Features'),
  retries: 0,
  timeout: 40000,
  fullyParallel: true,
  webServer: {
    command: 'cd ../.. && make up && make cleanSite',
    url: process.env.BASE_URL,
    timeout: 120 * 1000,
    reuseExistingServer: true,
    ignoreHTTPSErrors: true,
  },

  use: {
    trace: 'on-first-retry',
    storageState: 'tmpSharedNeosTestSession.json',
    screenshot: "only-on-failure",
    baseURL: process.env.BASE_URL,
    ignoreHTTPSErrors: true
  },

  projects: [
    {
      // firefox works better headless - fullscreen api doesnt work headed
      name: 'firefoxHeadless',
      use: {
        ...devices['Desktop Firefox'],
        headless: true
      },
    },
    {
      // chromium works better headed - fullscreen api doesnt work headless
      name: 'chromiumHeaded',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
      },
    },
  ],
};
export default config;
