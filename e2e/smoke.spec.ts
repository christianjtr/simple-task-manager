import { expect, test } from "@playwright/test";

test("loads the app shell", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Task Management/i);
  await expect(page.locator("#root")).not.toBeEmpty();
});
