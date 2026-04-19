import { test, expect } from "@playwright/test";

async function loginAsDj(page: import("@playwright/test").Page) {
  const email = process.env.E2E_DJ_EMAIL;
  const password = process.env.E2E_DJ_PASSWORD;

  test.skip(
    !email || !password,
    "Set E2E_DJ_EMAIL and E2E_DJ_PASSWORD to run authenticated nav test."
  );

  await page.goto("/dj/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dj\/dashboard/);
}

test("guest event nav shows event-local links", async ({ page }) => {
  await page.goto("/event/demo");
  await expect(page.getByRole("link", { name: "Scan" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Request" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Vote" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Are you a DJ?" })).toBeVisible();
});

test("unauthenticated DJ private route redirects to login", async ({ page }) => {
  await page.goto("/dj/dashboard");
  await expect(page).toHaveURL(/\/dj\/login/);
});

test("authenticated DJ private route hides guest shell and shows DJ nav", async ({ page }) => {
  await loginAsDj(page);
  await page.goto("/dj/dashboard");

  await expect(page.getByRole("link", { name: "Are you a DJ?" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "My Events" })).toBeVisible();
});

test("new DJ subroutes default to private access", async ({ page }) => {
  await page.goto("/dj/analytics");
  await expect(page).toHaveURL(/\/dj\/login/);
});