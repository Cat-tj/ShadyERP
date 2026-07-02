const rupiahNumberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

/** Satu-satunya cara format uang di aplikasi ini. Contoh: formatRupiah(25000) -> "Rp25.000" */
export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}Rp${rupiahNumberFormatter.format(Math.abs(rounded))}`;
}

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

/** Contoh: formatTanggal(new Date()) -> "Sen, 2 Jul 2026" */
export function formatTanggal(date: Date | string): string {
  return tanggalFormatter.format(new Date(date));
}

const tanggalPendekFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

/** Contoh: formatTanggalPendek(new Date()) -> "2 Jul 2026" */
export function formatTanggalPendek(date: Date | string): string {
  return tanggalPendekFormatter.format(new Date(date));
}

const jamFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

/** Contoh: formatJam(new Date()) -> "14.30" */
export function formatJam(date: Date | string): string {
  return jamFormatter.format(new Date(date));
}
