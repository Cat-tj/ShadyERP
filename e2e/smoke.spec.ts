import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke test jalur kritis, jalan terhadap demo tenant "Kopi Nusantara"
 * (lihat prisma/seed.ts). Urutan dibuat serial karena test transaksi &
 * tutup shift sama-sama gantung ke satu shift kasir yang sama di database
 * (bukan cuma state di browser), jadi harus jalan berurutan.
 */

const STAFF_EMAIL = "staff1@demo.id";
const PASSWORD = "password123";

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/pilih-aplikasi/);
}

async function openKasir(page: Page) {
  await page.click("text=Kasir");
  await page.waitForURL(/\/kasir$/);
}

/** Buka shift kalau belum ada shift yang jalan buat kasir ini. */
async function ensureShiftOpen(page: Page) {
  const openShiftForm = page.getByText("Buka shift kasir");
  if ((await openShiftForm.count()) > 0) {
    await page.locator('input:not([type="hidden"])').first().fill("100000");
    await page.click('button:has-text("Buka shift")');
    await page.waitForTimeout(1000);
  }
}

test.describe.configure({ mode: "serial" });

test.describe("Smoke test: jalur kritis", () => {
  test("login staff kasir sampai ke pilih aplikasi", async ({ page }) => {
    await login(page, STAFF_EMAIL);
    await expect(page).toHaveURL(/\/pilih-aplikasi/);
    await expect(page.getByText("Kasir", { exact: true })).toBeVisible();
  });

  test("transaksi kasir: buka shift, jual produk, bayar tunai", async ({ page }) => {
    await login(page, STAFF_EMAIL);
    await openKasir(page);
    await ensureShiftOpen(page);

    await page.locator('[aria-label="Tambah 1 Air Mineral"]').click();
    await page.click('button:has-text("Lihat Invoice")');
    // Sheet keranjang punya tombol "Bayar Rp..." yang baru membuka modal Pembayaran.
    await page.click('button:has-text("Bayar")');
    // Tombol cepat "Uang pas" langsung isi nominal diterima = total belanja.
    await page.click('button:has-text("Uang pas")');
    await page.click('button:has-text("Selesaikan Transaksi")');

    await expect(page).toHaveURL(/\/kasir\/struk\//, { timeout: 15000 });
    await expect(page.getByText(/Air Mineral/)).toBeVisible();
  });

  test("tutup shift kasir", async ({ page }) => {
    await login(page, STAFF_EMAIL);
    await openKasir(page);
    await ensureShiftOpen(page);

    await page.click("text=Tutup shift");
    await page.waitForURL(/\/kasir\/tutup$/);

    // Default-nya kalkulator pecahan uang — pindah ke mode isi total langsung biar gampang diisi skrip.
    await page.click('button:has-text("Isi total langsung")');

    // Isi persis sama dengan "Harus ada di laci" biar gak ada selisih kas
    // (selisih > Rp10.000 butuh catatan tambahan, di luar scope smoke test ini).
    const expectedCashText = await page
      .locator('span:has-text("Harus ada di laci")')
      .locator("xpath=following-sibling::span[1]")
      .textContent();
    const expectedCash = Number((expectedCashText ?? "0").replace(/[^\d]/g, ""));
    await page.fill("#displayClosingCash", String(expectedCash));
    await page.click('button:has-text("Tutup shift")');

    await expect(page).toHaveURL(/\/kasir\/tutup\/selesai\//, { timeout: 15000 });
  });
});
