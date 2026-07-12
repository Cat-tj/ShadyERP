import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PLAYWRIGHT_PORT ?? "3311";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Smoke test minimal — jalur kritis (login, transaksi kasir, tutup shift).
 * Butuh dev server + database yang sudah di-seed (`npm run seed`), sama
 * seperti demo tenant "Kopi Nusantara" (owner@demo.id / password123).
 * Kalau PLAYWRIGHT_BASE_URL diisi (mis. nunjuk ke server yang udah jalan),
 * webServer di bawah dilewati — Playwright langsung pakai server itu.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npx next dev -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 60_000,
      },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Override kalau environment cuma punya browser full Chromium (bukan
        // chrome-headless-shell bawaan `npx playwright install`), mis. sandbox CI tertentu.
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
          : undefined,
      },
    },
  ],
});
