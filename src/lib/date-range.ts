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
