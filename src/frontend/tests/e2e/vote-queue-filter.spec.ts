import { test, expect } from "@playwright/test";

/**
 * Guest vote-page queue filter (Custom Event Designs, Phase 6).
 *
 * Requires the dev server to be started with
 * NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS=true (the flag is build/start-time,
 * so the test cannot toggle it). Signal that via E2E_CED_ENABLED=1 and point
 * E2E_LIVE_EVENT_CODE at a LIVE song_request event that has at least one
 * `played` and one `accepted` request seeded.
 */
const FLAG_ON = process.env.E2E_CED_ENABLED === "1";
const CODE = process.env.E2E_LIVE_EVENT_CODE;

test.describe("Vote page queue filter (song_request mode)", () => {
  test.beforeEach(() => {
    test.skip(
      !FLAG_ON || !CODE,
      "Set E2E_CED_ENABLED=1 (dev server started with the flag) and E2E_LIVE_EVENT_CODE to a live song_request event with played + accepted requests.",
    );
  });

  test("renders All / Active / Played with Active selected by default", async ({
    page,
  }) => {
    await page.goto(`/event/${CODE}/vote`);

    const group = page.getByRole("group", { name: /filter song queue/i });
    await expect(group).toBeVisible();

    await expect(group.getByRole("button", { name: "All" })).toBeVisible();
    await expect(group.getByRole("button", { name: "Active" })).toBeVisible();
    await expect(group.getByRole("button", { name: "Played" })).toBeVisible();

    await expect(group.getByRole("button", { name: "Active" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("Played filter shows played rows with a badge and disabled voting", async ({
    page,
  }) => {
    await page.goto(`/event/${CODE}/vote`);

    const group = page.getByRole("group", { name: /filter song queue/i });
    await group.getByRole("button", { name: "Played" }).click();
    await expect(group.getByRole("button", { name: "Played" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    const queue = page.getByRole("list");
    const playedRow = queue.getByRole("listitem").filter({ hasText: "Played" }).first();
    await expect(playedRow).toBeVisible();
    await expect(playedRow.getByRole("button")).toBeDisabled();
  });

  test("All filter includes more (or equal) rows than Active", async ({
    page,
  }) => {
    await page.goto(`/event/${CODE}/vote`);

    const group = page.getByRole("group", { name: /filter song queue/i });
    const rows = page.getByRole("list").getByRole("listitem");

    await group.getByRole("button", { name: "Active" }).click();
    const activeCount = await rows.count();

    await group.getByRole("button", { name: "All" }).click();
    const allCount = await rows.count();

    expect(allCount).toBeGreaterThanOrEqual(activeCount);
  });
});
