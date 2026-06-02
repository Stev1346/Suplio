import { test, expect } from "@playwright/test";

/**
 * Custom event code validation at the create API (Custom Event Designs, Phase 2).
 *
 * Reserved/invalid codes are rejected at 400 before the feature-flag check, so
 * those cases only need DJ credentials. The duplicate-code (409) path requires a
 * valid code to pass parsing and therefore the flag must be on
 * (E2E_CED_ENABLED=1) plus E2E_LIVE_EVENT_CODE pointing at an existing
 * non-archived event whose code we can collide with.
 *
 * The edit-twice decrement / reject-at-0 path is covered by the parser/rules
 * unit tests and the manual regression runbook, because seeding an event with
 * an exhausted edit counter is destructive and environment-specific.
 */
const EMAIL = process.env.E2E_DJ_EMAIL;
const PASSWORD = process.env.E2E_DJ_PASSWORD;
const FLAG_ON = process.env.E2E_CED_ENABLED === "1";
const DUP_CODE = process.env.E2E_LIVE_EVENT_CODE;

test.describe("Create event API - custom code validation", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD, "Set E2E_DJ_EMAIL / E2E_DJ_PASSWORD.");
    await page.goto("/dj/login");
    await page.getByLabel("Email").fill(EMAIL!);
    await page.getByLabel("Password").fill(PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dj\/dashboard/);
  });

  test("rejects a reserved custom code with 400", async ({ page }) => {
    const res = await page.request.post("/api/dj/events", {
      data: { name: "Reserved Code Probe", event_code: "scan" },
    });
    expect(res.status()).toBe(400);
  });

  test("rejects an invalid custom code with 400", async ({ page }) => {
    const res = await page.request.post("/api/dj/events", {
      data: { name: "Invalid Code Probe", event_code: "Bad Code!" },
    });
    expect(res.status()).toBe(400);
  });

  test("rejects a duplicate active custom code with 409", async ({ page }) => {
    test.skip(
      !FLAG_ON || !DUP_CODE,
      "Set E2E_CED_ENABLED=1 and E2E_LIVE_EVENT_CODE to an existing non-archived code.",
    );
    const res = await page.request.post("/api/dj/events", {
      data: { name: "Duplicate Code Probe", event_code: DUP_CODE },
    });
    expect(res.status()).toBe(409);
  });
});
