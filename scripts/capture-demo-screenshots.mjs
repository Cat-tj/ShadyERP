import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const baseUrl = "http://127.0.0.1:3004";
const outputDir = new URL("../docs/panduan-pengguna/screenshots/", import.meta.url);

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
await page.locator('input[name="email"]').fill("owner@demo.id");
await page.locator('input[name="password"]').fill("password123");
await Promise.all([
  page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 15_000 }),
  page.getByRole("button", { name: "Masuk" }).click(),
]);

await page.goto(`${baseUrl}/kasir`, { waitUntil: "networkidle" });
if (await page.getByRole("button", { name: /Buka shift/ }).count()) {
  await page.locator("#displayOpeningCash").fill("200000");
  await page.getByRole("button", { name: /Buka shift/ }).click();
  await page.waitForFunction(() => !document.body.innerText.includes("Buka shift kasir"), undefined, { timeout: 15_000 });
}

const sizes = [
  ["kasir-desktop.png", { width: 1440, height: 720 }],
  ["kasir-tablet.png", { width: 834, height: 900 }],
  ["kasir-mobile.png", { width: 390, height: 844 }],
];

for (const [fileName, viewport] of sizes) {
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/kasir`, { waitUntil: "networkidle" });
  await page.getByLabel("Tambah 1 Americano").click();
  await page.getByLabel("Tambah 1 Kopi Susu").click();
  await page.getByLabel("Tambah 1 Croissant").click();
  await page.screenshot({ path: fileURLToPath(new URL(fileName, outputDir)), fullPage: false });
}

await browser.close();
console.log("Captured POS screenshots in docs/panduan-pengguna/screenshots");
