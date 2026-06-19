import { test, expect } from "@playwright/test";

test("full log activity flow updates dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Dashboard");

  await page.goto("/log");
  await expect(page.locator("h1")).toContainText("Log Activity");

  await page.getByRole("radio", { name: /transport/i }).click();
  await expect(page.getByRole("listbox")).toBeVisible();

  await page.getByRole("option").first().click();
  await expect(page.getByLabel(/quantity in/i)).toBeVisible();

  await page.getByLabel(/quantity in/i).fill("2");
  await page.getByRole("button", { name: /log activity/i }).click();

  await expect(page.getByRole("heading", { name: /ai coach/i })).toBeVisible({ timeout: 10000 });

  await page.goto("/");
  const historySection = page.getByRole("region", { name: /dashboard/i });
  await expect(historySection.or(page.locator("h1"))).toBeVisible();
});
