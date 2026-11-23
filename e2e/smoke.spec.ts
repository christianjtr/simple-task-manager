import { expect, test } from "@playwright/test";

test("loads the app shell", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Tasklane/i);
  await expect(page.locator("#root")).not.toBeEmpty();
});
