"use client";

import { useState } from "react";
import { formatRupiah, formatRupiahCompact } from "@/lib/format";

export type SalesTrendPoint = { label: string; value: number };

export function SalesTrendChart({
  data,
  insight,
}: {
  data: SalesTrendPoint[];
  insight?: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const height = 160;
  const max = Math.max(1, ...data.map((d) => d.value));
  const hovered = hoverIndex != null ? data[hoverIndex] : null;

  const points = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * 100 : 50,
    y: height - (d.value / max) * (height - 16) - 8,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 1
      ? `${linePath} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`
      : "";
  const yTicks = [max, max / 2, 0];
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return (
    <div>
      <div className="mb-2 flex h-6 items-center">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {hovered ? (
            <>
              {hovered.label} · <span className="tabular-nums">{formatRupiah(hovered.value)}</span>
            </>
          ) : (
            <span className="text-[var(--color-text-secondary)]">Arahkan kursor untuk detail</span>
          )}
        </p>
      </div>
      <div className="flex gap-2">
        <div className="flex h-40 shrink-0 flex-col justify-between text-right text-[10px] leading-none text-[var(--color-text-muted)]">
          {yTicks.map((t, i) => (
            <span key={i}>{formatRupiahCompact(t)}</span>
          ))}
        </div>
        <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-40 flex-1" role="img">
          <line x1="0" y1={height - 8} x2="100" y2={height - 8} stroke="var(--color-border)" strokeWidth="0.5" />
          {points.length > 1 && <path d={areaPath} fill="var(--color-primary-soft)" stroke="none" />}
          {points.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 2 : 1.2}
              fill="var(--color-primary)"
            />
          ))}
          {data.map((_, i) => {
            const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50;
            const w = 100 / data.length;
            return (
              <rect
                key={`hit-${i}`}
                x={Math.max(0, x - w / 2)}
                y={0}
                width={w}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-1 flex pl-9 text-xs text-[var(--color-text-secondary)]">
        {data.map((d, i) => (
          <div key={d.label + i} style={{ width: `${100 / data.length}%` }} className="shrink-0 text-center">
            {i % labelEvery === 0 ? d.label : ""}
          </div>
        ))}
      </div>
      {insight && <p className="mt-3 text-xs text-[var(--color-text-secondary)]">{insight}</p>}
    </div>
  );
}
