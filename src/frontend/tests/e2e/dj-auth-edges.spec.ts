import { test, expect } from "@playwright/test";

test("login rejects invalid credentials and does not set session (strict payload)", async ({ page, context }) => {
  const res = await page.request.post("/auth/sign-in", {
    data: {
      email: "invalid-user@example.test",
      password: "definitely-wrong-password",
    },
  });

  expect(res.status()).toBe(401);
  await expect(res.json()).resolves.toEqual({
    error: "Invalid login credentials",
  });

  // Failed auth must not set the DJ session-bound cookie
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "dj_session_started_at")).toBeUndefined();
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
