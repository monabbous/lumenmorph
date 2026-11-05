import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  projects: [
    { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 1100 } } },
    { name: "webkit", testMatch: /(svg-masking|showcase|editor|layout|lab|ui-libraries|slidebox)\.spec\.mjs$/, use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 1100 } } },
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1100 } } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
  webServer: { command: "npm run dev", url: "http://127.0.0.1:4173", reuseExistingServer: !process.env.CI },
});
