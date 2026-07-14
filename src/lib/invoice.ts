export function buildInvoiceDayKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}`;
}

/** Prefix harian per outlet, dipakai untuk menghitung urutan invoice berikutnya. */
export function buildInvoicePrefix(outletId: string, date: Date): string {
  const kodeOutlet = outletId.slice(-4).toUpperCase();
  const ymd = buildInvoiceDayKey(date);
  return `INV-${kodeOutlet}-${ymd}`;
}

/** Format: INV-{kodeOutlet}-{YYYYMMDD}-{urutan}. Contoh: INV-A1B2-20260702-003 */
export function buildInvoiceNumber(outletId: string, date: Date, sequence: number): string {
  const urutan = String(sequence).padStart(3, "0");
  return `${buildInvoicePrefix(outletId, date)}-${urutan}`;
}
