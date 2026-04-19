import { test, expect } from "@playwright/test";

test.describe("DJ event management (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.E2E_DJ_EMAIL;
    const password = process.env.E2E_DJ_PASSWORD;
    test.skip(!email || !password, "Set E2E_DJ_EMAIL / E2E_DJ_PASSWORD.");
    await page.goto("/dj/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dj\/dashboard/);
  });

  test("lifecycle filter updates the list", async ({ page }) => {
    await page.goto("/dj/events");
    await page.getByRole("combobox", { name: /lifecycle/i }).click();
    await page.getByRole("option", { name: /archived/i }).click();
    await expect(page).toHaveURL(/lifecycle=archived|[?&]lifecycle=/);
  });
});