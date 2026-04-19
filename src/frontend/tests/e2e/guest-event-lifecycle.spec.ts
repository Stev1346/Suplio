import { test, expect } from "@playwright/test";

const CODE = process.env.E2E_EVENT_CODE ?? "demo";

test("guest can load the scan page for the seeded event", async ({ page }) => {
  await page.goto(`/event/${CODE}`);
  await expect(page.getByRole("link", { name: "Scan" })).toBeVisible();
});

test("guest sees EventOver for archived/ended event", async ({ page }) => {
  const endedCode = process.env.E2E_ENDED_EVENT_CODE;
  test.skip(!endedCode, "Set E2E_ENDED_EVENT_CODE to an ended event code.");
  await page.goto(`/event/${endedCode}`);
  await expect(page.getByText(/event (is|has) over/i)).toBeVisible();
});