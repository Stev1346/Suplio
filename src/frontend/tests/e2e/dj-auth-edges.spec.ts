import { test, expect } from "@playwright/test";

test("login rejects invalid credentials and does not set session", async ({ page }) => {
  await page.goto("/dj/login");
  await page.getByLabel("Email").fill("not-a-user@example.test");
  await page.locator('input[type="password"]').first().fill("wrong-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText(/invalid|incorrect/i).first()).toBeVisible();
  await expect(page).toHaveURL(/\/dj\/login/);
});

test("signup requires stage_name", async ({ page }) => {
  await page.goto("/dj/signup");
  await page.getByLabel("Email").fill(`dj+${Date.now()}@example.test`);
  await page.locator('input[type="password"]').nth(0).fill("StrongPass!234");
  await page.locator('input[type="password"]').nth(1).fill("StrongPass!234");
  await page.getByRole("button", { name: /create account/i }).click();
  const stage = page.getByRole("textbox", { name: /stage name/i });
  await expect(stage).toBeFocused();
});
