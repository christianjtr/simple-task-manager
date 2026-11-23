import { expect, test } from "@playwright/test";

test("loads the app shell with icon-only header actions", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Tasklane/i);
  await expect(page.getByTestId("sidebar-version")).toHaveText("v1");
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("main header")).toHaveCount(0);
  await expect(page.locator("header button")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Data" })).toBeEmpty();
  await page.getByRole("button", { name: "Data" }).hover();
  await expect(page.getByRole("tooltip")).toHaveText("Data export/import");

  const sider = page.getByTestId("app-sider");
  const brandBar = page.getByTestId("sidebar-brand-bar");
  const siderBox = await sider.boundingBox();
  const headerBox = await page.locator("header").boundingBox();
  const brandBarBox = await brandBar.boundingBox();
  expect(siderBox).not.toBeNull();
  expect(headerBox).not.toBeNull();
  expect(brandBarBox).not.toBeNull();
  if (!siderBox || !headerBox || !brandBarBox) throw new Error("Shell geometry unavailable");
  expect(headerBox.x).toBeGreaterThanOrEqual(siderBox.x + siderBox.width - 1);
  expect(brandBarBox.x).toBeGreaterThanOrEqual(siderBox.x - 1);
  expect(brandBarBox.x + brandBarBox.width).toBeLessThanOrEqual(siderBox.x + siderBox.width + 1);
  await expect(sider).toHaveClass(/border-r/);
  await expect(brandBar).not.toHaveClass(/border-b/);
  const siderBg = await sider.evaluate((el) => getComputedStyle(el).backgroundColor);
  const menuBg = await page
    .locator(".ant-menu-root")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(menuBg).toBe(siderBg);

  const sidebarToggle = page.getByRole("button", { name: "Toggle sidebar" });
  await expect(sidebarToggle.locator('[data-icon="double-left"]')).toBeVisible();
  await sidebarToggle.click();
  await expect(sidebarToggle.locator('[data-icon="double-right"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tasklane" })).toHaveCount(0);
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

test("opens the task context menu with distinct action and drag icons", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Load example" }).first().click();
  await expect(page.getByRole("heading", { name: "Example project" })).toBeVisible();

  const taskActions = page.getByRole("button", { name: "Actions for Define scope" });
  await expect(taskActions.locator(".anticon-ellipsis")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Drag Define scope" }).locator(".anticon-drag"),
  ).toBeVisible();

  await taskActions.click();
  await expect(page.getByRole("menuitem", { name: /edit/i })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: /delete/i })).toBeVisible();
});
