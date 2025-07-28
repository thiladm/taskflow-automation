// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
const config = ({
  testDir: './tests',  
  timeout: 50000,
  use: {    
    browserName: 'chromium',
    headless: false,
    screenshot: 'on',
    trace: 'on'
  },
  expect: {
    timeout: 60000 // default timeout for all expect() assertions
  },
  reporter: 'html'
  
});
module.exports = config

