import { test, expect } from "@playwright/test";

test("set goal and complete a challenge", async ({ page }) => {
  await page.goto("/goals");
  await expect(page.locator("h1")).toContainText("Goals");

  await page.getByLabel(/target/i).fill("150");
  await page.getByRole("button", { name: /set goal/i }).click();
  await expect(page.getByRole("progressbar").first()).toBeVisible();

  const firstChallenge = page.getByRole("checkbox").first();
  await firstChallenge.click();
  await expect(firstChallenge).toHaveAttribute("aria-checked", "true");
});
