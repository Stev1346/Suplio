import { test, expect } from "@playwright/test";

/**
 * Guest Scan QR PNG download (Custom Event Designs, Phase 5).
 *
 * Requires the dev server started with NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS=true
 * (signalled via E2E_CED_ENABLED=1) and E2E_LIVE_EVENT_CODE pointing at a LIVE
 * event (the download button only renders when the flag is on).
 */
const FLAG_ON = process.env.E2E_CED_ENABLED === "1";
const CODE = process.env.E2E_LIVE_EVENT_CODE;

test.describe("Scan QR PNG download", () => {
  test.beforeEach(() => {
    test.skip(
      !FLAG_ON || !CODE,
      "Set E2E_CED_ENABLED=1 and E2E_LIVE_EVENT_CODE to a live event.",
    );
  });

  test("downloads a PNG named suplio-qr-{eventCode}.png", async ({ page }) => {
    await page.goto(`/event/${CODE}/scan`);

    const downloadButton = page.getByRole("button", {
      name: /download qr \(png\)/i,
    });
    await expect(downloadButton).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await downloadButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(`suplio-qr-${CODE}.png`);
  });
});
