"use client";

import { formatRupiah } from "@/lib/format";
import { GlassPanel } from "@/components/ui/glass-panel";
import { TrendingUpIcon, TrendingDownIcon } from "@/components/ui/icons";

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number; // percentage
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function KPICard({ label, value, change, icon: Icon }: KPICardProps) {
  const isPositive = change ? change >= 0 : true;

  return (
    <GlassPanel className="rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
          <p className="font-mono-data mt-2 text-2xl font-bold text-[var(--color-text)]">
            {typeof value === "number" ? formatRupiah(value) : value}
          </p>
          {change !== undefined && (
            <div className={`mt-1 flex items-center gap-1 text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
              <span>{Math.abs(change)}% vs bulan lalu</span>
            </div>
          )}
        </div>
        {Icon && <Icon className="h-8 w-8 text-[var(--color-primary)]/50" />}
      </div>
    </GlassPanel>
  );
}

interface KPIMeterProps {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  color?: string;
}

export function KPIMeter({ label, value, max, suffix = "%", color = "bg-[var(--color-primary)]" }: KPIMeterProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <GlassPanel className="rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
        <span className="font-mono-data text-lg font-bold text-[var(--color-text)]">
          {value}
          {suffix}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface)]">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </GlassPanel>
  );
}
