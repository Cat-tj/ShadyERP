export type CsvColumn<T> = { key: keyof T; label: string };

function escapeCsvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((col) => escapeCsvCell(col.label)).join(",");
  const lines = rows.map((row) => columns.map((col) => escapeCsvCell(row[col.key])).join(","));
  return [header, ...lines].join("\r\n");
}

const BOM = "﻿";

/** BOM di depan supaya Excel langsung baca UTF-8 dengan benar (mis. simbol mata uang). */
export function csvResponse(csv: string, filename: string): Response {
  return new Response(BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
