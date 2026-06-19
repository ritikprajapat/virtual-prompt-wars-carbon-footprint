import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/", "/log", "/insights", "/goals"];

for (const url of PAGES) {
  test(`${url} has no accessibility violations`, async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
