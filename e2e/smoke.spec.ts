import { expect, test } from "@playwright/test";

test("loads the app shell with icon-only header actions", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Tasklane/i);
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page.locator("header button")).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Data" })).toBeEmpty();
});

test("opens the project context menu", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New project" }).click();
  await page.getByLabel("Name").fill("E2E project");
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(page.getByRole("heading", { name: "E2E project" })).toBeVisible();
  await page.getByRole("button", { name: "Actions for E2E project" }).click();
  await expect(page.getByRole("menuitem", { name: "Edit project" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Delete" })).toBeVisible();
});
