const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Rentang awal-akhir "hari ini" (00.00–23.59 WIB) dalam UTC, untuk query database. */
export function todayRangeJakarta(reference: Date = new Date()): { start: Date; end: Date } {
  const jakartaNow = new Date(reference.getTime() + JAKARTA_OFFSET_MS);
  const y = jakartaNow.getUTCFullYear();
  const m = jakartaNow.getUTCMonth();
  const d = jakartaNow.getUTCDate();
  const startUtcMs = Date.UTC(y, m, d, 0, 0, 0) - JAKARTA_OFFSET_MS;
  return { start: new Date(startUtcMs), end: new Date(startUtcMs + 24 * 60 * 60 * 1000) };
}

export function daysAgoRangeJakarta(days: number, reference: Date = new Date()) {
  const { start } = todayRangeJakarta(reference);
  return { start: new Date(start.getTime() - days * 24 * 60 * 60 * 1000), end: todayRangeJakarta(reference).end };
}

/**
 * Helper tanggal murni (tanpa dependency date-fns) untuk service analitik
 * yang perlu batas hari/bulan dalam waktu server-local — dipakai di
 * kpi-service, finance-analytics-service, hr-analytics-service.
 */
export function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function subMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}
