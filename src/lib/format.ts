const rupiahNumberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

/** Satu-satunya cara format uang di aplikasi ini. Contoh: formatRupiah(25000) -> "Rp25.000" */
export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}Rp${rupiahNumberFormatter.format(Math.abs(rounded))}`;
}

const rupiahCompactScaleFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

/** Format ringkas untuk KPI card. Contoh: formatRupiahCompact(24800000) -> "Rp 24,8 jt" */
export function formatRupiahCompact(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  const abs = Math.abs(rounded);

  let divisor = 1;
  let unit = "";
  if (abs >= 1_000_000_000) {
    divisor = 1_000_000_000;
    unit = " M";
  } else if (abs >= 1_000_000) {
    divisor = 1_000_000;
    unit = " jt";
  } else if (abs >= 1_000) {
    divisor = 1_000;
    unit = " rb";
  } else {
    return formatRupiah(amount);
  }

  return `${sign}Rp ${rupiahCompactScaleFormatter.format(abs / divisor)}${unit}`;
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

/** Contoh: formatRelativeTime(new Date(Date.now() - 5 * 60_000)) -> "5 menit lalu" */
export function formatRelativeTime(date: Date | string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffSec = Math.max(0, Math.round(diffMs / 1000));

  if (diffSec < 60) return "Baru saja";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return formatTanggalPendek(date);
}
