import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const output = new URL("../docs/landing-showcase-screenshots/", import.meta.url);
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3010";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const [device, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const showcase = page.locator("#ekosistem");
  await showcase.scrollIntoViewIfNeeded();
  const tabs = showcase.getByRole("tab");
  const count = await tabs.count();
  for (let index = 0; index < count; index += 1) {
    const tab = tabs.nth(index);
    const label = (await tab.innerText()).toLowerCase().replace(/\s+/g, "-");
    await tab.click();
    await page.waitForTimeout(500);
    await showcase.screenshot({ path: fileURLToPath(new URL(`${device}-${String(index + 1).padStart(2, "0")}-${label}.png`, output)) });
  }
  await page.close();
}
await browser.close();
console.log("Captured business showcase screenshots.");
