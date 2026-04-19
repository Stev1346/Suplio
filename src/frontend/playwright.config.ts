import { defineConfig } from "@playwright/test";

export default defineConfig({ 
  testDir: "./tests",
  testMatch: ["e2e/**/*.spec.ts", "rls/**/*.spec.ts"],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npx next dev --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000/dj/login",
    reuseExistingServer: true,
    timeout: 240_000,
  },
});