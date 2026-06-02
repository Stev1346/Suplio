import { test, expect } from "@playwright/test";

/**
 * Header Scan QR popup (Custom Event Designs, Phase 6).
 *
 * Requires the dev server started with NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS=true
 * (signalled via E2E_CED_ENABLED=1) and E2E_LIVE_EVENT_CODE pointing at a LIVE
 * event. E2E_ENDED_EVENT_CODE (optional) exercises the hidden-on-ended path.
 */
const FLAG_ON = process.env.E2E_CED_ENABLED === "1";
const CODE = process.env.E2E_LIVE_EVENT_CODE;
const ENDED_CODE = process.env.E2E_ENDED_EVENT_CODE;

const QR_BUTTON = /show event qr code/i;

test.describe("Header Scan QR popup", () => {
  test.beforeEach(() => {
    test.skip(
      !FLAG_ON || !CODE,
      "Set E2E_CED_ENABLED=1 and E2E_LIVE_EVENT_CODE to a live event.",
    );
  });

  test("opens the Scan dialog over the current page without navigating", async ({
    page,
  }) => {
    await page.goto(`/event/${CODE}/vote`);
    await expect(page).toHaveURL(new RegExp(`/event/${CODE}/vote`));

    await page.getByRole("button", { name: QR_BUTTON }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText(/scan to request a song/i),
    ).toBeVisible();

    // Underlying page is unchanged (no navigation away from the vote page).
    await expect(page).toHaveURL(new RegExp(`/event/${CODE}/vote`));
  });

  test("closes on Escape", async ({ page }) => {
    await page.goto(`/event/${CODE}/vote`);
    await page.getByRole("button", { name: QR_BUTTON }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("is hidden for ended/archived events", async ({ page }) => {
    test.skip(!ENDED_CODE, "Set E2E_ENDED_EVENT_CODE to an ended event code.");
    await page.goto(`/event/${ENDED_CODE}/vote`);
    await expect(page.getByRole("button", { name: QR_BUTTON })).toHaveCount(0);
  });
});
