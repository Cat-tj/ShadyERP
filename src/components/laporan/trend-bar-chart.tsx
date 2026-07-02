"use client";

import { useState } from "react";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";

export type TrendPoint = { date: string; omzet: number };

function shortAxisLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00+07:00`);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "numeric", timeZone: "Asia/Jakarta" }).format(d);
}

export function TrendBarChart({ data }: { data: TrendPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.omzet));
  const height = 180;
  const gap = 2;
  const barWidth = 100 / data.length;
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  const hovered = hoverIndex != null ? data[hoverIndex] : null;

  return (
    <div>
      <div className="mb-2 flex h-6 items-center">
        {hovered && (
          <p className="text-sm font-medium text-[var(--color-text)]">
            {formatTanggalPendek(hovered.date)} ·{" "}
            <span className="tabular-nums">{formatRupiah(hovered.omzet)}</span>
          </p>
        )}
      </div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-44 w-full" role="img">
        <line x1="0" y1={height - 1} x2="100" y2={height - 1} stroke="var(--color-border)" strokeWidth="0.5" />
        {data.map((d, i) => {
          const barHeight = (d.omzet / max) * (height - 12);
          const x = i * barWidth + gap / 2;
          const w = Math.max(0.5, barWidth - gap);
          const isHovered = hoverIndex === i;
          return (
            <rect
              key={d.date}
              x={x}
              y={height - 1 - barHeight}
              width={w}
              height={barHeight}
              rx={w > 2 ? 1 : 0}
              fill="var(--color-primary)"
              opacity={hoverIndex === null || isHovered ? 1 : 0.55}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          );
        })}
      </svg>
      <div className="mt-1 flex text-xs text-[var(--color-text-secondary)]">
        {data.map((d, i) => (
          <div key={d.date} style={{ width: `${barWidth}%` }} className="shrink-0 text-center">
            {i % labelEvery === 0 ? shortAxisLabel(d.date) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
